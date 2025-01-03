"use client";

import React, { useEffect, useState } from "react";
import InfoCard from "./_components/InfoCard";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { db } from "@/configs/db";
import { Users, VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";

export default function AdminDashboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalVideos: 0,
  });
  const { user } = useUser();
  const { toast } = useToast();

  // Function to fetch monthly revenue data:
  const fetchMonthlyRevenue = async () => {
    try {
      const response = await axios.get("/api/get-monthly-revenue");
      if (response.data.success) {
        setData((prevData) => ({
          ...prevData,
          totalRevenue: response?.data?.revenue,
        }));
        // console.log(`This month's revenue: ₹${response.data.revenue}`);
      } else {
        console.error("Failed to fetch revenue.");
      }
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
    }
  };

  // Function to get total users
  const getTotalUsers = async () => {
    try {
      const count = await db.$count(Users);

      // console.log("Total Users:", count);

      setData((prevData) => ({
        ...prevData,
        totalUsers: count,
      }));
    } catch (error) {
      console.error("Error fetching total users:", error.message);
    }
  };

  // Function to get total videos
  const getTotalVideos = async () => {
    try {
      const count = await db.$count(VideoData);

      // console.log("Total Videos:", count);

      setData((prevData) => ({
        ...prevData,
        totalVideos: count,
      }));
    } catch (error) {
      console.error("Error fetching total videos:", error.message);
    }
  };

  useEffect(() => {
    fetchMonthlyRevenue();
    getTotalUsers();
    getTotalVideos();
  }, []);

  return (
    <div className="p-5">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl text-primary">Admin Dashboard</h2>
      </div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-1 mt-5">
        <InfoCard
          header={"This Month Revenue"}
          amount={data.totalRevenue}
          sign={"₹"}
        />
        <InfoCard header={"Total Users"} amount={data.totalUsers} />
        <InfoCard header={"Total Videos Generated"} amount={data.totalVideos} />
      </div>
    </div>
  );
}
