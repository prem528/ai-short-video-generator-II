import React, { useEffect, useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { Film, Clock, Zap } from 'lucide-react';
import { db } from '@/configs/db';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { Users, VideoData } from '@/configs/schema';

const mockVideos = [
  { id: '1', title: 'Product Showcase', duration: '2:30', status: 'completed' },
  { id: '2', title: 'Tutorial Video', duration: '5:45', status: 'processing' },
  { id: '3', title: 'Company Introduction', duration: '3:15', status: 'failed' },
]; 


export const MainDashboard = () => {

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
  
      console.log("Total Users:", count);
  
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
  
      console.log("Total Videos:", count);
  
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
         <DashboardCard
          title="Total Videos"
          value={data.totalVideos}
          icon={Film}
          description="Videos created this month"
        />
        <DashboardCard
          title="Processing Time"
          value="1. 5 minutes"
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
