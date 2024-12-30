'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  { id: 1, name: "John Doe", comment: "This AI video generator is amazing! It saved me hours of work.", rating: 5 },
  { id: 2, name: "Jane Smith", comment: "Incredible tool for creating professional videos quickly.", rating: 4 },
  { id: 3, name: "Mike Johnson", comment: "The quality of the generated videos is outstanding.", rating: 5 },
  { id: 4, name: "Emily Brown", comment: "Easy to use and produces great results. Highly recommended!", rating: 5 },
  { id: 5, name: "Chris Lee", comment: "Game-changer for content creators. Love it!", rating: 4 },
  { id: 6, name: "Sarah Wilson", comment: "Impressed with the AI capabilities. Great for marketing videos.", rating: 5 },
];

export default function ReviewSection() {
  const carouselRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    const scroll = () => {
      if (carouselRef.current && isAutoScrolling) {
        carouselRef.current.scrollLeft += 1;
        if (
          carouselRef.current.scrollLeft >=
          carouselRef.current.scrollWidth - carouselRef.current.clientWidth
        ) {
          carouselRef.current.scrollLeft = 0;
        }
      }
    };

    const intervalId = setInterval(scroll, 20);

    return () => clearInterval(intervalId);
  }, [isAutoScrolling]);

  const handleManualScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth;
      carouselRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  return (
    <div className="relative ">
      <div
        ref={carouselRef}
        className="flex overflow-x-hidden space-x-6 py-8 "
        onMouseEnter={() => setIsAutoScrolling(false)}
        onMouseLeave={() => setIsAutoScrolling(true)}
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex-shrink-0 w-80 p-6 rounded-lg shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="text-xl font-semibold">{review.name}</div>
              <div className="ml-auto">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < review.rating ? "text-yellow-400" : "text-gray-400"}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p >{review.comment}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => handleManualScroll('left')}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full opacity-75 hover:opacity-100 transition-opacity"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => handleManualScroll('right')}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full opacity-75 hover:opacity-100 transition-opacity"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
