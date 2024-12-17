import React, { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import RemotionVideo from "./RemotionVideo";
import { Button } from "@/components/ui/button";
import { db } from "@/configs/db";
import { VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";

function PlayerDialog({ playVideo, videoId }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [durationInFrames, setDurationInFrames] = useState(100); // Default value

  useEffect(() => {
    setOpenDialog(playVideo);
    if (videoId) {
      getVideoData();
    }
  }, [playVideo, videoId]);

  const getVideoData = async () => {
    const result = await db
      .select()
      .from(VideoData)
      .where(eq(VideoData.id, videoId));
    console.log(result);
    setVideoData(result[0]);
  };

  const handleDurationFrames = (frames) => {
    setDurationInFrames(Math.round(frames)); // Round frames to ensure integer value
  };

  return (
    <Dialog open={openDialog}>
      <DialogContent className="bg-white flex flex-col items-center">
        <DialogTitle className="font-bold text-3xl my-5">
          Your video is ready!
        </DialogTitle>
        {videoData && (
          <Player
            component={RemotionVideo}
            durationInFrames={durationInFrames}
            compositionWidth={300}
            compositionHeight={450}
            fps={30}
            controls={true}
            inputProps={{
              ...videoData,
              setDurationFrames: handleDurationFrames,
            }}
          />
        )}
        <div className="flex items-center justify-center gap-5 mt-5">
          <Button>Export</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PlayerDialog;
