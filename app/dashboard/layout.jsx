"use client";

import React, { useState } from "react";
import Header from "./_components/Header";
import SideNav from "./_components/SideNav";
import { VideoDataContext } from "../_context/VideoDataContext";

function DashboardLayout({ children }) {
  const[videoData, setVideoData] = useState([]);

  return (
    <VideoDataContext.Provider value={{videoData, setVideoData}}>
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <div className="pt-[60px] flex">
        <div className="hidden md:block fixed left-0 h-[calc(100vh-60px)] bg-gray-200 w-64">
          <SideNav />
        </div>
        <div className="flex-1 md:ml-64 p-5">
          {children}
        </div>
      </div>
    </div>
    </VideoDataContext.Provider>
  );
}

export default DashboardLayout;
