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

function RemotionComposition({ script, imageList, audioFileUrl, captions }) {
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

  const getCurrentCaptions = () => {
    const currentTime = (frame / 30) * 1000; // Converts frames to miliseconds
    const currentCaption = captions.find(
      (word) => currentTime >= word.start && currentTime <= word.end
    );
    return currentCaption ? currentCaption?.text : "";
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
              <Img
                src={item}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                  transform: `scale(${scale(index)})`,
                }}
              />

              <AbsoluteFill
                style={{
                  color: "white",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  top: undefined,
                  bottom: 50,
                  height: 150,
                  width: "100%",
                }}
              >
                <h2
                  style={{
                    fontSize: "1rem",
                    backgroundColor: "black",
                    padding: "0.25rem",
                    borderRadius: "0.125rem",
                  }}
                >
                  {getCurrentCaptions()}
                </h2>
              </AbsoluteFill>
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Audio src={audioFileUrl} />
    </AbsoluteFill>
  );
}

export default RemotionComposition;
