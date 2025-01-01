"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function BackgroundLayout({ children }) {
  const { theme } = useTheme();
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 100); // Smooth animation over time
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark" ? "bg-black" : "bg-white"
      }`}
    >
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden">
        {/* First animated gradient */}
        <div
          className={`absolute -top-1/3 -left-1/4 w-[60%] h-[60%] rounded-full mix-blend-multiply 
            filter blur-[150px] opacity-40 animate-[pulse_8s_infinite] ${
              theme === "dark" ? "bg-indigo-800" : "bg-indigo-100"
            }`}
          style={{ transform: `rotate(${time}deg)` }}
        />
        
        {/* Second animated gradient */}
        <div
          className={`absolute -bottom-1/3 -right-1/4 w-[70%] h-[70%] rounded-full mix-blend-multiply 
            filter blur-[150px] opacity-40 animate-[pulse_6s_infinite_alternate] ${
              theme === "dark" ? "bg-purple-900" : "bg-purple-100"
            }`}
          style={{ transform: `rotate(-${time}deg)` }}
        />

        {/* Central gradient with rotation */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            w-[120%] h-[120%] bg-gradient-to-br from-pink-500/10 via-indigo-500/20 to-purple-500/10 
            rounded-full filter blur-[200px] animate-spin-slow`}
        />
      </div>

      {/* Interactive hover effects */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        onMouseMove={(e) => {
          const { clientX, clientY } = e;
          const xPercent = (clientX / window.innerWidth) * 100;
          const yPercent = (clientY / window.innerHeight) * 100;

          document.documentElement.style.setProperty(
            "--gradient-x",
            `${xPercent}%`
          );
          document.documentElement.style.setProperty(
            "--gradient-y",
            `${yPercent}%`
          );
        }}
      >
        <div
          className={`absolute inset-0 bg-gradient-radial at-[var(--gradient-x)_var(--gradient-y)] 
            from-transparent via-indigo-600/20 to-transparent filter blur-[150px]`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
