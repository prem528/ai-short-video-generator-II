# FFmpeg — Simple Interview Guide

The FFmpeg terms and concepts most likely to come up in a **Video Automation
Engineer** interview, explained in plain language. This is the media engine that
lives *under* Remotion (it turns rendered frames into an MP4), so knowing it well
makes you sound like you understand the whole stack — not just the React layer.

---

## 1. What is FFmpeg?

> **FFmpeg is the free, industry-standard "Swiss Army knife" for audio and
> video.** Almost every video tool (including Remotion, YouTube, VLC, OBS) uses
> it under the hood.

It's actually a toolbox of three commands:

| Command | What it does |
| --- | --- |
| **`ffmpeg`** | Convert / encode / edit media (the workhorse) |
| **`ffprobe`** | Inspect a file — its codecs, duration, resolution, bitrate |
| **`ffplay`** | Simple player to preview media |

Under those sit the real libraries (`libavcodec`, `libavformat`, `libavfilter`)
that do the encoding, file handling, and filtering.

---

## 2. The #1 concept: **Container vs Codec**

This is the most common FFmpeg interview question. Get it right and you sound
credible instantly.

- **Container** = the **box/wrapper** file. It holds the video, audio, subtitles,
  and metadata together. Examples: **MP4, MOV, MKV, WebM, AVI**.
  - *Think of it as the **box**.*
- **Codec** = the **compression method** used for the stream inside the box.
  Examples: **H.264, H.265/HEVC, VP9, AV1** (video); **AAC, MP3, Opus** (audio).
  - *Think of it as **how the contents are packed**.*

> A `.mp4` file (container) usually holds **H.264** video + **AAC** audio (codecs).
> The same H.264 video could also live inside a `.mkv` box.

**Codec** stands for **CO**der-**DEC**oder.

---

## 3. Core verbs (what FFmpeg is actually doing)

| Term | Simple meaning |
| --- | --- |
| **Encode** | Compress raw frames into a codec (e.g. raw → H.264). Makes files smaller. |
| **Decode** | Uncompress a codec back into raw frames (to play or edit). |
| **Transcode** | Re-encode from one codec to another (e.g. H.265 → H.264). Slow — it decodes then re-encodes. |
| **Mux (multiplex)** | **Combine** separate streams (video + audio + subs) into one container. |
| **Demux** | **Split** a container back into its separate streams. |
| **Remux / Transmux** | Move streams into a **different container without re-encoding** (e.g. MKV → MP4). Fast & lossless, because the codec doesn't change. |

**Key interview point:** *Remux = change the box only (fast). Transcode = change
the codec (slow, quality loss).* Always prefer remuxing when you can.

---

## 4. Quality & file size (the trade-off everyone asks about)

- **Bitrate** — how much data is used per second (e.g. 5 Mbps). Higher bitrate =
  better quality **and** bigger file.
  - **CBR** (Constant Bitrate) — same rate throughout. Predictable size.
  - **VBR** (Variable Bitrate) — spends more bits on complex scenes. Better
    quality per size.
- **CRF (Constant Rate Factor)** — the *quality dial* for H.264/H.265. You set a
  target **quality** (typically **18–28**; lower = better) and FFmpeg picks the
  bitrate automatically. **CRF ~23 is a common default; ~18 is near-lossless.**
- **Preset** — how hard the encoder works: `ultrafast … medium … veryslow`.
  Slower preset = **smaller file / better quality** for the same setting, but
  **takes longer to encode**. (Speed vs. size trade-off.)
- **Two-pass encoding** — FFmpeg analyses the whole video once, then encodes on a
  second pass to hit an **exact target size** with the best quality. Used when
  file size must be precise (e.g. platform limits).

> **The classic answer:** *"For quality-based output I use CRF; for a strict
> target size I use two-pass with a set bitrate. Slower presets shrink the file
> at the cost of encode time."*

---

## 5. Video fundamentals

- **Resolution** — pixel dimensions (1080×1920 for a vertical short).
- **Aspect ratio** — shape of the frame (**9:16** vertical, **16:9** landscape,
  **1:1** square).
- **Frame rate (fps)** — frames per second (24/30/60).
  - **CFR** (Constant Frame Rate) — steady fps. Preferred for editing/rendering.
  - **VFR** (Variable Frame Rate) — fps changes (common from screen/phone
    recordings). Can cause **audio-sync issues** — often converted to CFR.
- **Pixel format** — how colour is stored. **`yuv420p`** is the safe, universal
  one for web/players. (If a video "won't play in a browser," a wrong pixel
  format is a frequent cause.)
- **Chroma subsampling** — the numbers like **4:2:0 / 4:2:2 / 4:4:4**. Our eyes
  notice brightness more than colour, so `4:2:0` keeps full brightness but
  **halves colour detail** to save space. `4:2:0` is standard for delivery.

### Keyframes and frame types (GOP)
- **I-frame (keyframe)** — a **complete** picture on its own.
- **P-frame** — stores only the **change since the previous** frame.
- **B-frame** — stores changes using **both previous and future** frames (most
  efficient).
- **GOP (Group of Pictures)** — the pattern of I/P/B frames between keyframes.
  - *Why it matters:* seeking, streaming, and cutting all snap to **keyframes**.
    More keyframes = easier seeking but bigger files.

---

## 6. Audio fundamentals

- **Sample rate** — audio "resolution" in Hz (e.g. **44,100 Hz** or **48,000 Hz**).
- **Channels** — mono (1), stereo (2), 5.1 surround (6).
- **Audio codecs** — **AAC** (standard for MP4/web), **MP3**, **Opus** (great for
  WebM/low bitrate).
- **Audio extraction** — pulling the audio out of a video into an `.mp3`/`.wav`.
  *(In an AI pipeline this feeds speech-to-text for captions — the JD literally
  lists "audio extraction.")*
- **Loudness normalization** — evening out volume to a broadcast standard
  (**EBU R128 / LUFS**, via the `loudnorm` filter) so every clip sounds equally
  loud.

---

## 7. Streams & mapping

- A file can have several **streams**: video, one or more audio tracks,
  subtitles.
- **Stream mapping (`-map`)** tells FFmpeg **which streams to keep** in the
  output (e.g. keep the video + only the Hindi audio track). Essential for
  multilingual content.

---

## 8. Filters & the filtergraph (FFmpeg's real power)

**Filters** transform the media as it passes through. A chain of filters is a
**filtergraph**.

- **Video filters (`-vf`)** and **audio filters (`-af`)**.
- **Complex filtergraph (`-filter_complex`)** — when you combine **multiple
  inputs/outputs** (e.g. overlay a logo, mix two audios, picture-in-picture).

Common filters worth naming:

| Filter | What it does |
| --- | --- |
| `scale` | Resize resolution |
| `crop` | Cut out a region (e.g. 16:9 → 9:16) |
| `overlay` | Put one video/image on top of another (logos, watermarks, PiP) |
| `drawtext` | Burn text/captions directly onto the frame |
| `subtitles` | Render a subtitle file onto the video |
| `fps` | Change frame rate |
| `fade` | Fade in/out |
| `concat` | Join clips together |
| `pad` | Add borders/letterboxing |

---

## 9. Cutting, trimming & seeking

- **`-ss`** = start time, **`-t`** = duration, **`-to`** = end time.
- **Input seeking** (`-ss` before the input) is **fast** (jumps by keyframe).
- **Output seeking** (`-ss` after the input) is **frame-accurate but slower**.
- Cutting **without re-encoding** (`-c copy`) is instant but can **only cut on
  keyframes**; frame-accurate cuts require re-encoding.

---

## 10. Joining clips (concatenation)

- **Concat demuxer** — joins files that share the **same codec/resolution**
  without re-encoding (fast). Good for batch pipelines producing uniform clips.
- **Concat filter** — joins clips with **different formats** by re-encoding
  (flexible but slower).

---

## 11. Web delivery & streaming

- **Faststart / `moov` atom** — MP4 stores an index (the **moov atom**). Moving it
  to the **front** of the file (`+faststart`) lets a video **start playing before
  it's fully downloaded**. Important for web/social.
- **Adaptive streaming — HLS & DASH** — the video is chopped into small
  **segments** at several quality levels (via a **playlist**, e.g. `.m3u8` for
  HLS). The player switches quality based on the viewer's internet speed. This is
  how YouTube/Netflix stream smoothly.

---

## 12. Speed & scale (performance)

- **Hardware acceleration** — use the GPU instead of the CPU to encode much
  faster: **NVENC** (NVIDIA), **QSV** (Intel), **VAAPI** (Linux), **VideoToolbox**
  (Apple). Trade-off: a bit lower quality-per-size than CPU (`libx264`), but far
  faster — great for **high-volume batch rendering**.
- **Threads / concurrency** — FFmpeg uses multiple CPU cores; batch pipelines run
  many FFmpeg jobs in parallel across machines or serverless workers to scale.

---

## 13. `ffprobe` — inspecting media

Before processing, you often need to **know** a file: its duration, resolution,
codecs, bitrate, frame rate, and number of streams. **`ffprobe`** reports all of
that (often as JSON), which automation scripts read to make decisions (e.g.
"detect vertical vs horizontal," "is there an audio track?").

---

## 14. A couple of terms interviewers slip in

- **PTS / DTS** — **Presentation** timestamp (when to *show* a frame) vs
  **Decode** timestamp (when to *decode* it). They differ because of B-frames.
  Wrong timestamps → **audio/video out of sync**.
- **Interlacing / deinterlacing** — old TV video stores **half-frames** (fields);
  `deinterlace` combines them into full frames for modern screens.
- **Lossy vs lossless** — lossy (H.264, AAC) throws away data for small size;
  lossless keeps everything (huge files).
- **Codec licensing** — H.264/H.265 carry **patent/royalty** considerations,
  which is why royalty-free codecs like **VP9/AV1** exist.

---

## 15. Commands you should be able to write from memory

A few one-liners commonly asked ("how would you…?"):

```text
# Inspect a file
ffprobe input.mp4

# Transcode to H.264/AAC MP4 at good quality
ffmpeg -i input.mov -c:v libx264 -crf 23 -preset medium -c:a aac output.mp4

# Remux (change container only, no re-encode) — fast
ffmpeg -i input.mkv -c copy output.mp4

# Extract audio from a video (for speech-to-text)
ffmpeg -i input.mp4 -vn -acodec mp3 audio.mp3

# Resize to a vertical short (1080x1920)
ffmpeg -i input.mp4 -vf scale=1080:1920 output.mp4

# Trim 10s starting at 00:00:05
ffmpeg -ss 00:00:05 -i input.mp4 -t 10 -c copy clip.mp4

# Burn subtitles onto the video
ffmpeg -i input.mp4 -vf subtitles=captions.srt output.mp4

# Web-optimized MP4 (instant playback while downloading)
ffmpeg -i input.mp4 -movflags +faststart output.mp4
```

*(You won't be graded on exact flags — knowing the intent and the key options
`-c:v`, `-crf`, `-preset`, `-vf`, `-map`, `-c copy`, `+faststart` is what matters.)*

---

## 16. How FFmpeg shows up in this project (and Remotion)

You can speak to real, hands-on usage:

- **Remotion uses FFmpeg internally** to encode the per-frame screenshots into a
  video and **mux in the AI voiceover audio** → the final MP4.
- The output is **H.264 in an MP4 container** with **`yuv420p`** — the
  universally playable combination for web and social.
- **Audio extraction** is the same idea used to feed **speech-to-text**
  (AssemblyAI/Whisper) so captions can be word-synced.
- For scale, rendering is **chunked across cloud workers** and the pieces are
  **concatenated with FFmpeg** — the batch/serverless story from the JD.

---

## 17. Likely questions → crisp answers

| Question | One-line answer |
| --- | --- |
| Container vs codec? | Container is the box (MP4); codec is how the stream is compressed inside (H.264). |
| Difference between remux and transcode? | Remux changes only the container (fast, lossless); transcode re-encodes the codec (slow, quality loss). |
| How to reduce file size without hurting quality? | Use CRF (~23), a slower preset, H.265/VP9, and `4:2:0`; two-pass for an exact size. |
| Why won't my MP4 play in a browser? | Often wrong pixel format — re-encode to `yuv420p` H.264/AAC, add `+faststart`. |
| How do you extract audio for captions? | `-vn` to drop video, encode audio to mp3/wav, then send to speech-to-text. |
| What is a keyframe / GOP? | A keyframe is a full self-contained frame; GOP is the I/P/B pattern between keyframes — seeking snaps to keyframes. |
| How do you scale rendering for thousands of videos? | Split frames into chunks, render in parallel on serverless workers, then concat with FFmpeg; use GPU encoders for speed. |
| What is faststart? | Moves the MP4 index (moov atom) to the front so playback starts before full download — important for web. |

---

**Two-sentence summary for an interview:**
> *"FFmpeg is the engine that encodes, converts, and combines audio and video. I
> think in terms of containers vs codecs, control quality with CRF and presets,
> use filters for scaling/overlays/captions, extract audio for speech-to-text,
> and scale batch rendering by chunking across workers and concatenating the
> pieces — the same FFmpeg that Remotion uses under the hood to produce the final
> MP4."*
