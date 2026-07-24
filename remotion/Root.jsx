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
        const durationInFrames =
          props?.durationInFrames ||
          getDurationInFrames(props?.captions, FPS);
        return { durationInFrames };
      }}
    />
  );
}

export default RemotionRoot;
