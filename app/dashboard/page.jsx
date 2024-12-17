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
        <h2 className="font-bold text-2xl text-primary">Dashboard</h2>
        <Link href={"dashboard/create-new"}>
          <Button>Create New Video</Button>
        </Link>
      </div>

      {/* Empty state */}
      {videoList?.length == 0 && (
        <div>
          {" "}
          <EmptyState />
        </div>
      )}

      {/* List of videos */}
      <VideoList videoList={videoList} />
    </div>
  );
}

export default Dashboard;
