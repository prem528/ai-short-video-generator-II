"use server";

import { getServices, renderMediaOnCloudrun } from "@remotion/cloudrun/client";

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

    const { durationInFrames } = videoData;

    const services = await getServices({
      region: "us-east1",
      compatibleOnly: true,
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
