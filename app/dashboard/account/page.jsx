'use client'

import Image from "next/image"
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Video, Settings, Loader2 } from 'lucide-react'
import img from "@/public/user1.png"
import Link from "next/link"
import VideoList from "../_components/VideoList"
import { useUser } from "@clerk/nextjs";
import { db } from "@/configs/db";
import { VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { motion } from "framer-motion"
import { UserButton } from "@clerk/nextjs";


export default function AccountPage() {

  const [videoList, setVideoList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  const [userName, setUserName] = useState("John Doe");
  const [userEmail, setUserEmail] = useState("john.doe@example.com");

  // Fetch user details
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      setUserName(fullName || "John Doe");
      setUserEmail(user.primaryEmailAddress?.emailAddress || "john.doe@example.com");
    }
  }, [user]);


  // Method to get all the videos created by the user:
  const getVideoList = async () => {
    try {
      const result = await db
        .select()
        .from(VideoData)
        .where(eq(VideoData?.createdBy, user.primaryEmailAddress?.emailAddress));
      setVideoList(result);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    user && getVideoList();
  }, [user]);

  // Add these animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 10 }
  }

  return (
    <div className="container mx-auto py-0 ">
      <h1 className="text-4xl font-bold mb-6">Your Account</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_3fr]">

        <Card className='h-80'>
          <CardHeader>
            <div className="flex flex-col items-center space-y-4">
              <Image
                src={img}
                alt="img"
                width={100}
                height={100}
                className="rounded"
              />
              <div className="text-center">
                <CardTitle>{userName}</CardTitle>
                <CardDescription>{userEmail}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full   hover:bg-blue-500" 
              variant="outline"
              onClick={() => document.querySelector('.cl-userButtonTrigger').click()}
            >
              Edit Profile
            </Button>
            <div className="hidden">
              <UserButton/>
            </div>
          </CardContent>
        </Card >
        <Tabs defaultValue="videos">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="videos">
              <Video className="mr-2 h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="usage">
              <CalendarDays className="mr-2 h-4 w-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="videos">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={tabContentVariants}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Your Generated Videos</CardTitle>
                  <CardDescription>View and manage your AI-generated short videos.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[58vh] overflow-y-auto scrollbar-hide">
                  {isLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div>
                      {videoList?.length === 0 ? (
                        <div>
                          <h2 className="font-extrabold text-center">NO VIDEOS TO SHOW</h2>
                        </div>
                      ) : (
                        <VideoList videoList={videoList} />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          <TabsContent value="usage">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={tabContentVariants}
              transition={{ duration: 0.3 }}
            >
              <Card className=''>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Track your video generation usage and limits.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Videos Generated This Month</h4>
                      <p className="text-3xl font-bold">24 / 50</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Storage Used</h4>
                      <p className="text-3xl font-bold">1.2 GB / 5 GB</p>
                    </div>
                    <Link
                      href={'/dashboard/add-credits'}>
                      <Button>Upgrade Plan</Button>
                    </Link>

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          <TabsContent value="settings">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={tabContentVariants}
              transition={{ duration: 0.3 }}
            >
              <Card className=''>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive emails about your account and videos</p>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive">Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

