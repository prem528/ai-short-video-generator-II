import React, { useEffect } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

function RemotionVideo({ script, imageList, audioFileUrl, captions, setDurationInFrame }) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Set the total duration in frames
  useEffect(() => {
    const totalDuration = captions[captions?.length - 1]?.end / 1000 * fps;
    setDurationInFrame(totalDuration);
  }, [captions, fps, setDurationInFrame]);

  // Get the current caption based on the frame
  const getCurrentCaptions = () => {
    const currentTime = (frame / fps) * 1000; // Convert frame number to milliseconds
    const currentCaption = captions.find(
      (word) => currentTime >= word.start && currentTime <= word.end
    );
    return currentCaption ? currentCaption.text : "";
  };

  const durationPerImage = Math.floor(
    (captions[captions?.length - 1]?.end / 1000) * fps / imageList.length
  );

  return (
    <AbsoluteFill className="bg-black">
      {imageList.map((item, index) => (
        <Sequence
          key={index}
          from={index * durationPerImage}
          durationInFrames={durationPerImage}
        >
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <Img
              src={item}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <AbsoluteFill
              style={{
                color: "white",
                justifyContent: "center",
                bottom: 50,
                height: 150,
                textAlign: "center",
              }}
            >
              <h2 className="text-2xl">{getCurrentCaptions()}</h2>
            </AbsoluteFill>
          </AbsoluteFill>
        </Sequence>
      ))}
      <Audio src={audioFileUrl} />
    </AbsoluteFill>
  );
}

export default RemotionVideo;
