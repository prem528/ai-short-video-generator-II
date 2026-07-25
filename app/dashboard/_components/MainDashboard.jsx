import React, { useEffect, useState } from "react";
import { DashboardCard } from "./DashboardCard";
import { Film, Clock, Zap } from "lucide-react";
import { db } from "@/configs/db";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { Users, VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";

export const MainDashboard = () => {
  const [data, setData] = useState({
    userVideosCount: 0,
  });

  const { user } = useUser();

  // Function to get videos created by the logged-in user
  const getUserVideosCount = async () => {
    if (!user) return;

    try {
      const result = await db
        .select()
        .from(VideoData)
        .where(eq(VideoData.createdBy, user.primaryEmailAddress?.emailAddress));
      setData((prevData) => ({
        ...prevData,
        userVideosCount: result.length,
      }));
    } catch (error) {
      console.error("Error fetching user's videos:", error.message);
    }
  };

  useEffect(() => {
    getUserVideosCount();
  }, [user]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Rendered Shorts"
        value={data.userVideosCount}
        unit="clips"
        icon={Film}
        description="Videos generated on your account"
      />
      <DashboardCard
        title="Avg Render"
        value="1:30"
        unit="min"
        icon={Clock}
        description="Typical time from prompt to export"
      />
      <DashboardCard
        title="Credits"
        value="85 / 100"
        icon={Zap}
        accent="coral"
        progress={85}
        description="Resets at the start of next cycle"
      />
    </div>
  );
};
