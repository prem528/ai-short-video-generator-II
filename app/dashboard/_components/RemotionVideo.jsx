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

function RemotionVideo({
  script,
  imageList,
  audioFileUrl,
  captions,
  setDurationFrames,
}) {
  const { fps } = useVideoConfig();
  const [durationFrames, setDurationFramesState] = useState(100);
  const frame = useCurrentFrame();

  // Calculate the total duration of the video in frames
  useEffect(() => {
    let calculatedDurationFrames = 0;

    if (captions?.length > 0) {
      const lastCaptionEnd = captions[captions.length - 1]?.end;
      if (lastCaptionEnd) {
        const durationInSeconds = lastCaptionEnd / 1000;
        calculatedDurationFrames = durationInSeconds * fps;
      }
    }

    setDurationFramesState(calculatedDurationFrames); // Update local state
    setDurationFrames(Math.round(calculatedDurationFrames)); // Send the value to the parent
  }, [captions, fps, setDurationFrames]);

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
            index % 2 == 0 ? [1, 1.2, 1] : [1.2, 1, 1.2],
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
                <h2 className="text-1xl">{getCurrentCaptions()}</h2>
              </AbsoluteFill>
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Audio src={audioFileUrl} />
    </AbsoluteFill>
  );
}

export default RemotionVideo;
