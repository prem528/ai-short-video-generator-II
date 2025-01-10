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
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

function PlayerDialog({ playVideo, videoId }) {
  const [loadingState, setLoadingState] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [durationInFrames, setDurationInFrames] = useState(10000); // Default value
  const router = useRouter();
  const { toast } = useToast();

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
        setVideoData(result[0]);
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

  // Function to handle export video using GCP Cloudrun:
  const handleExport = async () => {
    console.log("video data:", videoData);

    setLoadingState(true);
    try {
      const updatedVideoData = {
        ...videoData,
        durationInFrames: durationInFrames,
      };
      const response = await axios.post("/api/render-video", {
        videoData: updatedVideoData,
      });

      if (response.status === 200) {
        const { bucketName, renderId, publicUrl } = response.data;
        const videoUrl = `https://storage.googleapis.com/${bucketName}/${renderId}.mp4`;

        console.log("Video successfully rendered:", videoUrl);
        console.log("PublicUrl :", publicUrl);

        // Open the video URL in a new tab
        window.open(publicUrl, "_blank");
      } else {
        console.error("Error rendering video:", response.data.message);
      }
    } catch (error) {
      console.error("Error calling API:", error.message);
    } finally {
      setLoadingState(false);
    }
  };

  // Function to delete a video:
  const handleDelete = async () => {
    try {
      setLoadingState(true);
      const response = await axios.delete("/api/delete-video", {
        data: { videoId }, // Pass the videoId in the request body
      });

      if (response.status === 200) {
        toast({
          title: "Video Deleted",
          description: "The video has been deleted successfully.",
          variant: "success",
        });
        setOpenDialog(false); // Close the dialog after deletion
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the video.",
          variant: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the video.",
        variant: "error",
      });
      console.error(error);
    } finally {
      setLoadingState(false);
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
            <Button onClick={handleExport}>Export</Button>
            <Button
              className="bg-red-500 hover:bg-red-400"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              className="bg-transparent text-black hover:bg-black hover:text-white"
              onClick={() => {
                setOpenDialog(false);
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
