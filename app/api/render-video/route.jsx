"use server";

import { getServices, renderMediaOnCloudrun } from "@remotion/cloudrun/client";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function POST(req) {
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
        const renderCommand = `npx remotion render remotion/index.jsx video-result "${outputVideoPath}" --props="${tempJsonPath}" --frames=0-${durationInFrames - 1}`;
        
        await execPromise(renderCommand, { cwd: process.cwd() });
        
        // Clean up temporary props file
        try {
          fs.unlinkSync(tempJsonPath);
        } catch (e) {}

        console.log(`[Local Render] Success: ${outputVideoPath}`);

        return new Response(
          JSON.stringify({
            bucketName: "local",
            renderId: uniqueId,
            publicUrl: `/renders/${uniqueId}.mp4`,
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
      return new Response(
        JSON.stringify({
          bucketName: result.bucketName,
          renderId: result.renderId,
          publicUrl: result.publicUrl,
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
