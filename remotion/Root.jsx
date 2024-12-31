import React, { useEffect, useState } from "react";
import { Composition } from "remotion";
import { Player } from "@remotion/player";
import RemotionVideo from "../app/dashboard/_components/RemotionVideo";
import { db } from "../configs/db";
import { VideoData } from "../configs/schema";
import { eq } from "drizzle-orm";

function RemotionRoot() {
  const videoId = 14; // Replace with the desired video ID
  const [videoData, setVideoData] = useState(null);
  const [durationInFrames, setDurationInFrames] = useState(10000);

  useEffect(() => {
    if (videoId) {
      getVideoData(videoId); // Fetch video data
    }
  }, [videoId]);

  const getVideoData = async (videoId) => {
    try {
      const result = await db
        .select()
        .from(VideoData)
        .where(eq(VideoData.id, videoId));

      if (result?.length) {
        setVideoData(result[0]); // Set the fetched video data
        calculateDurationFrames(result[0].captions);
      } else {
        console.error("No video data found for the given video ID.");
      }
    } catch (error) {
      console.error("Error fetching video data:", error);
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
      <Composition
        id="video-result"
        component={RemotionVideo}
        durationInFrames={durationInFrames}
        width={720}
        height={1080}
        fps={30}
        defaultProps={{
          ...videoData,
        }}
      />
    </>
  );
}

export default RemotionRoot;
