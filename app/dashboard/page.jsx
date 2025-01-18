"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import EmptyState from "./_components/EmptyState";
import Link from "next/link";
import { db } from "@/configs/db";
import { VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import VideoList from "./_components/VideoList";
import { MainDashboard } from "./_components/MainDashboard";
import { Plus } from "lucide-react";
import VideoContainer from "./_components/VideoContainer";
import QuickActions from "./_components/QuickActions";

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
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-primary">
          Dashboard
        </h2>
        <Link href="dashboard/create-new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Video
          </Button>
        </Link>
      </div>
      <div className="space-y-6">
        <MainDashboard />
        <QuickActions />
        <VideoContainer />
      </div>
    </div>
  );
}

export default Dashboard;
