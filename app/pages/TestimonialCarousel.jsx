"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import  TestimonialCard  from "./TestimonialCard"

const testimonials = [
  {
    content: "This AI video generator has revolutionized our content creation process. It's incredibly fast and the results are amazing !This AI video generator has revolutionized our content creation process. It's incredibly fast and the results are amazing !",
    author: "Alex Johnson",
    role: "Content Creator",
    avatarSrc: "/placeholder.svg?height=36&width=36"
  },
  {
    content: "I've tried many video tools, but this one stands out. The AI-generated content is spot-on and saves me hours of work.",
    author: "Sarah Lee",
    role: "Marketing Manager",
    avatarSrc: "/placeholder.svg?height=36&width=36"
  },
  {
    content: "The quality of videos produced by this AI is outstanding. It's like having a professional video editor at your fingertips.",
    author: "Mike Chen",
    role: "YouTuber",
    avatarSrc: "/placeholder.svg?height=36&width=36"
  },
  {
    content: "This tool has made creating engaging social media content a breeze. The AI understands exactly what I need.",
    author: "Emily Davis",
    role: "Social Media Specialist",
    avatarSrc: "/placeholder.svg?height=36&width=36"
  },
  {
    content: "As a small business owner, this AI video generator has been a game-changer. It's affordable and produces professional-quality videos.",
    author: "David Brown",
    role: "Entrepreneur",
    avatarSrc: "/placeholder.svg?height=36&width=36"
  }
]

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0)

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto"
      onSelect={(index) => setActiveIndex(index)}
    >
      <CarouselContent className="h-full">
        {testimonials.map((testimonial, index) => (
          <CarouselItem 
            key={index} 
            className="md:basis-1/2 lg:basis-1/3 h-full"
          >
            <div className="p-1 h-full">
              <TestimonialCard 
                {...testimonial} 
                className="h-full flex flex-col"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}