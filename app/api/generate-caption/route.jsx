import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Parse the request body
    const { audioFileUrl } = await req.json();

    // Validate the input
    if (!audioFileUrl) {
      return NextResponse.json(
        { error: "audioFileUrl is required" },
        { status: 400 }
      );
    }

    // Validate environment variable
    if (!process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY) {
      return NextResponse.json(
        { error: "AssemblyAI API key is not configured" },
        { status: 500 }
      );
    }

    // Initialize AssemblyAI client
    const client = new AssemblyAI({
      apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,
    });

    // Prepare data for transcription
    const data = { audio: audioFileUrl, language_detection: true };

    // Transcribe audio file
    const transcript = await client.transcripts.transcribe(data);

    // Respond with transcript words
    return NextResponse.json({ result: transcript.words });
  } catch (error) {
    console.error("Error in transcription:", error);

    // Respond with a generic error message
    return NextResponse.json(
      { error: "Failed to process the transcription request" },
      { status: 500 }
    );
  }
}
