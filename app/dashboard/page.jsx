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

  // Method to get all the videos created by the user:
  const getVideoList = async () => {
    const result = await db
      .select()
      .from(VideoData)
      .where(eq(VideoData?.createdBy, user.primaryEmailAddress?.emailAddress));

    // console.log("Result fetching:", result);
    setVideoList(result);
  };

  useEffect(() => {
    user && getVideoList();
  }, [user]);

  // console.log("VideoList:", videoList);

  return (
    <div className="p-5">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Dashboard</h2>
        <Link href={"dashboard/create-new"}>
          <Button>
             <Plus className="w-5 h-5" /> 
              New Video
             </Button>
        </Link>
      </div>
      <div>
        <MainDashboard/>
        <QuickActions/>
      </div>
      <VideoContainer/>
      
    </div>
  );
}

export default Dashboard;
