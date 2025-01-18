import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoData } from "@/configs/schema";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import VideoList from "./VideoList";
import { db } from "@/configs/db";
import { eq } from "drizzle-orm";
import EmptyState from "./EmptyState";

const VideoContainer = () => {
  const [videoList, setVideoList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useUser();

  const [userName, setUserName] = useState("John Doe");
  const [userEmail, setUserEmail] = useState("john.doe@example.com");

  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      setUserName(fullName || "John Doe");
      setUserEmail(
        user.primaryEmailAddress?.emailAddress || "john.doe@example.com"
      );
    }
  }, [user]);

  const getVideoList = async () => {
    try {
      const result = await db
        .select()
        .from(VideoData)
        .where(
          eq(VideoData?.createdBy, user.primaryEmailAddress?.emailAddress)
        );
      setVideoList(result);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    user && getVideoList();
  }, [user]);

  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 10 },
  };

  return (
    <div className="w-full">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={tabContentVariants}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Recent Videos</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[58vh] overflow-y-auto scrollbar-hide">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="w-full">
                {videoList?.length === 0 && (
                  <div>
                    <EmptyState />
                  </div>
                )}
                <VideoList videoList={videoList} />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VideoContainer;
