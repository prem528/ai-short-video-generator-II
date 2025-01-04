'use client'

import { VideoCard } from '@/app/pages/video-card'
import { useRef, useEffect } from 'react'

const VIDEOS = [
  {
    url: '/out3.mp4', // Use unique video URLs
    overlayText: 'Looking for a',
  },
  {
    url: '/out2.mp4',
  },
  {
    url: '/out.mp4',
    overlayText: 'COMBINATION TO OILY',
    secondaryText: 'Deep cleans and reduces appearance of pores',
  },
  {
    url: '/out4.mp4',
    overlayText: 'Playback with',
  },
  {
    url: '/out1.mp4',
    overlayText: 'DUMBBELL STAND-CAKE',
  },
  {
    url: '/out5.mp4',
    overlayText: 'HAPPY NEW YEAR',
  },
]

export default function VideoCarousel() {
  const carouselRef = useRef(null)

  useEffect(() => {
    const carousel = carouselRef.current
    if (carousel) {
      let animationFrame
      const startScrolling = () => {
        carousel.scrollLeft += 1 // Adjust this value to control speed
        if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
          carousel.scrollLeft = 0 // Reset to start when reaching the end
        }
        animationFrame = requestAnimationFrame(startScrolling)
      }
      animationFrame = requestAnimationFrame(startScrolling)

      return () => cancelAnimationFrame(animationFrame) // Cleanup animation
    }
  }, [])

  return (
    <div
      ref={carouselRef}
      className="w-full overflow-hidden py-24"
      style={{ whiteSpace: 'nowrap', display: 'flex', gap: '20px' }}
    >
      {[...VIDEOS, ...VIDEOS].map((video, index) => (
        <div
          key={index}
          className="inline-block"
          style={{ flexShrink: 0, width: '300px' }} // Adjust width to fit your design
        >
          <VideoCard
            videoUrl={video.url} // Pass the correct video URL
             
            secondaryText={video.secondaryText}
          />
        </div>
      ))}
    </div>
  )
}
