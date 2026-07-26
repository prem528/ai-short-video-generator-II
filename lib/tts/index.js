/**
 * TTS provider router.
 *
 * Callers ask for speech; this module decides who produces it. Phase 1 routes
 * English to the self-hosted Voicebox service and everything else to Google,
 * falling back to Google whenever the local path can't serve the request.
 *
 * See docs/VOICEBOX_INTEGRATION.md
 */

import * as google from "./google";
import * as voicebox from "./voicebox";
import { resolveLocalVoice } from "./profiles";

const EXTENSIONS = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/ogg": "ogg",
  "audio/flac": "flac",
};

function extensionFor(contentType) {
  const type = String(contentType).split(";")[0].trim().toLowerCase();
  return EXTENSIONS[type] || "wav";
}

/**
 * Produce a voiceover.
 *
 * @param {{ text: string, language: string, gender: string }} params
 * @returns {Promise<{ buffer: Buffer, contentType: string, extension: string, provider: string }>}
 */
export async function synthesize({ text, language, gender }) {
  if (!text?.trim()) throw new Error("text is required");

  const localVoice =
    process.env.TTS_PROVIDER === "voicebox" ? resolveLocalVoice(language, gender) : null;

  if (localVoice) {
    try {
      const { buffer, contentType } = await voicebox.synthesize({
        text,
        languageCode: localVoice.languageCode,
        profileId: localVoice.profileId,
        engine: process.env.VOICEBOX_ENGINE,
      });

      return {
        buffer,
        contentType,
        extension: extensionFor(contentType),
        provider: "voicebox",
      };
    } catch (error) {
      // A dead or slow TTS box should degrade the app, not break it.
      console.warn(`[tts] Voicebox failed, falling back to Google:`, error.message);
    }
  }

  const { buffer, contentType } = await google.synthesize({ text, language, gender });

  return {
    buffer,
    contentType,
    extension: extensionFor(contentType),
    provider: "google",
  };
}
