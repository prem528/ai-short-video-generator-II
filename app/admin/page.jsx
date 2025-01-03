"use client";

import React, { useEffect, useState } from "react";
import InfoCard from "./_components/InfoCard";
import axios from "axios";
import { db } from "@/configs/db";
import { Users, VideoData } from "@/configs/schema";
import MonthlyEarningsChart from "./_components/MonthlyEarningsChart";

export default function AdminDashboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalVideos: 0,
  });

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

  const getTotalUsers = async () => {
    try {
      const count = await db.$count(Users);
      setData((prevData) => ({
        ...prevData,
        totalUsers: count,
      }));
    } catch (error) {
      console.error("Error fetching total users:", error.message);
    }
  };

  const getTotalVideos = async () => {
    try {
      const count = await db.$count(VideoData);
      setData((prevData) => ({
        ...prevData,
        totalVideos: count,
      }));
    } catch (error) {
      console.error("Error fetching total videos:", error.message);
    }
  };

  useEffect(() => {
    fetchMonthlyRevenue(), getTotalUsers(), getTotalVideos();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen rounded-md">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-3xl text-primary">Admin Dashboard</h2>
      </div>

      {/* Info Cards */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6">
        <InfoCard
          title="This Month Revenue"
          value={data.totalRevenue}
          sign="₹"
          className="bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition-shadow"
        />
        <InfoCard
          title="Total Users"
          value={data.totalUsers}
          className="bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition-shadow"
        />
        <InfoCard
          title="Total Videos Generated"
          value={data.totalVideos}
          className="bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition-shadow"
        />
      </div>

      {/* Monthly Earnings Chart */}
      <div>
        <MonthlyEarningsChart />
      </div>
    </div>
  );
}
