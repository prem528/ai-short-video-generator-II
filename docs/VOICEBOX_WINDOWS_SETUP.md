# Running Voicebox on Windows (with an NVIDIA GPU)

Step-by-step commands to run the local TTS service on a Windows laptop and point
this project at it.

Read [VOICEBOX_INTEGRATION.md](./VOICEBOX_INTEGRATION.md) first for *why* the
integration is shaped the way it is. This file is just the runbook.

---

## 0. Read this before choosing Docker

**Voicebox's Docker image has no CUDA build.** Checked against the upstream
`Dockerfile`: `PYTORCH_VARIANT` accepts `cpu` (default) and `rocm` (AMD) only —
there is no NVIDIA branch. And `backend/services/cuda.py` says the downloadable
CUDA backend is *"currently only published for Windows"* as a native binary,
which the Docker image never fetches.

So on a Windows laptop with an NVIDIA card:

| Route | Uses your GPU? | Effort | Notes |
| --- | --- | --- | --- |
| **A. Desktop app** | ✅ yes (CUDA) | lowest | Installer downloads the CUDA backend. **Recommended.** |
| **B. Docker as-is** | ❌ no — CPU only | low | Works, but no faster than the Linux laptop |
| **C. Docker + custom CUDA build** | ✅ yes | high | Not upstream-supported; you maintain the Dockerfile |

If the reason for moving to the Windows laptop is *"it has a graphics card"*,
then plain Docker defeats the purpose — pick **A**.

Also worth separating two things that get confused: the slow first-time setup is
**downloading** ~4 GB of PyTorch and model weights. That is network-bound and is
exactly as slow on a GPU machine. The GPU only speeds up **generation**.

---

## Route A — Desktop app (recommended, uses the GPU)

### A1. Install

Download the Windows installer from the releases page:

```powershell
start https://github.com/jamiepine/voicebox/releases
```

Install and launch it. The backend starts automatically on **port 17493**.

### A2. Enable the CUDA backend

In the app, open **Settings → Backend** and choose to download the CUDA backend.
Or from PowerShell:

```powershell
# Check what's available
curl.exe http://127.0.0.1:17493/backend/cuda-status

# Start the download (a few GB)
curl.exe -X POST http://127.0.0.1:17493/backend/download-cuda

# Watch progress (SSE stream — Ctrl+C to stop watching)
curl.exe -N http://127.0.0.1:17493/backend/cuda-progress
```

Restart the app when it finishes, then confirm CUDA is active:

```powershell
curl.exe http://127.0.0.1:17493/backend/cuda-status
```

### A3. Create the four voice profiles

We need English and Hindi, male and female. Use **Kokoro** presets — no
recording needed, and Kokoro covers both languages.

In the app: **Profiles → New → preset voice**, engine **Kokoro**, and create:

| Profile name | Kokoro preset | Language | Gender |
| --- | --- | --- | --- |
| `en-male` | any `am_*` voice | English | male |
| `en-female` | any `af_*` voice | English | female |
| `hi-male` | `hm_omega` or `hm_psi` | Hindi | male |
| `hi-female` | `hf_alpha` or `hf_beta` | Hindi | female |

List the preset options first if you want to browse:

```powershell
curl.exe http://127.0.0.1:17493/profiles/presets/kokoro
```

### A4. Point this project at it

In `.env.local` — note the port is **17493** for the desktop app (Docker uses
17600):

```bash
TTS_PROVIDER=voicebox
VOICEBOX_URL=http://127.0.0.1:17493
VOICEBOX_ENGINE=kokoro
VOICEBOX_TIMEOUT_MS=300000
VB_EN_MALE=<id>
VB_EN_FEMALE=<id>
VB_HI_MALE=<id>
VB_HI_FEMALE=<id>
```

Then read the ids and verify everything at once:

```powershell
npm run tts:check
```

It prints every profile id, checks the env vars, generates a Hindi clip, and
writes `voicebox-test.wav`. **Listen to that file before going further.**

---

## Route B — Docker on Windows (CPU only)

Use this if you just want it running and don't mind the speed.

### B1. Prerequisites

- Docker Desktop with the WSL 2 backend
- ~15 GB free disk

```powershell
docker --version
docker compose version
```

### B2. Clone and build

Clone Voicebox **next to** this project, not inside it:

```powershell
cd ..
git clone https://github.com/jamiepine/voicebox
cd voicebox
docker compose build      # slow: ~4 GB of downloads
```

### B3. Run

```powershell
cd ..\ai-short-video-generator-II
npm run tts:up            # docker compose -f ../voicebox/docker-compose.yml up -d
npm run tts:logs          # watch it boot
```

The compose file maps host **17600** → container 17493, so:

```powershell
curl.exe http://127.0.0.1:17600/health
start http://127.0.0.1:17600
```

### B4. Profiles and config

Create the four profiles as in **A3**, using the web UI at
`http://127.0.0.1:17600`. Then in `.env.local`:

```bash
VOICEBOX_URL=http://127.0.0.1:17600
```

plus the same four ids, and run `npm run tts:check`.

To stop: `npm run tts:down`.

---

## Route C — Docker with CUDA (custom, unsupported)

Only if you want GPU *and* containers. You maintain this; upstream does not.

### C1. Prerequisites

- NVIDIA driver on Windows (not inside WSL)
- Docker Desktop with WSL 2 + GPU support enabled

Verify the GPU is visible to Docker:

```powershell
docker run --rm --gpus all nvidia/cuda:12.8.0-base-ubuntu22.04 nvidia-smi
```

If that fails, stop — nothing below will work.

### C2. Add a CUDA branch to the Dockerfile

In the Voicebox clone, edit `Dockerfile` and add a `cuda` case next to the
existing `rocm` one (around line 53):

```dockerfile
RUN if [ "$PYTORCH_VARIANT" = "cuda" ]; then \
      pip install --no-cache-dir --prefix=/install \
        --index-url https://download.pytorch.org/whl/cu128 \
        torch torchaudio; \
    fi
```

### C3. Create a CUDA overlay

Save as `docker-compose.cuda.yml` in the Voicebox clone, mirroring the shape of
the existing `docker-compose.rocm.yml`:

```yaml
services:
  voicebox:
    build:
      context: .
      args:
        PYTORCH_VARIANT: cuda
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

### C4. Build and run

```powershell
docker compose -f docker-compose.yml -f docker-compose.cuda.yml up --build -d
```

Then follow **B4** for profiles and config (still port 17600).

> **Untested.** I have not run this — no NVIDIA hardware on the machine I built
> the integration on. If the container starts but generation falls back to CPU,
> check `torch.cuda.is_available()` inside it:
> `docker exec -it voicebox python -c "import torch; print(torch.cuda.is_available())"`

---

## Running the app and TTS on different machines

If Next.js stays on the Linux laptop and only Voicebox moves to Windows:

1. Bind Voicebox to the LAN rather than loopback. For Docker, change the port
   mapping in `docker-compose.yml` from `127.0.0.1:17600:17493` to
   `0.0.0.0:17600:17493`.
2. Allow the port through Windows Firewall (PowerShell as Administrator):

   ```powershell
   New-NetFirewallRule -DisplayName "Voicebox" -Direction Inbound -LocalPort 17600 -Protocol TCP -Action Allow
   ```

3. Find the Windows IP with `ipconfig`, then on the Linux machine:

   ```bash
   VOICEBOX_URL=http://192.168.x.x:17600
   ```

**Voicebox has no authentication.** Only do this on a network you trust, and set
`VOICEBOX_SECRET` plus a reverse proxy that checks the `X-Voicebox-Secret`
header before exposing it any further. Never put port 17600 on a public IP.

---

## Verifying the whole pipeline

Once `npm run tts:check` passes:

```powershell
npm run dev
```

1. Go to **Dashboard → Create New**, pick **English** or **Hindi**, generate.
2. Watch the terminal for `[generate-audio] <id> synthesized via voicebox`.
   If it says `via google`, the local path was skipped — check the profile ids.
3. Confirm the preview plays and captions line up with the audio.

---

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `tts:check` says unreachable | Service not running, or wrong port (17493 desktop vs 17600 Docker) |
| Log says `via google` | A profile id is blank, or `TTS_PROVIDER` isn't `voicebox` |
| First generation takes minutes | Model weights downloading on first use — normal, once per engine |
| `generation failed` | Check `npm run tts:logs`; usually an out-of-memory or a still-downloading model |
| Timeout on long scripts | Raise `VOICEBOX_TIMEOUT_MS` — CPU inference on a long script is slow |
| Hindi text sounds wrong | Confirm the profile is a Hindi Kokoro preset (`hf_*` / `hm_*`), not an English one |

---

## Related

- [VOICEBOX_INTEGRATION.md](./VOICEBOX_INTEGRATION.md) — architecture and API contract
- [ARCHITECTURE.md](./ARCHITECTURE.md) — the overall system
