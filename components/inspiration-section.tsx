"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/app/providers";

import Link from "next/link";
import { ArticleData } from "@/components/article-card";

export function InspirationSection({ articles }: { articles?: ArticleData[] }) {
  const INSPIRATIONS = articles ? articles.slice(0, 4) : [];
  const { dict } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
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
      scrollRef.current.scrollBy({ left: -380, behavior: "smooth" });
    }
  };

  const scrollRightClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 380, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-[#f9f9f9] py-10 md:py-16 mt-4 md:mt-8">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#004f32] mb-6 tracking-tight">
          {dict.home.inspiration}
        </h2>

        <div className="relative group/section">
          {/* Left Scroll Button */}
          {showLeft && (
            <button
              onClick={scrollLeftClick}
              className="absolute -left-5 top-[40%] -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-black hover:shadow-lg transition-all z-10 hidden md:flex"
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 relative"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {INSPIRATIONS.map((item) => (
              <Link
                href={`/articles/${item.slug}`}
                key={item.id}
                className="relative w-[280px] md:w-[360px] flex flex-col gap-4 flex-shrink-0 snap-center cursor-pointer group/card block"
              >
                {/* Image Area */}
                <div className="w-full aspect-[4/3] relative rounded-xl overflow-hidden shadow-sm">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    sizes="(max-width: 768px) 100vw, 360px"
                  />

                  {/* Save Heart Button */}
                  <button 
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm shadow-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10 group/heart"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Heart className="w-4 h-4 text-gray-700 group-hover/heart:text-rose-500 transition-colors" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-[#004f32] text-base md:text-[17px] font-bold leading-snug text-center px-1  decoration-2 underline-offset-2">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>

          {/* Right Scroll Button */}
          {showRight && (
            <button
              onClick={scrollRightClick}
              className="absolute -right-5 top-[40%] -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-black hover:shadow-lg transition-all z-10 hidden md:flex"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
