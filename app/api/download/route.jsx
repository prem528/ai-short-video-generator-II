import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    console.log(`[Download Proxy] Fetching URL: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from source: ${response.status} ${response.statusText}`);
    }

    const fileBuffer = await response.arrayBuffer();
    
    // Parse filename from URL if possible
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const baseName = pathname.substring(pathname.lastIndexOf("/") + 1) || `video-${Date.now()}.mp4`;
    const decodedName = decodeURIComponent(baseName);
    
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "video/mp4");
    headers.set("Content-Disposition", `attachment; filename="${decodedName}"`);

    return new NextResponse(Buffer.from(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[Download Proxy] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
