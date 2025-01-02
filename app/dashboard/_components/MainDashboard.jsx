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
    totalRevenue: 0,
    totalUsers: 0,
    userVideosCount: 0, // Renamed for clarity
  });

  const { user } = useUser();
  const { toast } = useToast();

  // Function to fetch monthly revenue data
  const fetchMonthlyRevenue = async () => {
    try {
      const response = await axios.get("/api/get-monthly-revenue");
      if (response.data.success) {
        setData((prevData) => ({
          ...prevData,
          totalRevenue: response?.data?.revenue,
        }));
      } else {
        console.error("Failed to fetch revenue.");
      }
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
    }
  };

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
    fetchMonthlyRevenue();
    getUserVideosCount();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Your Videos"
          value={data.userVideosCount} // Updated to use user's video count
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
