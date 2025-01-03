import { NextResponse } from "next/server";
import { VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export async function GET(request) {
  const sql = neon(process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL);
  const db = drizzle(sql);

  try {
    // Extract `videoId` from the query parameters
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");

    // Validate the `videoId` parameter
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Fetch video data from the database using Drizzle ORM
    const result = await db
      .select()
      .from(VideoData)
      .where(eq(VideoData.id, videoId));

    // Check if video data exists
    if (!result.length) {
      return NextResponse.json(
        { error: "No video data found for the given Video ID." },
        { status: 404 }
      );
    }

    // Return the fetched video data
    return NextResponse.json({ videoData: result[0] }, { status: 200 });
  } catch (error) {
    // Handle any errors during the database operation
    console.error("Error fetching video data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
