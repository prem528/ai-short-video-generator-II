"use server";

import { getServices, renderMediaOnCloudrun } from "@remotion/cloudrun/client";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { storage } from "@/configs/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const execPromise = promisify(exec);

// Helper to delete temporary workspace files and voiceovers after final rendering compiles
const cleanUpTempAssets = async (videoData, originalAudioUrl) => {
  try {
    // 1. Delete local temporary uploaded scene files
    if (videoData.script?.isAssembleFlow && Array.isArray(videoData.script.mediaList)) {
      for (const item of videoData.script.mediaList) {
        if (item.url && item.url.startsWith("/temp-assets/")) {
          const localPath = path.join(process.cwd(), "public", item.url);
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
            console.log(`[Cleanup] Deleted local temporary asset: ${localPath}`);
          }
        }
      }
    }

    // 2. Do NOT delete the Firebase audio file, as the Remotion Player in the dashboard
    // and subsequent re-renders require it to play the preview.


    // 3. Delete ONLY local temporary audio download cache file (created solely to speed up rendering)
    if (videoData.audioFileUrl && videoData.audioFileUrl.startsWith("/temp-assets/")) {
      const localAudioPath = path.join(process.cwd(), "public", videoData.audioFileUrl);
      if (fs.existsSync(localAudioPath)) {
        fs.unlinkSync(localAudioPath);
        console.log(`[Cleanup] Deleted local temporary audio cache: ${localAudioPath}`);
      }
    }
  } catch (cleanupError) {
    console.error("[Cleanup] Non-blocking warning: failed to clean up temporary assets:", cleanupError.message);
  }
};

// Helper to save finalVideoUrl to database on the server side to guarantee state consistency
const saveFinalVideoUrlToDb = async (videoId, script, publicUrl) => {
  if (!videoId) return;
  try {
    const { db } = await import("@/configs/db");
    const { VideoData } = await import("@/configs/schema");
    const { eq } = await import("drizzle-orm");

    const updatedScript = {
      ...script,
      finalVideoUrl: publicUrl
    };
    await db
      .update(VideoData)
      .set({ 
        script: updatedScript,
        finalVideoUrl: publicUrl
      })
      .where(eq(VideoData.id, videoId));
    console.log(`[Database] Successfully saved finalVideoUrl to database column for video ID: ${videoId}`);
  } catch (dbErr) {
    console.error("[Database] Failed to save finalVideoUrl to database on server:", dbErr.message);
  }
};

export async function POST(req) {
  let originalAudioUrl = "";
  try {
    const body = await req.json();
    const { videoData } = body;

    if (!videoData) {
      return new Response(JSON.stringify({ message: "Missing video data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id: videoId, durationInFrames } = videoData;

    // --- LOCAL CACHING OF VOICEVOVER AUDIO ---
    // If the audio URL is a remote Firebase URL, download it locally to optimize Remotion frame seeking
    if (videoData.audioFileUrl && videoData.audioFileUrl.startsWith("http")) {
      originalAudioUrl = videoData.audioFileUrl;
      try {
        console.log(`[Local Render] Downloading voiceover audio from Firebase to speed up rendering...`);
        const response = await fetch(originalAudioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const tempDir = path.join(process.cwd(), "public", "temp-assets");
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const audioFilename = `render_${Date.now()}_voiceover.wav`;
        const localAudioPath = path.join(tempDir, audioFilename);
        await fs.promises.writeFile(localAudioPath, buffer);

        // Mutate videoData.audioFileUrl to reference the local cached path
        videoData.audioFileUrl = `/temp-assets/${audioFilename}`;
        console.log(`[Local Render] Audio cached locally at: ${videoData.audioFileUrl}`);
      } catch (audioCacheErr) {
        console.error("[Local Render] Non-blocking audio caching failed:", audioCacheErr.message);
      }
    }

    // --- LOCAL RENDERING PIPELINE (Runs without GCP) ---
    if (process.env.RENDER_LOCALLY === "true") {
      const uniqueId = videoId || `temp-${Date.now()}`;
      const tempJsonPath = path.resolve(`./public/temp-${uniqueId}.json`);
      const outputVideoPath = path.resolve(`./public/renders/${uniqueId}.mp4`);

      // Ensure folders exist
      fs.mkdirSync(path.dirname(tempJsonPath), { recursive: true });
      fs.mkdirSync(path.dirname(outputVideoPath), { recursive: true });

      // Save props to temporary JSON file to prevent command line escaping errors on Windows
      fs.writeFileSync(tempJsonPath, JSON.stringify(videoData));

      try {
        console.log(`[Local Render] Rendering video ID: ${uniqueId} (${durationInFrames} frames) locally...`);
        const renderCommand = `npx remotion render remotion/index.jsx video-result "${outputVideoPath}" --props="${tempJsonPath}" --frames=0-${durationInFrames - 1} --browser-cache=true`;
        
        await execPromise(renderCommand, { cwd: process.cwd() });
        
        // Clean up temporary props file
        try {
          fs.unlinkSync(tempJsonPath);
        } catch (e) {}

        console.log(`[Local Render] Success: ${outputVideoPath}`);
        
        // Upload the compiled video to Firebase Storage
        let firebaseVideoUrl = `/renders/${uniqueId}.mp4`;
        try {
          console.log(`[Local Render] Reading output video file for Firebase upload: ${outputVideoPath}`);
          const videoBuffer = fs.readFileSync(outputVideoPath);
          const storageRef = ref(storage, `/ai-video-file/${uniqueId}.mp4`);
          console.log(`[Local Render] Uploading video to Firebase Storage...`);
          await uploadBytes(storageRef, videoBuffer, { contentType: "video/mp4" });
          firebaseVideoUrl = await getDownloadURL(storageRef);
          console.log(`[Local Render] Successfully uploaded to Firebase: ${firebaseVideoUrl}`);

          // Clean up the local compiled video file to save disk space
          try {
            fs.unlinkSync(outputVideoPath);
            console.log(`[Local Render] Deleted local video file after Firebase upload: ${outputVideoPath}`);
          } catch (unlinkErr) {
            console.warn("[Local Render] Warning: failed to delete local compiled video:", unlinkErr.message);
          }
        } catch (uploadError) {
          console.error("[Local Render] Error uploading video to Firebase storage:", uploadError.message);
        }

        // Save the compiled video URL to database
        await saveFinalVideoUrlToDb(videoId, videoData.script, firebaseVideoUrl);

        // Trigger temporary assets cleanup asynchronously
        cleanUpTempAssets(videoData, originalAudioUrl);

        return new Response(
          JSON.stringify({
            bucketName: "local",
            renderId: uniqueId,
            publicUrl: firebaseVideoUrl,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (renderError) {
        // Clean up temporary props file on failure
        try {
          fs.unlinkSync(tempJsonPath);
        } catch (e) {}

        console.error("[Local Render] Failed:", renderError.message);
        return new Response(
          JSON.stringify({
            message: "Local render failed",
            details: renderError.message,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // --- GCP CLOUD RUN PIPELINE ---
    const services = await getServices({
      region: "us-east1",
      compatibleOnly: false,
    });

    if (!services.length) {
      return new Response(
        JSON.stringify({
          message: "No compatible services found in the specified region.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const serviceName = services[0].serviceName;

    const result = await renderMediaOnCloudrun({
      serviceName,
      region: "us-east1",
      serveUrl: process.env.REMOTION_GCP_SERVE_URL,
      composition: "video-result",
      inputProps: { ...videoData },
      codec: "h264",
      delayRenderTimeoutInMilliseconds: 900000,
      privacy: "public",
      frameRange: [0, durationInFrames],
      downloadBehavior: { type: "download", fileName: "download.mp4" },
    });

    if (result.type === "success") {
      // Download the GCP-rendered video and re-upload to Firebase
      let finalUrl = result.publicUrl;
      try {
        console.log(`[GCP Render] Downloading GCP-rendered video to upload to Firebase: ${result.publicUrl}`);
        const response = await fetch(result.publicUrl);
        const arrayBuffer = await response.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);

        const storageRef = ref(storage, `/ai-video-file/${result.renderId}.mp4`);
        console.log(`[GCP Render] Uploading video to Firebase Storage...`);
        await uploadBytes(storageRef, videoBuffer, { contentType: "video/mp4" });
        finalUrl = await getDownloadURL(storageRef);
        console.log(`[GCP Render] Successfully uploaded to Firebase: ${finalUrl}`);
      } catch (gcpUploadErr) {
        console.error("[GCP Render] Failed to re-upload GCP video to Firebase:", gcpUploadErr.message);
      }

      // Save the compiled video URL to database
      await saveFinalVideoUrlToDb(videoId, videoData.script, finalUrl);

      // Trigger temporary assets cleanup asynchronously
      cleanUpTempAssets(videoData, originalAudioUrl);

      return new Response(
        JSON.stringify({
          bucketName: result.bucketName,
          renderId: result.renderId,
          publicUrl: finalUrl,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Render failed",
          details: result.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error during rendering:", error.message);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
