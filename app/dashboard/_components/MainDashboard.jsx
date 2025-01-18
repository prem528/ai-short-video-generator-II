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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Your Videos"
          value={data.userVideosCount}
          icon={Film}
          description="Videos created by you"
        />
        <DashboardCard
          title="Processing Time"
          value="1.5 minutes"
          icon={Clock}
          description="Average processing time"
        />
        <DashboardCard
          title="Credits Used"
          value={85}
          icon={Zap}
          description="Out of 100 monthly credits"
        />
      </div>
    </div>
  );
};
