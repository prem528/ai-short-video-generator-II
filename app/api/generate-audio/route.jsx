import { storage } from "@/configs/FirebaseConfig";
import { synthesize } from "@/lib/tts";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text, id, language, gender } = await req.json();

    if (!text || !id || !language) {
      return NextResponse.json(
        { error: "text, id and language are required" },
        { status: 400 }
      );
    }

    // Engine selection (Voicebox vs Google) lives in lib/tts.
    const { buffer, contentType, extension, provider } = await synthesize({
      text,
      language,
      gender,
    });

    // Audio must live at a public URL: AssemblyAI fetches it for captions and
    // Remotion loads it as the <Audio> source when rendering.
    const storageRef = ref(storage, `/ai-video-file/${id}.${extension}`);
    await uploadBytes(storageRef, buffer, { contentType });
    const downloadUrl = await getDownloadURL(storageRef);

    console.log(`[generate-audio] ${id} synthesized via ${provider} (${contentType})`);

    return NextResponse.json({ Result: downloadUrl, provider });
  } catch (error) {
    console.error("Error generating or uploading audio:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
