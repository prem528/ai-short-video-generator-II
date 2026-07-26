/**
 * Voice routing tables.
 *
 * This is *our* business logic — which languages we can speak locally, and which
 * Voicebox voice profile to use for each (language, gender) pair. The Voicebox
 * service itself stays a dumb "text in, audio out" box.
 *
 * We currently offer English and Hindi only — both of which Voicebox can speak
 * locally, so no voiceover costs money. Adding a language later means a row in
 * each table below plus an entry in SelectLanguage.jsx.
 *
 * See docs/VOICEBOX_INTEGRATION.md
 */

/**
 * Languages we can synthesize locally, mapped to the language code Voicebox
 * expects. Anything not listed here falls through to Google Cloud TTS.
 *
 * Voicebox validates this against a fixed set (backend/models.py):
 *   zh en ja ko de fr ru pt es it he ar da el fi hi ms nl no pl sv tr sw
 * Of our ten languages only English and Hindi appear — the eight other Indic
 * languages need a separate engine (see docs/VOICEBOX_INTEGRATION.md §9).
 */
export const SUPPORTED_LOCAL = {
  English: "en",
  Hindi: "hi",
};

/**
 * (language, gender) -> Voicebox profile id.
 *
 * Create these once in the Voicebox app (the Kokoro presets are the fastest way
 * to get ids without recording anything), then `curl $VOICEBOX_URL/profiles` and
 * copy the ids into .env.local.
 *
 * NOTE: these ids point at rows in Voicebox's own storage. Persist its data
 * volume or they will dangle.
 */
export const VOICE_PROFILES = {
  "English:MALE": process.env.VB_EN_MALE,
  "English:FEMALE": process.env.VB_EN_FEMALE,
  "Hindi:MALE": process.env.VB_HI_MALE,
  "Hindi:FEMALE": process.env.VB_HI_FEMALE,
};

/**
 * Google Cloud TTS language codes — the fallback path, used when Voicebox is
 * unreachable or a profile id is missing.
 */
export const GOOGLE_LANGUAGE_CODES = {
  English: "en-US",
  Hindi: "hi-IN",
};

/** Normalise whatever the editor sent us into MALE / FEMALE. */
export function normalizeGender(gender) {
  return String(gender || "").toUpperCase() === "MALE" ? "MALE" : "FEMALE";
}

/**
 * Can we speak this language locally *and* do we have a profile configured for
 * it? A missing profile id means the operator hasn't finished setup — treat that
 * as "not supported" rather than sending a broken request.
 */
export function resolveLocalVoice(language, gender) {
  const languageCode = SUPPORTED_LOCAL[language];
  if (!languageCode) return null;

  const profileId = VOICE_PROFILES[`${language}:${normalizeGender(gender)}`];
  if (!profileId) return null;

  return { languageCode, profileId };
}
