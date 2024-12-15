import { storage } from "@/configs/FirebaseConfig";
import textToSpeech from "@google-cloud/text-to-speech";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { NextResponse } from "next/server";

const fs = require("fs");
const util = require("util");

const client = new textToSpeech.TextToSpeechClient({
  apiKey: process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY,
});

export async function POST(req) {
  const { text, id } = await req.json();
  const storageRef = ref(storage, "/ai-video-file/" + id + ".mp3");

  const request = {
    input: { text: text },
    voice: { languageCode: "en-US", ssmlGender: "FEMALE" },
    audioConfig: { audioEncoding: "MP3" },
  };

  try {
    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    console.log("Text-to-speech request successful.");

    const audioBuffer = Buffer.from(response.audioContent, "binary");

    // Upload audio to Firebase Storage
    const uploadResponse = await uploadBytes(storageRef, audioBuffer, {
      contentType: "audio/mp3",
    });
    console.log("Audio uploaded successfully:", uploadResponse);

    // Retrieve the download URL
    const downloadUrl = await getDownloadURL(storageRef);
    console.log("Audio download URL:", downloadUrl);

    return NextResponse.json({ Result: downloadUrl });
  } catch (error) {
    console.error("Error generating or uploading audio:", error);
    return NextResponse.json({ error: error.message });
  }
}