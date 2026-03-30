"use client";

import Link from "next/link";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/app/providers";

const DESTINATIONS = [
  {
    id: "hoian",
    name: "Hoi An, Quang Nam",
    image: "/images/hoi_an.png",
  },
  {
    id: "halong",
    name: "Ha Long Bay, Quang Ninh",
    image: "/images/ha_long.png",
  },
  {
    id: "sapa",
    name: "Sapa, Lao Cai",
    image: "/images/sapa.png",
  },
  {
    id: "danang",
    name: "Da Nang",
    image: "/images/da_nang.png",
  },
  {
    id: "phuquoc",
    name: "Phu Quoc, Kien Giang",
    image: "/images/phu_quoc.png",
  },
  {
    id: "ninhbinh",
    name: "Trang An, Ninh Binh",
    image: "/images/ninh_binh.png",
  },
  {
    id: "hue",
    name: "Hue Imperial City",
    image: "/images/hue.png",
  },
];

export function IconicDestinations() {
  const { dict } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    // Initial check
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
    <section className="w-full max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-[#004f32] mb-6 tracking-tight">
        {dict.home.iconicSpots}
      </h2>

      <div className="relative group">
        {/* Left Scroll Button */}
        {showLeft && (
          <button
            onClick={scrollLeftClick}
            className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-black hover:shadow-lg transition-all z-10 hidden md:flex"
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
          {DESTINATIONS.map((dest) => (
            <Link
              href={`/destination/${dest.id}`}
              key={dest.id}
              className="relative w-[280px] h-[320px] flex-shrink-0 snap-center rounded-lg overflow-hidden cursor-pointer group/card block"
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                sizes="(max-width: 768px) 100vw, 280px"
              />
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              {/* Text */}
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <h3 className="text-white text-xl font-bold drop-shadow-md">
                  {dest.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Scroll Button */}
        {showRight && (
          <button
            onClick={scrollRightClick}
            className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-black hover:shadow-lg transition-all z-10 hidden md:flex"
            aria-label="Scroll right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
}
