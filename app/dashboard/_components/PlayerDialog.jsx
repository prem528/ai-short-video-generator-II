import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RemotionVideo from "./RemotionVideo";
import { Player } from "@remotion/player";
import { Button } from "@/components/ui/button";
import { VideoData } from "@/configs/schema";

function PlayerDialog({ playVideo, videoId }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [videoData, setVideoData] = useState();
  const [durationInFrame, setDurationInFrame] = useState(100);

  useEffect(() => {
    setOpenDialog(playVideo)
    videoId&&getVideoData();
  }, [playVideo]);


  const getVideoData = async() => {
    const result = await db.select().from(VideoData).where(eq(VideoData.id, videoId));
    console.log(result);
    setVideoData(result[0])
  }


  return (
    <Dialog open={openDialog}>
      <DialogContent className="bg-white flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold my-5">
            Your video is ready!
          </DialogTitle>
          <DialogDescription>
            <Player
              component={RemotionVideo}
              durationInFrames={Number(durationInFrame.toFixed(0))}
              compositionWidth={300}
              compositionHeight={450}
              fps={30}
              controls={true}
              inputProps={{...VideoData,
                setDurationInFrame: (frameValue) => setDurationInFrame(frameValue)
              }}
            />

            <div className="flex gap-10 mt-10">
                <Button variant='ghost'>
                    Cancel
                </Button>
                <Button>
                    Export
                </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default PlayerDialog;