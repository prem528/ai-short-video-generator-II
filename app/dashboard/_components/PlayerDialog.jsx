import React, { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
      setLoadingState(true);
      const result = await db
        .select()
        .from(VideoData)
        .where(eq(VideoData.id, videoId));

      if (result?.length) {
        const currentData = result[0];
        setVideoData(currentData);
        
        let totalFrames = 10000;
        if (currentData.script?.isAssembleFlow && Array.isArray(currentData.script.mediaList)) {
          totalFrames = currentData.script.mediaList.reduce(
            (acc, item) => acc + Math.round((Number(item.duration) || 0) * 30),
            0
          );
        } else if (currentData.captions?.length > 0) {
          const lastCaptionEnd = currentData.captions[currentData.captions.length - 1]?.end;
          if (lastCaptionEnd) {
            const durationInSeconds = lastCaptionEnd / 1000;
            totalFrames = Math.round(durationInSeconds * 30);
          }
        }
        setDurationInFrames(totalFrames);
        setOpenDialog(true);

        // Auto compile/export if finalVideoUrl is missing
        if (!currentData.finalVideoUrl && !currentData.script?.finalVideoUrl) {
          console.log("[PlayerDialog] Video is not compiled. Auto-compiling video...");
          await handleExport(currentData, totalFrames);
        }
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
  const handleExport = async (customVideoData = null, customFrames = null) => {
    const activeVideoData = customVideoData || videoData;
    const activeFrames = customFrames || durationInFrames;

    if (!activeVideoData) return;

    console.log("video data for export:", activeVideoData);

    setLoadingState(true);
    try {
      const updatedVideoData = {
        ...activeVideoData,
        durationInFrames: activeFrames,
      };
      const response = await axios.post("/api/render-video", {
        videoData: updatedVideoData,
      });

      if (response.status === 200) {
        const { bucketName, renderId, publicUrl } = response.data;
        const videoUrl = `https://storage.googleapis.com/${bucketName}/${renderId}.mp4`;

        console.log("Video successfully rendered and uploaded:", publicUrl);

        // Update database record to store the final video URL in script JSON and finalVideoUrl column
        try {
          const updatedScript = {
            ...activeVideoData.script,
            finalVideoUrl: publicUrl
          };
          await db
            .update(VideoData)
            .set({ 
              script: updatedScript,
              finalVideoUrl: publicUrl
            })
            .where(eq(VideoData.id, activeVideoData.id));

          // Update the local state so the preview instantly switches to the native video tag
          setVideoData(prev => ({
            ...prev,
            script: updatedScript,
            finalVideoUrl: publicUrl
          }));
          console.log("[PlayerDialog] Database successfully updated with finalVideoUrl:", publicUrl);
          
          // Trigger page refresh so dashboard feeds update
          router.refresh();
        } catch (dbErr) {
          console.error("[PlayerDialog] Failed to save finalVideoUrl to database:", dbErr.message);
        }

        // Trigger automatic browser file download to local Downloads folder
        try {
          const res = await fetch(`/api/download?url=${encodeURIComponent(publicUrl)}`);
          const blob = await res.blob();
          const downloadUrl = URL.createObjectURL(blob);
          
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.setAttribute("download", `short-video-${activeVideoData.id || Date.now()}.mp4`);
          document.body.appendChild(link);
          link.click();
          
          // Clean up the temporary DOM element and object URL
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        } catch (downloadErr) {
          console.error("Auto-download failed, falling back to opening in a new tab:", downloadErr.message);
          window.open(publicUrl, "_blank");
        }
      } else {
        console.error("Error rendering video:", response.data.message);
      }
    } catch (error) {
      console.error("Error calling API:", error.message);
      if (error.response?.data) {
        console.error("API error details:", error.response.data);
      }
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
          <DialogDescription className="sr-only">
            Preview and export your generated video.
          </DialogDescription>
          {videoData && (
            (videoData.finalVideoUrl || videoData.script?.finalVideoUrl) ? (
              <video
                src={videoData.finalVideoUrl || videoData.script.finalVideoUrl}
                controls
                className="rounded-xl border border-gray-200 bg-black shadow-md object-contain"
                style={{
                  width: videoData?.script?.aspectRatio === "16:9" ? "450px" : "300px",
                  height: videoData?.script?.aspectRatio === "16:9" ? "253px" : "450px",
                }}
              />
            ) : (
              <Player
                component={RemotionVideo}
                durationInFrames={durationInFrames}
                compositionWidth={videoData?.script?.aspectRatio === "16:9" ? 450 : 300}
                compositionHeight={videoData?.script?.aspectRatio === "16:9" ? 253 : 450}
                fps={30}
                controls={true}
                inputProps={{
                  ...videoData,
                }}
              />
            )
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
