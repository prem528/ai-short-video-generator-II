"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, ArrowRight, Zap, Wand2,Users, Shield, Code } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
// import { siteConfig } from "@/config/site";

const MotionLink = motion(Link);


const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 z-50"
      style={{ scaleX: width, transformOrigin: "0%" }}
    />
  );
};

export default function HeroSection() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* <ScrollProgress /> */}

      {/* Enhanced background elements */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-700 rounded-full filter blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-700 rounded-full filter blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full filter blur-[100px] animate-spin-slow"></div>
      </div> */}

      {/* Content */}
      <div className="relative  z-10 mt-5 lg:mt-0">
        <section className="container min-h-screen flex flex-col justify-center items-center gap-8 pb-8 pt-6 md:py-1">
          <motion.div
            className="flex max-w-[980px] flex-col items-center gap-4 text-center"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              className="text-5xl font-extrabold leading-tight tracking-tighter md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Learn more about our mission, vision, and team.
            </motion.h1>
            <motion.h2
              className="text-3xl font-bold md:text-5xl text-blue-300 mt-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              with Easy Ai
            </motion.h2>
            <motion.p
              className="max-w-[700px] text-xl text-gray-500 mt-2 font-normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Crafting Stunning, Accessible, and Engaging High-Performance Short Videos with AI-Driven Creative Excellence.
            </motion.p>
          </motion.div>

          <motion.div
            className="flex gap-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <MotionLink
              href="/dashboard"
              className={buttonVariants({ size: "lg", variant: "default" }) + " bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-8 py-4 rounded-full"}
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </MotionLink>
 
          </motion.div>
 
           
            <h2 className="text-3xl font-bold "></h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl text-center mx-auto">
              {[
                { icon: Wand2, title: 'AI-Powered Creation', description: 'Generate stunning videos with just a few clicks.' },
                { icon: Zap, title: 'Lightning Fast', description: 'Create professional-quality videos in minutes, not hours.' },
                { icon: Users, title: 'Collaboration Tools', description: 'Work seamlessly with your team on video projects.' },
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center p-6 rounded-lg shadow-lg transition-transform hover:scale-105">
                  <feature.icon className="w-12 h-12 mb-4  text-blue-400" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200">{feature.title}</h3>
                  <p className="text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        
      </div>
    </div>
  );
}