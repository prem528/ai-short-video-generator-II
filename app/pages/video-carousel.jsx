'use client'

import { VideoCard } from '@/app/pages/video-card'
import { useRef, useEffect } from 'react'

const VIDEOS = [
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-video-generator-d0362.firebasestorage.app/o/ai-video-file%2Fout.mp4?alt=media&token=f13d91d3-4507-44c1-a690-cef070dbbec3', // Use unique video URLs
    overlayText: 'Looking for a',
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-video-generator-d0362.firebasestorage.app/o/ai-video-file%2Fout1.mp4?alt=media&token=2a5661ff-6155-470e-ab14-aab70ff7b4e9',
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-video-generator-d0362.firebasestorage.app/o/ai-video-file%2Fout2.mp4?alt=media&token=6df3d915-e5ce-4adc-ba46-5c1363c0d1a2',
    overlayText: 'COMBINATION TO OILY',
    secondaryText: 'Deep cleans and reduces appearance of pores',
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-video-generator-d0362.firebasestorage.app/o/ai-video-file%2Fout3.mp4?alt=media&token=a0cec09c-c12b-4bbb-8dda-429dbf52e83b',
    overlayText: 'Playback with',
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-video-generator-d0362.firebasestorage.app/o/ai-video-file%2Fout4.mp4?alt=media&token=cb3a2501-c3ab-4355-b927-89527f2d189b',
    overlayText: 'DUMBBELL STAND-CAKE',
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-video-generator-d0362.firebasestorage.app/o/ai-video-file%2Fout5.mp4?alt=media&token=7240fdb0-6838-4cda-8a88-2ff589cd6eb8',
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
