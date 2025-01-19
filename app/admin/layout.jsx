"use client";

import React, { useEffect, useState } from "react";
import SideNav from "./_components/SideNav";
import { UserDetailContext } from "../_context/userDataContext";
import { useUser } from "@clerk/nextjs";
import { Users } from "@/configs/schema";
import { db } from "@/configs/db";
import { eq } from "drizzle-orm";
import NavBar from "./_components/NavBar";
import BackgroundLayout from "../pages/BackgroundLayout";

function AdminDashboardLayout({ children }) {
  const [userData, setUserData] = useState([]);
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    user && getUserDetails();
  }, [user]);

  const getUserDetails = async () => {
    const result = await db
      .select()
      .from(Users)
      .where(eq(Users.email, user?.primaryEmailAddress?.emailAddress));

    setUserData(result[0]);
  };

  return (
    <UserDetailContext.Provider value={{ userData, setUserData }}>
      <BackgroundLayout>
        <div className="min-h-screen flex flex-col">
          {/* Fixed Header */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <NavBar 
              onMenuClick={() => setSideNavOpen(!sideNavOpen)}
              sideNavOpen={sideNavOpen}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex mt-[60px] relative flex-1">
            {/* Sidebar Overlay */}
            <div
              className={`fixed inset-0 bg-black/50 z-40 md:hidden ${
                sideNavOpen ? "block" : "hidden"
              }`}
              onClick={() => setSideNavOpen(false)}
            />

            {/* Sidebar */}
            <div
              className={`fixed top-[60px] left-0 h-[calc(100vh-60px)] w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 z-50 md:translate-x-0 ${
                sideNavOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <SideNav onClose={() => setSideNavOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="w-full md:ml-64 transition-all duration-300 min-h-[calc(100vh-60px)] p-5">
              {children}
            </div>
          </div>
        </div>
      </BackgroundLayout>
    </UserDetailContext.Provider>
  );
}

export default AdminDashboardLayout;