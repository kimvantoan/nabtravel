"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/app/providers";

const HOTELS = [
  {
    id: "haian",
    name: "HAIAN Beach Hotel & Spa",
    image: "/images/haian.png",
    rating: "4,9",
    reviews: "4.338",
  },
  {
    id: "stella",
    name: "Stella Maris Beach Đà Nẵng",
    image: "/images/stella.png",
    rating: "4,9",
    reviews: "2.807",
  },
  {
    id: "sala",
    name: "Sala Danang Beach Hotel",
    image: "/images/sala.png",
    rating: "4,9",
    reviews: "3.054",
  },
  {
    id: "monarque",
    name: "Monarque Hotel",
    image: "/images/monarque.png",
    rating: "5,0",
    reviews: "3.735",
  },
];

// Tripadvisor style green rating bubbles
function RatingBubbles() {
  return (
    <div className="flex gap-0.5 mx-1 items-center">
      {[1, 2, 3, 4, 5].map((bubble) => (
        <svg key={bubble} width="12" height="12" viewBox="0 0 16 16" fill="#00aa6c" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="8" />
        </svg>
      ))}
    </div>
  );
}

export function HotelRecommendations() {
  const { dict } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      // Small buffer for floating point inaccuracies
      setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  const scrollLeftClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRightClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8 mt-4 border-t border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#004f32] tracking-tight">
          {dict.home.youMightLike}
        </h2>
      </div>

      <div className="relative group/section">
        {/* Left Scroll Button */}
        {showLeft && (
          <button
            onClick={scrollLeftClick}
            className="absolute -left-5 top-[35%] -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-black hover:shadow-lg transition-all z-10 hidden md:flex"
            aria-label="Scroll left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 relative"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {HOTELS.map((hotel) => (
            <Link
              href={`/hotel/${hotel.id}`}
              key={hotel.id}
              className="relative w-[280px] flex-shrink-0 snap-center cursor-pointer group/card block"
            >
              {/* Image Area */}
              <div className="w-full h-[260px] relative rounded-xl overflow-hidden mb-3">
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                  sizes="(max-width: 768px) 100vw, 280px"
                />

                {/* Save Heart Button */}
                <button 
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm shadow-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10 group/heart"
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart className="w-4 h-4 text-gray-700 group-hover/heart:text-rose-500 transition-colors" />
                </button>
              </div>

              {/* Details Area */}
              <div className="text-left flex flex-col gap-1 pr-4">
                <h3 className="text-black text-base font-bold leading-tight decoration-2 underline-offset-2">
                  {hotel.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 font-medium">
                  <span>{hotel.rating}</span>
                  <RatingBubbles />
                  <span>({hotel.reviews})</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Scroll Button */}
        {showRight && (
          <button
            onClick={scrollRightClick}
            className="absolute -right-5 top-[35%] -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-black hover:shadow-lg transition-all z-10 hidden md:flex"
            aria-label="Scroll right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
}
