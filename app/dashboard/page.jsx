"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/configs/db";
import { VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import VideoList from "./_components/VideoList";
import { MainDashboard } from "./_components/MainDashboard";
import { Plus } from "lucide-react";
import VideoContainer from "./_components/VideoContainer";


function Dashboard() {
  const [videoList, setVideoList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    user && getVideoList();
  }, [user]);

  // Method to get all the videos created by the user:
  const getVideoList = async () => {
    const result = await db
      .select()
      .from(VideoData)
      .where(eq(VideoData?.createdBy, user.primaryEmailAddress?.emailAddress));

    // console.log("Result fetching:", result);
    setVideoList(result);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          {/* Playhead tick — the signature marker on the page title */}
          <span className="h-9 w-[3px] rounded-full bg-gradient-to-b from-brand to-brand-2" />
          <div>
            <span className="timecode text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Your Studio
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Dashboard
            </h2>
          </div>
        </div>
        <Link href="dashboard/create-new">
          <Button className="bg-brand text-brand-foreground shadow-sm hover:bg-brand/90">
            <Plus className="mr-2 h-4 w-4" />
            New Video
          </Button>
        </Link>
      </div>
      <div className="space-y-8">
        <MainDashboard />
        <VideoContainer />
      </div>
    </div>
  );
}

export default Dashboard;
