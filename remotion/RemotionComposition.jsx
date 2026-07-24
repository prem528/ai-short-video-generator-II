import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSans";
import { loadFont as loadNotoSansBengali } from "@remotion/google-fonts/NotoSansBengali";
import { loadFont as loadNotoSansGujarati } from "@remotion/google-fonts/NotoSansGujarati";
import { loadFont as loadNotoSansDevanagari } from "@remotion/google-fonts/NotoSansDevanagari";
import { loadFont as loadNotoSansKannada } from "@remotion/google-fonts/NotoSansKannada";
import { loadFont as loadNotoSansMalayalam } from "@remotion/google-fonts/NotoSansMalayalam";
import { loadFont as loadNotoSansGurmukhi } from "@remotion/google-fonts/NotoSansGurmukhi";
import { loadFont as loadNotoSansTamil } from "@remotion/google-fonts/NotoSansTamil";
import { loadFont as loadNotoSansTelugu } from "@remotion/google-fonts/NotoSansTelugu";

// Load fonts once at module scope so glyphs are ready before the first frame.
const { fontFamily: notoSans } = loadNotoSans();
const { fontFamily: notoSansBengali } = loadNotoSansBengali();
const { fontFamily: notoSansGujarati } = loadNotoSansGujarati();
const { fontFamily: notoSansDevanagari } = loadNotoSansDevanagari();
const { fontFamily: notoSansKannada } = loadNotoSansKannada();
const { fontFamily: notoSansMalayalam } = loadNotoSansMalayalam();
const { fontFamily: notoSansGurmukhi } = loadNotoSansGurmukhi();
const { fontFamily: notoSansTamil } = loadNotoSansTamil();
const { fontFamily: notoSansTelugu } = loadNotoSansTelugu();

const CAPTION_FONT_STACK = `${notoSans}, ${notoSansBengali}, ${notoSansGujarati}, ${notoSansDevanagari}, ${notoSansKannada}, ${notoSansMalayalam}, ${notoSansGurmukhi}, ${notoSansTamil}, ${notoSansTelugu}, sans-serif`;

/**
 * Compute the total duration (in frames) of the video from the caption track.
 * Shared by the composition and by Root's calculateMetadata so preview and
 * render always agree on length.
 */
export const getDurationInFrames = (captions, fps) => {
  const lastEnd = captions?.[captions.length - 1]?.end;
  if (!lastEnd) return fps * 5; // safe fallback
  return Math.max(1, Math.round((lastEnd / 1000) * fps));
};

/**
 * A single background image with a continuous Ken Burns zoom.
 *
 * Rendered INSIDE a <Sequence>, so useCurrentFrame() here is sequence-local
 * (0-based over this image's own window) — that is what makes the zoom smooth
 * and identical for every image regardless of where it sits in the timeline.
 */
const ImageSlide = ({ src, segmentDuration, zoomIn, fadeIn, fadeOut }) => {
  const localFrame = useCurrentFrame();

  // Smooth ease-in-out zoom from 1.0 -> 1.12 (or the reverse) across the slide.
  const from = zoomIn ? 1 : 1.12;
  const to = zoomIn ? 1.12 : 1;
  const scale = interpolate(localFrame, [0, segmentDuration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => t * t * (3 - 2 * t), // smoothstep
  });

  // Crossfade: fade in over the leading overlap, fade out over the trailing one.
  // Neighbouring slides overlap by `fadeIn`/`fadeOut` frames, so one fades up
  // while the other fades down -> a true crossfade with no hard cut. The two
  // fades are computed independently so a 0-length fade (first / last slide)
  // can't break interpolate's strictly-increasing input requirement.
  const fadeInFactor =
    fadeIn > 0
      ? interpolate(localFrame, [0, fadeIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const fadeOutFactor =
    fadeOut > 0
      ? interpolate(
          localFrame,
          [segmentDuration - fadeOut, segmentDuration],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      : 1;
  const opacity = fadeInFactor * fadeOutFactor;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Blurred fill so portrait images don't show black bars. */}
      <Img
        src={src}
        pauseWhenLoading
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          objectFit: "cover",
          filter: "blur(20px)",
          transform: "scale(1.2)",
        }}
      />
      {/* Main image with the Ken Burns transform. */}
      <Img
        src={src}
        pauseWhenLoading
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          objectFit: "contain",
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Continuous caption layer driven by the GLOBAL frame (rendered once, on top of
 * all slides) so text never resets at image boundaries. Groups words into short
 * phrases and fades each phrase in/out smoothly.
 */
const CaptionLayer = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!captions?.length) return null;

  const currentMs = (frame / fps) * 1000;
  const wordsPerGroup = 4;
  const fadeMs = 120; // fade duration at each phrase boundary

  // Find the word currently being spoken (fall back to the last word).
  let activeIndex = captions.findIndex(
    (w) => currentMs >= w.start && currentMs < w.end
  );
  if (activeIndex === -1) {
    activeIndex = captions.findIndex((w) => currentMs < w.end);
  }
  if (activeIndex === -1) return null;

  const groupStartIndex =
    Math.floor(activeIndex / wordsPerGroup) * wordsPerGroup;
  const group = captions.slice(groupStartIndex, groupStartIndex + wordsPerGroup);
  if (!group.length) return null;

  const groupStart = group[0].start;
  const groupEnd = group[group.length - 1].end;
  const text = group.map((c) => c.text).join(" ");

  // Smooth fade in at the phrase start and out at its end (time-based, so it is
  // independent of fps and never degenerates to a no-op). Computed as two
  // independent factors so a very short phrase can't break interpolate's
  // strictly-increasing input requirement.
  const fadeInFactor = interpolate(
    currentMs,
    [groupStart, groupStart + fadeMs],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const fadeOutFactor = interpolate(
    currentMs,
    [groupEnd - fadeMs, groupEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = fadeInFactor * fadeOutFactor;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "8%",
      }}
    >
      <h2
        style={{
          margin: 0,
          opacity,
          color: "white",
          textAlign: "center",
          fontFamily: CAPTION_FONT_STACK,
          fontSize: "1rem",
          fontWeight: 700,
          lineHeight: 1.3,
          maxWidth: "90%",
          padding: "0.4rem 0.6rem",
          borderRadius: "0.3rem",
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          textShadow: "0 2px 6px rgba(0,0,0,0.9)",
        }}
      >
        {text}
      </h2>
    </AbsoluteFill>
  );
};

function RemotionComposition({ imageList, audioFileUrl, captions }) {
  const { fps, durationInFrames } = useVideoConfig();

  if (!imageList?.length) return null;

  const count = imageList.length;
  const segmentDuration = durationInFrames / count;

  // Overlap between consecutive slides (the crossfade window). Capped so it is
  // never longer than a quarter of a slide, and 0 when there is only one image.
  const overlap =
    count > 1 ? Math.min(Math.round(fps * 0.6), Math.floor(segmentDuration / 4)) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {imageList.map((item, index) => {
        const start = Math.round(index * segmentDuration);
        const isFirst = index === 0;
        const isLast = index === count - 1;

        // Extend each slide by `overlap` frames into the next one so they can
        // crossfade. First slide has no lead-in fade; last has no fade-out.
        const fadeIn = isFirst ? 0 : overlap;
        const fadeOut = isLast ? 0 : overlap;
        const slideDuration = Math.round(segmentDuration) + fadeOut;

        return (
          <Sequence
            key={index}
            from={start}
            durationInFrames={slideDuration}
            // Decode the image ~1s before it is shown -> no pop-in / stall.
            premountFor={Math.round(fps)}
          >
            <ImageSlide
              src={item}
              segmentDuration={slideDuration}
              zoomIn={index % 2 === 0}
              fadeIn={fadeIn}
              fadeOut={fadeOut}
            />
          </Sequence>
        );
      })}

      <CaptionLayer captions={captions} />

      {audioFileUrl && <Audio src={audioFileUrl} pauseWhenBuffering />}
    </AbsoluteFill>
  );
}

export default RemotionComposition;
