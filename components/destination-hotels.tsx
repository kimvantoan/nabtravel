"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { LiveListPrice } from "./live-list-price";

export interface DestinationHotelData {
  id: string;
  name: string;
  images: string[];
  rating: number;
  reviews: number;
  price: number;
  price_updated_at?: string;
}

function HotelCard({ hotel }: { hotel: DestinationHotelData }) {
  const { dict } = useLanguage();
  const [imgIndex, setImgIndex] = useState(0);

  const nextImg = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setImgIndex((p) => (p === hotel.images.length - 1 ? 0 : p + 1));
  };

  const prevImg = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setImgIndex((p) => (p === 0 ? hotel.images.length - 1 : p - 1));
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      nextImg();
    }
    if (distance < -50) {
      prevImg();
    }
  };

  return (
    <Link href={`/hotel/${encodeURIComponent(hotel.name)}`} className="group flex flex-col cursor-pointer">
      <div 
        className="relative w-full aspect-square sm:aspect-auto sm:h-[240px] rounded-xl overflow-hidden mb-3 border border-gray-100 bg-gray-900 shadow-sm"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {hotel.images.map((imgSrc, i) => (
          <Image 
            key={i}
            src={imgSrc} 
            alt={`${hotel.name} - ${i}`} 
            fill 
            className={`object-cover object-center transition-all duration-300 group-hover:scale-105 ${i === imgIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ))}
        
        {/* Dark gradient for dots visibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Prev/Next arrows on hover */}
        {hotel.images.length > 1 && (
          <>
            <button 
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer hidden md:flex"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer hidden md:flex"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {hotel.images.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full shadow-sm ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}

        {/* Heart Favorite */}
        <button 
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 w-[34px] h-[34px] bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 z-10 hover:bg-gray-50 hover:scale-105 transition-all"
        >
          <Heart className="w-[18px] h-[18px] text-black stroke-[1.5]" />
        </button>
      </div>

      <div className="flex flex-col px-1">
        <h3 className="text-[17px] font-bold text-[#004f32] group-hover:underline decoration-2 underline-offset-2 truncate">
          {hotel.name}
        </h3>
        
        <div className="flex items-center gap-1.5 shrink-0 mt-1 mb-1.5 text-[14px] text-gray-700">
           <span className="font-bold text-[14px]">{Number.isInteger(hotel.rating) ? hotel.rating.toFixed(1) : hotel.rating}</span>
           <div className="flex gap-1 items-center">
             {[1, 2, 3, 4, 5].map((star) => {
               const isFull = hotel.rating >= star;
               const isHalf = hotel.rating >= star - 0.5 && hotel.rating < star;
               return (
                 <div key={star} className="relative w-[16px] h-[16px]">
                   <svg viewBox="0 0 24 24" fill="#E5E7EB" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                   {(isFull || isHalf) && (
                     <svg viewBox="0 0 24 24" fill="#FFB800" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                   )}
                 </div>
               );
             })}
           </div>
           <span className="text-[13px] text-gray-500">({hotel.reviews})</span>
        </div>

        <div className="flex items-center text-[14px] text-gray-700 mt-1 gap-1">
          {dict.destination?.from || "from"} <LiveListPrice hotelName={hotel.name} fallbackPrice={hotel.price} priceUpdatedAt={hotel.price_updated_at} fontSize="15px" />/{dict.destination?.night || "night"}
        </div>
      </div>
    </Link>
  );
}

export function DestinationHotels({ hotels }: { hotels: DestinationHotelData[] }) {
  const { dict } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  const handleShowMore = () => {
    setIsLoading(true);
    // Add realistic simulated loading delay
    setTimeout(() => {
      setVisibleCount(prev => prev + 6);
      setIsLoading(false);
    }, 800);
  };

  const visibleHotels = hotels?.slice(0, visibleCount) || [];
  const hasMore = hotels && visibleCount < hotels.length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-3">
        <h2 className="text-[22px] font-extrabold text-[#004f32] tracking-tight">{dict.destination?.placesToStay || "Places to stay"}</h2>
        <a href="#" className="text-[15px] font-bold text-black hover:underline underline-offset-2 hover:text-[#004f32] transition-colors">{dict.hotelDetail?.seeAll || "See all"}</a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10">
        {visibleHotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-12 flex justify-center mb-8">
          <button 
            onClick={handleShowMore}
            disabled={isLoading}
            className="group relative bg-white border-2 border-black hover:bg-gray-50 disabled:bg-gray-50 text-black font-bold px-8 py-3.5 rounded-full transition-all w-full sm:w-auto min-w-[300px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-[16px] overflow-hidden flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {(dict.destination as any)?.loading || "Đang tải..."}
              </span>
            ) : (
              dict.destination?.showMoreHotels || "Hiển thị thêm khách sạn"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
