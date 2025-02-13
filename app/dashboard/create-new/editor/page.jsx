"use client";

import React, { useContext, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VideoDataContext } from "@/app/_context/VideoDataContext";
import CustomLoading from "@/components/CustomLoading";
import { Loader2 } from "lucide-react";

export default function page() {
  const { videoData, setVideoData } = useContext(VideoDataContext);
  const [videoScriptData, setVideoScriptData] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [isloading, setIsLoading] = useState(true);

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

      setIsLoading(false); // Stop loading after processing
    }, 500); // Delay to allow React to reflect the change
  }, [videoData]);

  // Handle manual input changes
  const handleChange = (e) => {
    const newValue = e.target.value;
    setVideoScriptData(newValue);

    setVideoData((prev) => ({
      ...prev,
      videoScript: newValue,
    }));

    console.log(videoData);
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
          <Button className="flex items-center rounded-full">
            Create Video
          </Button>
        </div>
      </div>

      {/* Loading Screen */}
      <CustomLoading loading={loadingState} />
    </div>
  );
}
