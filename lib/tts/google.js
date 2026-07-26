/**
 * Google Cloud Text-to-Speech — the original engine, kept as a fallback.
 *
 * Two reasons this stays: it covers the nine languages Voicebox's engines can't
 * speak yet, and it keeps a dead TTS box from breaking video generation.
 */

import textToSpeech from "@google-cloud/text-to-speech";
import { GOOGLE_LANGUAGE_CODES, normalizeGender } from "./profiles";

let client;

function getClient() {
  if (!client) {
    client = new textToSpeech.TextToSpeechClient({
      apiKey: process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY,
    });
  }
  return client;
}

/** @returns {Promise<{ buffer: Buffer, contentType: string }>} */
export async function synthesize({ text, language, gender }) {
  const languageCode = GOOGLE_LANGUAGE_CODES[language];
  if (!languageCode) throw new Error(`Unsupported language: ${language}`);

  const [response] = await getClient().synthesizeSpeech({
    input: { text },
    voice: { languageCode, ssmlGender: normalizeGender(gender) },
    audioConfig: { audioEncoding: "MP3" },
  });

  return {
    buffer: Buffer.from(response.audioContent, "binary"),
    contentType: "audio/mp3",
  };
}
