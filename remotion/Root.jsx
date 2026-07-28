import React from "react";
import { Composition } from "remotion";
import RemotionComposition, {
  getDurationInFrames,
} from "./RemotionComposition";

const FPS = 30;

function RemotionRoot() {
  return (
    <Composition
      id="video-result"
      component={RemotionComposition}
      durationInFrames={FPS * 5} // placeholder; real value comes from calculateMetadata
      width={720}
      height={1080}
      fps={FPS}
      // Derive the true duration from the caption track so the timeline length
      // always matches the audio. This keeps the crossfade / zoom math correct.
      calculateMetadata={({ props }) => {
        const isLandscape = props?.script?.aspectRatio === "16:9";
        const width = isLandscape ? 1920 : 720;
        const height = isLandscape ? 1080 : 1080;

        const durationInFrames =
          props?.durationInFrames ||
          (props?.script?.isAssembleFlow && Array.isArray(props.script.mediaList)
            ? props.script.mediaList.reduce((acc, item) => acc + Math.round((Number(item.duration) || 0) * FPS), 0)
            : getDurationInFrames(props?.captions, FPS));
        return { durationInFrames, width, height };
      }}
    />
  );
}

export default RemotionRoot;
