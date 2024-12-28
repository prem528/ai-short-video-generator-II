'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

 
export default function AnimatedDemoSection() {
 
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/video-poster.jpg"
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/video20.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white p-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold mb-4 text-center text-transparent animated-gradient bg-clip-text backdrop-blur-sm bg-black/30 rounded-lg" 
        >
          Experience the Future
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl mb-8 text-center max-w-2xl"
        >
          Immerse yourself in cutting-edge technology that transforms your world.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* <Button
            size="lg"
            className="bg-white text-black hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </Button> */}
        </motion.div>
      </div>
    </div>
  );
}
