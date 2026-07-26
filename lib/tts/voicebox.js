/**
 * Voicebox client — self-hosted TTS over HTTP.
 * https://github.com/jamiepine/voicebox (MIT)
 *
 * Voicebox is a separate long-lived process (Python/FastAPI), not a library.
 * Everything protocol-specific lives in this file, so swapping in a different
 * local engine later only touches one module.
 *
 * The generation flow is ASYNCHRONOUS — three calls, not one:
 *   1. POST /generate            → enqueues, returns { id, status: "generating" }
 *   2. GET  /history/{id}        → poll until status is "completed" or "failed"
 *   3. GET  /audio/{id}          → the audio bytes
 *
 * (There is also an SSE endpoint at /generate/{id}/status, but polling /history
 * is simpler and survives a dropped connection.)
 */

const DEFAULT_URL = "http://127.0.0.1:17600"; // docker compose maps host 17600 → container 17493
const DEFAULT_TIMEOUT_MS = 300_000; // CPU inference is slow; be generous
const POLL_INTERVAL_MS = 1000;

function baseUrl() {
  return (process.env.VOICEBOX_URL || DEFAULT_URL).replace(/\/$/, "");
}

function timeoutMs() {
  return Number(process.env.VOICEBOX_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
}

/**
 * The service ships with no auth of its own. In production it must sit on a
 * private network behind a shared-secret check — this header is what that
 * check reads.
 */
function authHeaders() {
  const secret = process.env.VOICEBOX_SECRET;
  return secret ? { "X-Voicebox-Secret": secret } : {};
}

async function request(path, init = {}, signalTimeout = 30_000) {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers || {}) },
    signal: AbortSignal.timeout(signalTimeout),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Voicebox ${path} → ${res.status}: ${detail.slice(0, 300)}`);
  }

  return res;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Is the service up? */
export async function isReachable() {
  try {
    const res = await fetch(`${baseUrl()}/health`, {
      signal: AbortSignal.timeout(3000),
      headers: authHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** List configured voice profiles — used to populate the VB_* env vars. */
export async function listProfiles() {
  const res = await request("/profiles", { method: "GET" });
  return res.json();
}

/**
 * Synthesize speech. Blocks until the generation completes.
 *
 * @returns {Promise<{ buffer: Buffer, contentType: string, duration: number|null }>}
 */
export async function synthesize({ text, languageCode, profileId, engine }) {
  // 1. Enqueue.
  const submitRes = await request("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile_id: profileId,
      text,
      language: languageCode,
      // Voicebox defaults to the "qwen" engine; ours is configurable so we can
      // trade quality for speed without touching code.
      ...(engine ? { engine } : {}),
      normalize: true,
    }),
  });

  const generation = await submitRes.json();
  const generationId = generation.id;
  if (!generationId) throw new Error("Voicebox /generate returned no generation id");

  // 2. Poll until done.
  const deadline = Date.now() + timeoutMs();
  let status = generation.status || "generating";
  let duration = null;

  while (status !== "completed") {
    if (status === "failed") {
      throw new Error(`Voicebox generation failed: ${generation.error || "unknown error"}`);
    }
    if (Date.now() > deadline) {
      throw new Error(`Voicebox generation timed out after ${timeoutMs()}ms`);
    }

    await sleep(POLL_INTERVAL_MS);

    const statusRes = await request(`/history/${generationId}`, { method: "GET" });
    const entry = await statusRes.json();
    status = entry.status || "completed";
    duration = entry.duration ?? null;

    if (status === "failed") {
      throw new Error(`Voicebox generation failed: ${entry.error || "unknown error"}`);
    }
  }

  // 3. Fetch the audio.
  const audioRes = await request(`/audio/${generationId}`, { method: "GET" }, timeoutMs());

  return {
    buffer: Buffer.from(await audioRes.arrayBuffer()),
    contentType: audioRes.headers.get("content-type") || "audio/wav",
    duration,
  };
}
