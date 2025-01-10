"use server";

import { db } from "@/configs/db";
import { VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  const { videoId } = await req.json(); // Get the videoId from the request body

  try {
    // Delete the video from the Neon database
    const result = await db.delete(VideoData).where(eq(VideoData.id, videoId));

    if (result.count === 0) {
      return new NextResponse(JSON.stringify({ message: "Video not found" }), {
        status: 404,
      });
    }

    // Optionally, you can add additional logic here to delete any associated files (e.g., from storage)

    return new NextResponse(
      JSON.stringify({ message: "Video deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting video:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error deleting video", error: error.message }),
      { status: 500 }
    );
  }
}
