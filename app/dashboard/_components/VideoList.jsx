import React, { useState } from "react";
import { Thumbnail } from "@remotion/player";
import RemotionVideo from "./RemotionVideo";
import PlayerDialog from "./PlayerDialog";

function VideoList({ videoList }) {
  const [openPlayer, setOpenPlayer] = useState(false);
  const [videoId, setVideoId] = useState();

  return (
    <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 p-3">
      {videoList?.map((video, index) => {
        return (
          <div
            key={video?.id || index}
            className="flex items-center justify-center cursor-pointer hover:scale-105 transition-all"
            onClick={() => {
              setOpenPlayer(Date.now());
              setVideoId(video?.id);
            }}
          >
            <Thumbnail
              component={RemotionVideo}
              compositionWidth={150}
              compositionHeight={250}
              frameToDisplay={30}
              durationInFrames={120}
              fps={30}
              inputProps={{
                ...video,
                setDurationFrames: (v) => console.log(v),
              }}
              style={{
                borderRadius: 15,
                borderStyle: "solid",
                borderWidth: 2,
              }}
            />
          </div>
        );
      })}
      <PlayerDialog playVideo={openPlayer} videoId={videoId} />
    </div>
  );
}

export default VideoList;
