"use client";

import React from "react";
import { useTheme } from "next-themes";

export default function BackgroundLayout({ children }) {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen relative ${
        theme === "dark" ? "bg-black" : "bg-white"
      }`}
    >
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden">
        <div
          className={`absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full mix-blend-multiply 
            filter blur-[100px] opacity-30 animate-pulse ${
              theme === "dark" ? "bg-indigo-900" : "bg-indigo-700"
            }`}
        />
        <div
          className={`absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full mix-blend-multiply 
            filter blur-[100px] opacity-30 animate-pulse ${
              theme === "dark" ? "bg-purple-900" : "bg-purple-700"
            }`}
        />
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            w-full h-full bg-gradient-to-br rounded-full filter blur-[100px] animate-spin-slow ${
              theme === "dark"
                ? "from-indigo-900/10 to-purple-900/10"
                : "from-indigo-500/10 to-purple-500/10"
            }`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
