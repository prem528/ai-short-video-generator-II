#!/usr/bin/env node
/**
 * Voicebox smoke test — verifies the service is up, lists voice profiles so you
 * can copy their ids into .env.local, and runs one full generation end to end
 * (enqueue → poll → download).
 *
 *   npm run tts:check
 *
 * See docs/VOICEBOX_INTEGRATION.md
 */

import { writeFileSync } from "node:fs";
import { config } from "dotenv";

config({ path: ".env.local" });

const BASE = (process.env.VOICEBOX_URL || "http://127.0.0.1:17600").replace(/\/$/, "");
const ENGINE = process.env.VOICEBOX_ENGINE || "kokoro";
const TIMEOUT = Number(process.env.VOICEBOX_TIMEOUT_MS) || 300_000;
const HEADERS = process.env.VOICEBOX_SECRET
  ? { "X-Voicebox-Secret": process.env.VOICEBOX_SECRET }
  : {};

const ok = (m) => console.log(`\x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`\x1b[31m✗\x1b[0m ${m}`);
const info = (m) => console.log(`  ${m}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log(`\nVoicebox at ${BASE}  (engine: ${ENGINE})\n`);

  // 1. Reachable?
  try {
    const res = await fetch(`${BASE}/health`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ok("service is reachable");
  } catch (error) {
    bad(`cannot reach the service: ${error.message}`);
    info("start it with: npm run tts:up   (then npm run tts:logs)");
    process.exit(1);
  }

  // 2. Show profiles so the ids can be pasted into .env.local.
  const profilesRes = await fetch(`${BASE}/profiles`, { headers: HEADERS });
  const profiles = await profilesRes.json();
  const list = Array.isArray(profiles) ? profiles : profiles.profiles || [];

  if (!list.length) {
    bad("no voice profiles yet");
    info(`create two English voices (male + female) at ${BASE}, then re-run`);
    info(`preset voices need no recording: GET ${BASE}/profiles/presets/${ENGINE}`);
    process.exit(1);
  }

  ok(`${list.length} voice profile(s):`);
  for (const p of list) {
    info(`${String(p.id).padEnd(38)} ${p.name ?? "(unnamed)"}  [${p.language ?? "?"}]`);
  }

  // 3. Are our env vars wired up? English + Hindi, male + female.
  const REQUIRED = ["VB_EN_MALE", "VB_EN_FEMALE", "VB_HI_MALE", "VB_HI_FEMALE"];
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (!missing.length) {
    ok("all four voice profiles are configured (English + Hindi, male + female)");
  } else {
    bad(`missing env vars: ${missing.join(", ")} — those fall back to Google TTS`);
    info("paste the ids above into .env.local");
    if (missing.length === REQUIRED.length) process.exit(1);
  }

  // 4. Full generation: enqueue → poll → download.
  // Test whichever language is configured; prefer Hindi since it exercises a
  // non-Latin script path through the engine.
  const [language, text, profileId] = process.env.VB_HI_FEMALE
    ? ["hi", "यह आवाज़ अब आपके अपने कंप्यूटर पर बन रही है।", process.env.VB_HI_FEMALE]
    : ["en", "Voicebox is now generating voiceovers for this project, locally.", process.env.VB_EN_FEMALE || process.env.VB_EN_MALE];

  info(`\ngenerating a test clip (${language})...`);
  const started = Date.now();

  const submitRes = await fetch(`${BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...HEADERS },
    body: JSON.stringify({
      profile_id: profileId,
      text,
      language,
      engine: ENGINE,
      normalize: true,
    }),
  });

  if (!submitRes.ok) {
    bad(`/generate returned ${submitRes.status}: ${(await submitRes.text()).slice(0, 300)}`);
    process.exit(1);
  }

  const generation = await submitRes.json();
  ok(`enqueued as ${generation.id} (status: ${generation.status})`);

  // Poll /history/{id} until terminal.
  const deadline = Date.now() + TIMEOUT;
  let status = generation.status || "generating";
  let duration = null;

  while (status !== "completed") {
    if (status === "failed") {
      bad(`generation failed: ${generation.error || "unknown error"}`);
      info("check `npm run tts:logs` — the engine may still be downloading weights");
      process.exit(1);
    }
    if (Date.now() > deadline) {
      bad(`timed out after ${TIMEOUT}ms (status: ${status})`);
      process.exit(1);
    }

    await sleep(1000);
    const entry = await (await fetch(`${BASE}/history/${generation.id}`, { headers: HEADERS })).json();
    status = entry.status || "completed";
    duration = entry.duration ?? null;

    if (status === "failed") {
      bad(`generation failed: ${entry.error || "unknown error"}`);
      process.exit(1);
    }
    process.stdout.write(`\r  status: ${status}  (${((Date.now() - started) / 1000).toFixed(0)}s)   `);
  }
  console.log();

  // Download the audio.
  const audioRes = await fetch(`${BASE}/audio/${generation.id}`, { headers: HEADERS });
  if (!audioRes.ok) {
    bad(`/audio/${generation.id} returned ${audioRes.status}`);
    process.exit(1);
  }

  const buffer = Buffer.from(await audioRes.arrayBuffer());
  const contentType = audioRes.headers.get("content-type") || "";
  const out = `voicebox-test.${contentType.includes("mpeg") ? "mp3" : "wav"}`;
  writeFileSync(out, buffer);

  ok(
    `${(buffer.length / 1024).toFixed(0)} KB, ${duration?.toFixed?.(1) ?? "?"}s audio ` +
      `in ${((Date.now() - started) / 1000).toFixed(1)}s wall → ${out}`
  );
  info(`content-type: ${contentType}`);
  console.log("\nListen to it before wiring this into video generation.\n");
}

main().catch((error) => {
  bad(error.message);
  process.exit(1);
});
