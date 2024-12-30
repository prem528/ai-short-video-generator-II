"use client";

import React, { useEffect, useState } from "react";
import Header from "./_components/Header";
import SideNav from "./_components/SideNav";
import { VideoDataContext } from "../_context/VideoDataContext";
import { UserDetailContext } from "../_context/userDataContext";
import { useUser } from "@clerk/nextjs";
import { Users } from "@/configs/schema";
import { db } from "@/configs/db";
import { eq } from "drizzle-orm";
import BackgroundLayout from "../pages/BackgroundLayout";

function DashboardLayout({ children }) {
  const [videoData, setVideoData] = useState([]);
  const [userData, setUserData] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    user && getUserDetails();
  }, [user]);

  const getUserDetails = async () => {
    const result = await db
      .select()
      .from(Users)
      .where(eq(Users.email, user?.primaryEmailAddress?.emailAddress));

    console.log("Result :", result[0]);
    setUserData(result[0]);
  };

  return (
    <UserDetailContext.Provider value={{ userData, setUserData }}>
      <VideoDataContext.Provider value={{ videoData, setVideoData }}>
        <BackgroundLayout>

        
        <div className="min-h-screen">
          <div className="fixed top-0 left-0 right-0 z-50">
            
            <Header />
            
          </div>
          <div className="pt-[60px] flex">
            <div className="hidden md:block fixed left-0 h-[calc(100vh-60px)]   w-64">
              <SideNav />
            </div>
            <div className="flex-1 md:ml-64 p-5">{children}</div>
          </div>
        </div>
        </BackgroundLayout>
      </VideoDataContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default DashboardLayout;
