"use client";

import React, { useContext, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VideoDataContext } from "@/app/_context/VideoDataContext";
import CustomLoading from "@/components/CustomLoading";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/configs/db";
import { Users, VideoData } from "@/configs/schema";
import { UserDetailContext } from "@/app/_context/userDataContext";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import PlayerDialog from "../../_components/PlayerDialog";

export default function page() {
  const [videoScriptData, setVideoScriptData] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [isloading, setIsLoading] = useState(true);
  const [audioFileUrl, setAudioFileUrl] = useState();
  const [captions, setCaptions] = useState();
  const [playVideo, setPlayVideo] = useState(false);
  const [videoId, setVideoId] = useState(1);

  const { videoData, setVideoData } = useContext(VideoDataContext);
  const { userData, setUserData } = useContext(UserDetailContext);

  const { toast } = useToast();
  const { user } = useUser();

  // Process videoScript from videoData when videoData updates
  useEffect(() => {
    if (!videoData?.videoScript || !Array.isArray(videoData.videoScript))
      return;

    setTimeout(() => {
      const scriptText = videoData.videoScript
        .map((item) => item.contentText)
        .join(" ");

      if (scriptText !== videoScriptData) {
        setVideoScriptData(scriptText);
      }

      setIsLoading(false);
    }, 500);
  }, [videoData]);

  useEffect(() => {
    // Ensure all required fields are present before saving
    if (
      videoData &&
      typeof videoData === "object" &&
      Object.keys(videoData).length === 7
    ) {
      saveVideoData(videoData);
    }
  }, [videoData]);

  // Handle manual input changes
  const handleChange = (e) => {
    const newValue = e.target.value;
    setVideoScriptData(newValue);

    setVideoData((prev) => ({
      ...prev,
      videoScript: newValue,
    }));
  };

  // Handle the create create video button:
  const onCreateClickHandler = async () => {
    try {
      // Wait for getVideoScript to complete
      if (!userData?.credits > 0) {
        // Alert user if he dosen't have sufficient credits.
        toast({
          title: "Error",
          description: "Insufficient credits. Please add more credits.",
        });
      }
      videoScriptData &&
        (await generateAudioFile(
          videoScriptData,
          videoData.language,
          videoData.gender
        ));
    } catch (error) {
      console.error("Error in onCreateClickHandler:", error);
    }
  };

  // Generating the audiofile:
  const generateAudioFile = async (videoScriptData, language, gender) => {
    setLoadingState(true);
    const id = uuidv4();

    try {
      const resp = await axios.post("/api/generate-audio", {
        text: videoScriptData,
        id: id,
        language: language,
        gender: gender,
      });

      const audioFileUrl = resp.data.Result;

      if (audioFileUrl) {
        setVideoData((prev) => ({
          ...prev,
          audioFileUrl: audioFileUrl,
        }));

        setAudioFileUrl(audioFileUrl);

        await generateAudioCaptions(audioFileUrl);
      } else {
        console.warn("No audioFileUrl returned from the API.");
      }
    } catch (error) {
      console.error("Error generating audio file:", error);
    } finally {
      setLoadingState(false);
    }
  };

  //  Generating audio captions for the video:
  const generateAudioCaptions = async (fileUrl) => {
    setLoadingState(true);

    try {
      const resp = await axios.post("/api/generate-caption", {
        audioFileUrl: fileUrl,
      });

      setVideoData((prev) => ({
        ...prev,
        captions: resp.data.result,
      }));

      setCaptions(resp.data.result);
    } catch (error) {
      console.error("Error generating captions:", error);
    } finally {
      setLoadingState(false);
    }
  };

  const saveVideoData = async (videoData) => {
    if (!videoData || typeof videoData !== "object") {
      console.error("Invalid videoData:", videoData);
      return;
    }

    if (!user || !user.primaryEmailAddress?.emailAddress) {
      console.error("Invalid user or user email:", user);
      return;
    }

    setLoadingState(true);

    try {
      const query = db.insert(VideoData).values({
        script: videoData?.videoScript,
        audioFileUrl: videoData?.audioFileUrl,
        captions: videoData?.captions,
        imageList: videoData?.imageList,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        title: videoData?.title,
        language: videoData?.language,
        gender: videoData?.gender,
      });

      const result = await query.returning({ id: VideoData?.id });

      if (result && result.length > 0) {
        const newVideoId = result[0].id;
        setVideoId(newVideoId);
        setPlayVideo(true);
      }

      await updateUserCredits();

      toast({
        title: "Success!",
        description: "Video generated successfully!",
      });
    } catch (error) {
      console.error("Error saving video data:", error);
    } finally {
      setLoadingState(false);
    }
  };

  // Used to update user's credits:
  const updateUserCredits = async () => {
    const result = await db
      .update(Users)
      .set({ credits: userData?.credits - 1 })
      .where(eq(Users?.email, user?.primaryEmailAddress?.emailAddress));

    setUserData((prev) => ({
      ...prev,
      credits: userData?.credits - 1,
    }));

    setVideoData([]);
    setVideoScriptData("");
  };

  return (
    <div className="md:px-20 py-10">
      <h2 className="font-bold text-4xl text-primary text-center">
        Generated Script
      </h2>
      <div className="mt-10 p-10 relative border animate-shadow-pulse rounded-xl ">
        <h2 className="font-normal text-xl text-center text-primary">
          Please review the script
        </h2>

        {isloading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="mt-5 mb-5">
            <Textarea
              className="mt-3 resize-none text-2xl p-4 rounded-lg"
              placeholder="Script"
              value={videoScriptData}
              onChange={handleChange}
              rows={30}
            />
          </div>
        )}

        {/* Create Button */}
        <div className="flex justify-center mt-5">
          <Button
            className="flex items-center rounded-full"
            onClick={onCreateClickHandler}
          >
            Create Video
          </Button>
        </div>
      </div>

      {/* Loading Screen */}
      <CustomLoading loading={loadingState} />

      {/* Video Player */}
      <PlayerDialog playVideo={playVideo} videoId={videoId} />
    </div>
  );
}
