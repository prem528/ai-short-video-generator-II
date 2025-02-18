'use client'

import { VideoCard } from '@/app/pages/video-card'
import { useRef, useEffect } from 'react'

const VIDEOS = [
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-short-videos-28e83.firebasestorage.app/o/ai-video-file%2F4167410-hd_720_900_30fps.mp4?alt=media&token=c739a26e-88a9-46d8-b357-3dc296230b33', // Use unique video URLs
    overlayText: 'Looking for a',
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-short-videos-28e83.firebasestorage.app/o/ai-video-file%2F5644248-uhd_2160_4096_25fps.mp4?alt=media&token=553a36ce-abd4-4857-95d0-633ab0d64ba6',
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-short-videos-28e83.firebasestorage.app/o/ai-video-file%2F4167410-hd_720_900_30fps.mp4?alt=media&token=c739a26e-88a9-46d8-b357-3dc296230b33',
    overlayText: 'COMBINATION TO OILY',
    secondaryText: 'Deep cleans and reduces appearance of pores',
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-short-videos-28e83.firebasestorage.app/o/ai-video-file%2F5925304-uhd_2160_3840_30fps.mp4?alt=media&token=a90be5dc-2194-4175-bbe1-b17d7631cbc1',
    overlayText: 'Playback with',
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-short-videos-28e83.firebasestorage.app/o/ai-video-file%2F5644248-uhd_2160_4096_25fps.mp4?alt=media&token=553a36ce-abd4-4857-95d0-633ab0d64ba6',
    overlayText: 'DUMBBELL STAND-CAKE',
  },
  {
    url: 'https://firebasestorage.googleapis.com/v0/b/ai-short-videos-28e83.firebasestorage.app/o/ai-video-file%2F5644248-uhd_2160_4096_25fps.mp4?alt=media&token=553a36ce-abd4-4857-95d0-633ab0d64ba6',
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
