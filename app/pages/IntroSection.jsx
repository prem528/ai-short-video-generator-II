"use client";

import { Link, Mic, PlayCircle, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fadeIn, fadeInUp, hoverScale } from "@/lib/animations";

const steps = [
  {
    icon: <ShoppingBag className="w-10 h-10 text-primary" />,
    title: "Product URL",
    description: "Simply paste your product URL and let our AI analyze all the details",
  },
  {
    icon: <PlayCircle className="w-10 h-10 text-primary" />,
    title: "Video Generation",
    description: "Our AI creates compelling product videos with dynamic visuals",
  },
  {
    icon: <Link className="w-10 h-10 text-primary" />,
    title: "Smart Captions",
    description: "Generate engaging captions that highlight key product features",
  },
  {
    icon: <Mic className="w-10 h-10 text-primary" />,
    title: "Voice Narration",
    description: "Add professional voice-over using advanced text-to-speech",
  },
];

export function IntroSection() {
  return (
    <section id="how-it-works" className="relative px-6  lg:px-8 py-24 md:py-24 overflow-hidden">
      {/* Animated gradient background */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-blue-100 dark:from-violet-950 dark:via-background dark:to-blue-950 animate-gradient" /> */}
      
      {/* Animated blur circles */}
      {/* <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000" /> */}
      
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className={`text-4xl font-normal md:text-6xl tracking-tight mb-6 `}>
            Transform Products into
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-blue-600 ml-2 animate-gradient-x">
              Engaging Videos
            </span>
          </h1>
          <p className={`text-xl text-muted-foreground max-w-2xl mx-auto mb-8 `}>
            Create professional product videos automatically with AI. From URL to ready-to-share
            content in minutes.
          </p>
        </div>

        {/* Process Section */}
        <div className="mt-24">
          <h2 className={`text-3xl underline font-noraml text-center mb-16 ${fadeInUp}`}>
            Four Simple Steps to Amazing Product Videos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card 
                key={index} 
                className={`group p-6 backdrop-blur-sm bg-white/50 dark:bg-black/50 border-2 border-transparent hover:border-blue-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 ${hoverScale} ${fadeIn}`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="mb-4 p-3 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900 dark:to-blue-900 rounded-lg group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
