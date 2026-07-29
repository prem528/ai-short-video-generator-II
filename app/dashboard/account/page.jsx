'use client'

import React, { useEffect, useState, useContext } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader2, 
  Settings, 
  CreditCard, 
  LogOut, 
  CalendarDays, 
  Shield, 
  Mail, 
  User, 
  Activity,
  Zap
} from 'lucide-react'
import Link from "next/link"
import { useUser, SignOutButton } from "@clerk/nextjs";
import { db } from "@/configs/db";
import { VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { motion } from "framer-motion"
import { UserDetailContext } from "@/app/_context/userDataContext";

export default function AccountPage() {
  const [videoList, setVideoList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberSince, setMemberSince] = useState("Loading...");
  const { user } = useUser();
  const { userData } = useContext(UserDetailContext);

  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("loading...");
  const [userAvatar, setUserAvatar] = useState(null);

  // Fetch user details from Clerk
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      setUserName(fullName || "User");
      setUserEmail(user.primaryEmailAddress?.emailAddress || "");
      setUserAvatar(user.imageUrl);
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        setMemberSince(date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
      }
    }
  }, [user]);

  // Method to get all the videos created by the user:
  const getVideoList = async () => {
    if (!user) return;
    try {
      const result = await db
        .select()
        .from(VideoData)
        .where(eq(VideoData?.createdBy, user.primaryEmailAddress?.emailAddress));
      setVideoList(result);
    } catch (error) {
      console.error("Failed to fetch videos count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getVideoList();
    }
  }, [user]);

  const tabContentVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  const credits = userData?.credits ?? 0;
  const isPremium = userData?.subscription ?? false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="h-9 w-[3px] rounded-full bg-gradient-to-b from-brand to-brand-2" />
          <div>
            <span className="timecode text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Preferences
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Account & Settings
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Profile & Plan Summaries */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Profile Card */}
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-brand/20">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center text-secondary-foreground text-xl font-bold">
                      {userName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{userName}</CardTitle>
                  <CardDescription className="text-xs truncate max-w-[200px]">{userEmail}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Button 
                className="w-full text-xs font-semibold h-9" 
                variant="outline"
                onClick={() => {
                  const trigger = document.querySelector('.cl-userButtonTrigger');
                  if (trigger) trigger.click();
                }}
              >
                <User className="h-3.5 w-3.5 mr-2" />
                Edit Clerk Profile
              </Button>
              {/* Hidden element containing the Clerk user button to click programmatic */}
              <div className="hidden">
                <SignOutButton />
              </div>
            </CardContent>
          </Card>

          {/* Credits & Billing Card */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand-2" />
                Billing & Credits
              </CardTitle>
              <CardDescription className="text-xs">
                Manage your video credits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-secondary/30 p-3 border border-border/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground font-medium">Credits Balance</span>
                  <span className="timecode text-xs font-bold text-foreground">{credits} Credits</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((credits / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Active Plan</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                  ${isPremium ? "bg-brand/20 text-brand" : "bg-secondary text-muted-foreground"}`}>
                  {isPremium ? "Premium Pro" : "Free Plan"}
                </span>
              </div>

              <Link href="/dashboard/add-credits" className="block w-full">
                <Button className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold text-xs h-9">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Add More Credits
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Settings Preferences & Stats */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={tabContentVariants}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* Usage Stats (Real Data) */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-brand" />
                  Usage Statistics
                </CardTitle>
                <CardDescription className="text-xs">
                  Realtime data on your generated content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Video Output</span>
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <span className="text-2xl font-extrabold text-foreground">{videoList.length}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-0.5">Short videos generated all-time</span>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member Since</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-1.5">
                      <CalendarDays className="h-4.5 w-4.5 text-brand-2" />
                      {memberSince}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1.5">Date your profile was created</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Configuration Preferences */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-brand" />
                  Application Preferences
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize and manage notification and account behaviors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Email notifications */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-secondary/40 border border-border">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Email Notifications</h4>
                      <p className="text-[11px] text-muted-foreground">Receive weekly analytics, rendering reports, and system announcements.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-[11px] h-8">
                    Configure
                  </Button>
                </div>

                {/* Account Security */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-secondary/40 border border-border">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Multi-Factor Authentication</h4>
                      <p className="text-[11px] text-muted-foreground">Secure your video creations and account credentials with Clerk MFA.</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[11px] h-8"
                    onClick={() => {
                      const trigger = document.querySelector('.cl-userButtonTrigger');
                      if (trigger) trigger.click();
                    }}
                  >
                    Manage
                  </Button>
                </div>

                {/* Logout Row */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/5 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-red-500/10 border border-red-500/25">
                      <LogOut className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-red-500">Sign Out</h4>
                      <p className="text-[11px] text-muted-foreground">Safely log out of your current session on this machine.</p>
                    </div>
                  </div>
                  
                  <SignOutButton>
                    <Button variant="destructive" size="sm" className="text-[11px] h-8">
                      Sign Out
                    </Button>
                  </SignOutButton>
                </div>

              </CardContent>
            </Card>

          </motion.div>

        </div>

      </div>
    </div>
  );
}

