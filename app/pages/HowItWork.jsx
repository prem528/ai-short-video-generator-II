'use client'

import { Edit3Icon, Wand2Icon, Share2Icon } from 'lucide-react'
import AOS from "aos";
import "aos/dist/aos.css";
import React  from "react";

const steps = [
  {
    icon: <Edit3Icon className="h-12 w-12 text-blue-400" />,
    title: 'Input Your URL',
    description: 'Start by entering your video concept or script into our AI-powered platform.'
  },
  {
    icon: <Wand2Icon className="h-12 w-12 text-blue-400" />,
    title: 'AI Magic',
    description: 'Our advanced AI algorithms transform your input into a professional-quality video.'
  },
  {
    icon: <Share2Icon className="h-12 w-12 text-blue-400" />,
    title: 'Share & Engage',
    description: 'Download your video and share it across your favorite platforms to engage your audience.'
  }
]

export default function HowItWork() {
  React.useEffect(() => {
    AOS.init();
  }, []);

  return (
    <section id="how-it-works" className="py-20 px-6" >
      <div className="flex flex-col items-center container mx-auto" data-aos="fade-up">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-start space-y-8 md:space-y-0 md:space-x-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="mb-4 bg-gray-300/30 rounded-full p-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

