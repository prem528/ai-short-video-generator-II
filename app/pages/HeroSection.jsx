"use client";

import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";

export function HeroSection() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { user } = useUser();

  const videos = [
    "/video22.mp4",
    // Add all your video paths here
  ];

  const userRole = user?.publicMetadata?.role; // Assuming role is stored in publicMetadata
  const redirectPath = userRole === "admin" ? "/admin" : "/dashboard";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) =>
        prevIndex === videos.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000); // Change video every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Video */}
      <video
        key={videos[currentVideoIndex]} // Key helps React remount video element
        autoPlay
        loop={true} // Set to false since we're handling the cycling
        muted
        playsInline
        onEnded={() => {
          setCurrentVideoIndex((prevIndex) =>
            prevIndex === videos.length - 1 ? 0 : prevIndex + 1
          );
        }}
        className="absolute w-full h-full object-cover "
      >
        <source src={videos[currentVideoIndex]} type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50 animated-gradient mix-blend-overlay" />

      {/* Content */}
      <div className="relative flex justify-center items-center h-full p-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center text-center space-y-8"
        >
          <Video className="w-16 h-16 text-white animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white backdrop-blur-sm bg-black/30 p-6 rounded-lg">
            Create Stunning Videos with{" "}
            <span className="text-transparent animated-gradient bg-clip-text ">
              AI Magic
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl backdrop-blur-sm bg-black/3">
            Transform your ideas into captivating short videos in minutes.
            Powered by cutting-edge AI technology.
          </p>
          <div className="flex gap-4">
            <Link href={redirectPath}>
              <Button size="lg" className="animated-gradient">
                Get Started Free
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white bg-transparent hover:bg-white/10"
            >
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
