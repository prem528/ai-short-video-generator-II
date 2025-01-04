import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { db } from '@/configs/db';
import { VideoData } from '@/configs/schema'; 

export default function RecentVideos() {
  const [videoList, setVideoList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the list of videos created by all users
  const getVideoList = async () => {
    setIsLoading(true);
    try {
      const result = await db
        .select({
          id: VideoData.id,
          createdBy: VideoData.createdBy, 
        })
        .from(VideoData); 

      setVideoList(result);
    } catch (error) {
      console.error('Error fetching video list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getVideoList(); 
  }, []); 

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Videos</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[58vh] overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : videoList.length === 0 ? (
            <div className="text-center text-gray-500">No videos found.</div>
          ) : (
            <ul className="space-y-4">
              {videoList.map((video) => (
                <li key={video.id} className="flex flex-col gap-1">
                  <p className="text-sm font-medium">ID: {video.id}</p> 
                  <p className="text-sm text-muted-foreground">
                    Created by: {video.createdBy}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}