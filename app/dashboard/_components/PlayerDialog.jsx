import React, { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import RemotionVideo from "./RemotionVideo";
import { Button } from "@/components/ui/button";
import { db } from "@/configs/db";
import { VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { useRouter } from "next/navigation";
import CustomLoading from "@/components/CustomLoading";

function PlayerDialog({ playVideo, videoId }) {
  const [loadingState, setLoadingState] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [durationInFrames, setDurationInFrames] = useState(10000); // Default value
  const router = useRouter();

  useEffect(() => {
    if (playVideo && videoId) {
      setLoadingState(true);
      getVideoData(videoId); // Fetch video data
    } else {
      setOpenDialog(false); // Close dialog if playVideo is false
    }
  }, [playVideo, videoId]);

  const getVideoData = async (videoId) => {
    try {
      const result = await db
        .select()
        .from(VideoData)
        .where(eq(VideoData.id, videoId));

      if (result?.length) {
        setVideoData(result[0]); // Set the fetched video data
        calculateDurationFrames(result[0].captions);
        setOpenDialog(true);
      } else {
        console.error("No video data found for the given video ID.");
      }
    } catch (error) {
      console.error("Error fetching video data:", error);
    } finally {
      setLoadingState(false);
    }
  };

  const calculateDurationFrames = (captions) => {
    if (captions?.length > 0) {
      const lastCaptionEnd = captions[captions.length - 1]?.end;
      if (lastCaptionEnd) {
        const durationInSeconds = lastCaptionEnd / 1000;
        setDurationInFrames(Math.round(durationInSeconds * 30));
      }
    }
  };

  return (
    <>
      <CustomLoading loading={loadingState} />
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
              }}
            />
          )}
          <div className="flex items-center justify-center gap-5 mt-5">
            <Button>Export</Button>
            <Button
              className="bg-transparent text-black hover:bg-black hover:text-white"
              onClick={() => {
                setOpenDialog(false); // Close the dialog
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PlayerDialog;
