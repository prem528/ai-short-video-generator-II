'use client'

import { Wand2, Zap, Clock, Share2 } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import AOS from "aos";
import "aos/dist/aos.css";
import React  from "react";


export function FeaturesSection() {
  React.useEffect(() => {
    AOS.init();
  }, []);

  return (
    <section id="features" className="py-20" data-aos="fade-up">
      <div className="container mx-auto px-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Our Platform?
        </h2>
        <div className=" text-center grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="h-full shadow-xl overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105">
            <FeatureCard 
              icon={<Wand2 className="w-10 h-10" />}
              title="AI-Powered Creation"
              description="Advanced AI algorithms that understand your vision and create stunning videos"
            />
          </div>

          <div className="h-full shadow-xl overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105 ">
            <FeatureCard
              icon={<Zap className="w-10 h-10" />}
              title="Lightning Fast"
              description="Generate professional videos in minutes, not hours in just few steps with AI"
            />
          </div>

          <div className="h-full shadow-xl overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105">
            <FeatureCard
              icon={<Clock className="w-10 h-10" />}
              title="Time-Saving"
              description="Automate your video creation workflow and focus on what matters because your time is important"
            />
          </div>
          <div className="h-full   shadow-xl overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105">
            <FeatureCard
              icon={<Share2 className="w-10 h-10" />}
              title="Easy Sharing"
              description="Share your videos instantly across all social media platforms in just few seconds "
            />
          </div>
          
        </div>
      </div>
    </section>
  );
}
