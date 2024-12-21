"use client";

import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative animated-gradient h-screen">
      <div className="absolute inset-0 bg-black/20" /> {/* Overlay for better text readability */}
      <div className="relative flex justify-center items-center h-full p-3">
        <div className="flex flex-col items-center text-center space-y-8">
          <Video className="w-16 h-16 text-white animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Create Stunning Videos with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500">
              AI Magic
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Transform your ideas into captivating short videos in minutes. Powered by cutting-edge AI technology.
          </p>
          <div className="flex gap-4">
            <Link href='/dashboard'> 
            <Button 
              size="lg" 
              className="bg-blue-300 border-white text-black hover:bg-blue-400 hover:text-white transition-colors"
            >
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
        </div>
      </div>
    </section>
  );
}