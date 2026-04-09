"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart, MapPin } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/app/providers";

import { TourItemData } from "./tour-list-card";

interface TourRecommendationsProps {
  tours: TourItemData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export function TourRecommendations({ tours }: TourRecommendationsProps) {
  const { dict, locale } = useLanguage();
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
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRightClick = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (!tours || tours.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-6 md:py-8 mt-2 border-t border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#004f32] tracking-tight">
          {locale === "vi" ? "Tour hấp dẫn" : "Popular Tours"}
        </h2>
      </div>

      <div className="relative group/section">
        {showLeft && (
          <button
            onClick={scrollLeftClick}
            className="absolute -left-5 top-[35%] -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-black hover:shadow-lg transition-all z-10 hidden md:flex"
            aria-label="Scroll left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 relative"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tours.map((tour) => {
            const name = typeof tour.name === "object" ? tour.name[locale as keyof typeof tour.name] || tour.name.en : tour.name;
            const ratingText = tour.rating >= 9 ? (locale === "vi" ? "Tuyệt vời" : "Excellent") : (tour.rating >= 8 ? (locale === "vi" ? "Tuyệt hảo" : "Very Good") : (locale === "vi" ? "Tốt" : "Good"));

            return (
              <Link
                href={`/tour/${tour.slug || tour.id}`}
                key={tour.id}
                className="relative w-[280px] flex-shrink-0 snap-center cursor-pointer group/card block flex flex-col h-full bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow overflow-hidden"
              >
                <div className="w-full h-[180px] relative overflow-hidden">
                  <Image
                    src={tour.photoUrl}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    sizes="(max-width: 768px) 100vw, 280px"
                    unoptimized
                  />
                  <button 
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm shadow-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10 group/heart"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Heart className="w-3.5 h-3.5 text-gray-700 group-hover/heart:text-rose-500 transition-colors" />
                  </button>
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                  <h3 className="text-[#333] text-[15px] font-bold leading-snug mb-2 line-clamp-2 min-h-[44px]">
                    {name}
                  </h3>
                  
                  <div className="flex items-start gap-1 text-gray-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="text-[12px] leading-tight line-clamp-1">{tour.locations_applied || ""}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="bg-[#10a36e] text-white px-1.5 py-0.5 rounded text-[12px] font-bold">{Number(tour.rating).toFixed(1)}</span>
                    <span className="text-[12px] font-semibold text-gray-800">{ratingText}</span>
                    <span className="text-[12px] text-gray-500">
                      ({tour.totalReviews.toLocaleString('vi-VN')} {dict.tourDetail.reviews})
                    </span>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[12px] text-gray-500">{dict.tourDetail.from}</span>
                    <span className="text-[16px] font-bold text-[#e56d25]">{formatCurrency(tour.priceVND)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

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
