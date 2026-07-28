import React, { useState } from "react";
import { Thumbnail } from "@remotion/player";
import { Play } from "lucide-react";
import { Play } from "lucide-react";
import RemotionVideo from "./RemotionVideo";
import PlayerDialog from "./PlayerDialog";

function VideoList({ videoList }) {
  const [openPlayer, setOpenPlayer] = useState(false);
  const [videoId, setVideoId] = useState();

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {videoList?.map((video, index) => {
        return (
          <div
            key={video?.id || index}
            className="group relative cursor-pointer"
            onClick={() => {
              setOpenPlayer(Date.now());
              setVideoId(video?.id);
            }}
          >
            {/* 9:16 frame */}
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl border border-border bg-black transition-all duration-200 group-hover:border-brand/60 group-hover:shadow-[0_10px_40px_-12px_hsl(var(--brand)/0.6)]">
              <div className="flex h-full w-full items-center justify-center overflow-hidden [&>*]:h-full [&>*]:w-full [&>*]:object-cover">
                {(video.finalVideoUrl || video.script?.finalVideoUrl) ? (
                  <video
                    src={video.finalVideoUrl || video.script.finalVideoUrl}
                    preload="metadata"
                    className="h-full w-full object-cover"
                    muted
                  />
                ) : (
                  <Thumbnail
                    component={RemotionVideo}
                    compositionWidth={150}
                    compositionHeight={266}
                    frameToDisplay={30}
                    durationInFrames={120}
                    fps={30}
                    inputProps={{
                      ...video,
                      isThumbnail: true,
                      setDurationFrames: () => {},
                    }}
                    style={{ height: "100%", width: "100%" }}
                  />
                )}
              </div>

              {/* Hover scrim + play affordance */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-brand/90 text-white shadow-lg transition-transform duration-200 group-hover:translate-y-0">
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                </span>
              </div>

              {/* Index chip — track number, mono */}
              <span className="timecode absolute left-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        );
      })}
      <PlayerDialog playVideo={openPlayer} videoId={videoId} />
    </div>
  );
}

export default VideoList;
