import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create temp-assets directory inside public if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "temp-assets");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Sanitize filename and append timestamp
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}_${safeName}`;
    const filePath = path.join(uploadDir, filename);

    // Write file buffer directly to local disk (no compression to preserve original quality)
    await fs.promises.writeFile(filePath, buffer);

    // Return the relative URL of the saved asset
    const localUrl = `/temp-assets/${filename}`;

    return NextResponse.json({ Result: localUrl }, { status: 200 });
  } catch (error) {
    console.error("Local file upload error:", error);
    return NextResponse.json(
      { message: "Server error during local upload", details: error.message },
      { status: 500 }
    );
  }
}
