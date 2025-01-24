"use client"
import { useState, useEffect, useRef } from "react";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";

export function HeroSection() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const videoRef = useRef(null);

  const videos = [
    "https://firebasestorage.googleapis.com/v0/b/ai-video-generator-d0362.firebasestorage.app/o/ai-video-file%2Fvideo22.mp4?alt=media&token=818e0c11-59a7-443f-8395-38fc5180f74a",
  ];

  useEffect(() => {
    const videoEl = videoRef.current;
    
    if (videoEl) {
      videoEl.preload = 'metadata';
      videoEl.setAttribute('fetchpriority', 'low');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) =>
        prevIndex === videos.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleButtonClick = () => {
    setIsLoading(true);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      <video
        ref={videoRef}
        key={videos[currentVideoIndex]}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/hero.png"
        className="absolute w-full h-full object-cover"
        style={{ 
          transform: 'translateZ(0)', 
          willChange: 'transform'
        }}
      >
        <source src={videos[currentVideoIndex]} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50 animated-gradient mix-blend-overlay" />

      <div className="relative flex justify-center items-center h-full p-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center text-center space-y-8"
        >
          <Video className="w-16 h-16 text-white animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white backdrop-blur-sm bg-black/10 p-6 rounded-lg">
            Create Stunning Videos with{" "}
            <span className="text-transparent animated-gradient bg-clip-text">
              AI Magic
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl backdrop-blur-sm bg-black/3 rounded-lg">
            Transform your ideas into captivating short videos in minutes.
            Powered by cutting-edge AI technology.
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="animated-gradient hover:text-black hover:font-semibold"
                onClick={handleButtonClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Get Started Free"
                )}
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