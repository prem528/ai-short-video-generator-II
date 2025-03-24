"use client";

import { Button } from "/components/ui/button";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Video } from "lucide-react";

export default function HeroSection() {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const colorRef = useRef(0); // To keep track of the color transition

  const handleButtonClick = () => {
    setIsLoading(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    // Create vertical lines effect with color properties
    const lines = [];
    for (let i = 0; i < 20; i++) {
      lines.push({
        x: Math.random() * canvas.width,
        speed: 0.2 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.6,
        hueOffset: Math.random() * 30 // Add slight variation to each line
      });
    }

    // Animation
    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update the base hue
      colorRef.current = (colorRef.current + 0.5) % 360;

      lines.forEach((line) => {
        ctx.beginPath();
        // Use HSL color with changing hue
        const hue = (colorRef.current + line.hueOffset) % 360;
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${line.opacity})`;
        ctx.lineWidth = 1;
        ctx.moveTo(line.x, 0);
        ctx.lineTo(line.x, canvas.height);
        ctx.stroke();

        line.x += line.speed;
        if (line.x > canvas.width) line.x = 0;
      });

      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-100" style={{ mixBlendMode: "screen" }} />
      <div className="relative flex justify-center items-center h-full p-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col items-center text-center space-y-8"
        >
          <Video className="w-16 h-16 text-white animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white backdrop-blur-sm bg-black/10 p-6 rounded-lg">
            Create Stunning Videos with {" "}
            <span className="text-transparent animated-gradient bg-clip-text">
              Ai Magic
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl backdrop-blur-sm bg-black/3 rounded-lg">
            Transform your ideas into captivating short videos in minutes.
            Powered by cutting-edge AI technology.
          </p>

          {/* Status Banner */}
          <div className="relative z-10 mt-20 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-[#002020]/50 px-4 py-2 text-sm">
              <span className="text-gray-300">EXPERIENCE THE</span>
              <div className="ml-2 rounded-full bg-[#398eb2] px-3 py-1 text-[#002020]">Ai Magic </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/dashboard" onClick={handleButtonClick}>
              <Button
                size="lg"
                className="animated-gradient hover:text-black hover:font-semibold"
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