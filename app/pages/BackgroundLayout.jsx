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
      {/* Updated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          theme === "dark"
            ? "from-black via-black/50 to-black"
            : "from-violet-100 via-white to-blue-100"
        } animate-gradient`}
      />

      {/* Updated animated blur circles */}
      {/* <div
        className={`absolute top-0 -left-4 w-72 h-72 ${
          theme === "dark" ? "bg-purple-900" : "bg-purple-300"
        } rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob`}
      /> */}
      {/* <div
        className={`absolute top-0 -right-4 w-72 h-72 ${
          theme === "dark" ? "bg-blue-900" : "bg-blue-300"
        } rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000`}
      /> */}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
