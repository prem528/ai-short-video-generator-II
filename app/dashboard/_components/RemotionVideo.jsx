import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

function RemotionVideo({ script, imageList, audioFileUrl, captions }) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const [durationFrames, setDurationFrames] = useState(10000); // Default value

  const calculateDurationFrames = (captions) => {
    if (captions?.length > 0) {
      const lastCaptionEnd = captions[captions.length - 1]?.end;
      if (lastCaptionEnd) {
        const durationInSeconds = lastCaptionEnd / 1000;
        setDurationFrames(Math.round(durationInSeconds * fps));
      }
    }
  };

  useEffect(() => {
    calculateDurationFrames(captions);
  }, [captions]);

  // Early return if durationFrames is 0 or imageList is empty
  if (durationFrames === 0 || !imageList?.length) {
    return null;
  }

  // Function to get the current captions:
  const getCurrentCaptions = () => {
    const currentTime = (frame / 30) * 1000; // Convert frames to milliseconds

    const wordsPerGroup = 4;

    let startIndex = captions.findIndex((word) => currentTime < word.end);

    if (startIndex === -1) return "";

    // Group words into chunks of 3-4
    startIndex = Math.floor(startIndex / wordsPerGroup) * wordsPerGroup;

    // Get the next 3-4 words in sequence
    const displayedWords = captions
      .slice(startIndex, startIndex + wordsPerGroup)
      .map((c) => c.text)
      .join(" ");

    return displayedWords || "";
  };

  return (
    <AbsoluteFill className="bg-black">
      {imageList.map((item, index) => {
        // Adding zoom-in and zoom-out effect:
        const startTime = (index * durationFrames) / imageList.length;
        const duration = Math.round(durationFrames);
        const scale = (index) =>
          interpolate(
            frame,
            [startTime, startTime + duration / 2, startTime + duration],
            index % 2 == 0 ? [1, 1.5, 1] : [1.5, 1, 1.5],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
        return (
          <Sequence
            key={index}
            from={startTime}
            durationInFrames={durationFrames / imageList.length}
          >
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Background Image */}
              <Img
                src={item}
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
              {/* Main Image */}
              <Img
                src={item}
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  objectFit: "contain",
                  transform: `scale(${scale(index)})`,
                }}
              />
              {/* Captions */}
              {getCurrentCaptions() && (
                <AbsoluteFill
                  style={{
                    color: "white",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    top: undefined,
                    bottom: -10,
                    height: 150,
                    width: "100%",
                    opacity: interpolate(
                      frame,
                      [frame - 10, frame, frame + 10], // Fade in and out smoothly
                      [0, 1, 0], // 0 = invisible, 1 = fully visible
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    ),
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1rem",
                      backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
                      padding: "0.25rem",
                      borderRadius: "0.125rem",
                    }}
                  >
                    {getCurrentCaptions()}
                  </h2>
                </AbsoluteFill>
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Audio src={audioFileUrl} />
    </AbsoluteFill>
  );
}

export default RemotionVideo;
