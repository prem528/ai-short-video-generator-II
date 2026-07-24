"use client";

import React, { useContext, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VideoDataContext } from "@/app/_context/VideoDataContext";
import CustomLoading from "@/components/CustomLoading";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
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

  useEffect(() => {
    console.log("videoData in editor:", videoData);
  }, [videoData]);

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

  const wordCount = videoScriptData.trim()
    ? videoScriptData.trim().split(/\s+/).length
    : 0;
  const credits = userData?.credits ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      {/* Page header */}
      <div className="mb-8">
        <Link
          href="/dashboard/create-new"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to setup
        </Link>
        <div className="flex items-center gap-3">
          <span className="h-9 w-[3px] rounded-full bg-gradient-to-b from-brand to-brand-2" />
          <div>
            <span className="timecode text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Step 2 · Review
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Review your script
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Script card */}
        <section className="rounded-xl border border-border bg-card p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-semibold leading-tight text-foreground">
                  Generated script
                </h3>
                <p className="text-sm text-muted-foreground">
                  Edit anything before we record the voiceover.
                </p>
              </div>
            </div>
            {!isloading && (
              <span className="timecode shrink-0 rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground">
                {wordCount} words
              </span>
            )}
          </div>

          {isloading ? (
            <div className="space-y-3 py-4" aria-label="Loading script">
              {[92, 100, 84, 96, 70, 100, 88].map((w, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-secondary"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          ) : (
            <Textarea
              className="min-h-[320px] resize-y rounded-lg p-4 text-base leading-relaxed"
              placeholder="Your script will appear here…"
              value={videoScriptData}
              onChange={handleChange}
            />
          )}
        </section>

        {/* Action bar */}
        <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Rendering uses{" "}
            <span className="font-medium text-foreground">1 credit</span> ·{" "}
            <span className="timecode text-foreground">{credits}</span> remaining
          </p>
          <Button
            className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={onCreateClickHandler}
            disabled={loadingState || isloading || !videoScriptData}
          >
            <Sparkles className="h-4 w-4" />
            {loadingState ? "Creating…" : "Create video"}
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
