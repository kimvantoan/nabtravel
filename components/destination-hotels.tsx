"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/providers";

const HOTELS = [
  {
    id: "marron",
    name: "The Marron Hotel",
    images: ["/images/hotel1.png", "/images/hotel2.png"], // Reusing mock images from public folder
    rating: 4.9,
    reviews: 113,
    price: 23,
  },
  {
    id: "vanchai",
    name: "Van Chai Resort",
    images: ["/images/stella.png", "/images/ha_long.png"],
    rating: 4.4,
    reviews: 75,
    price: 53,
  },
  {
    id: "flcgolf",
    name: "FLC Samson Beach & Golf Resort",
    images: ["/images/hoi_an.png", "/images/da_nang.png"],
    rating: 3.8,
    reviews: 47,
    price: 119,
  },
  {
    id: "dragonsea",
    name: "Dragon Sea Hotel",
    images: ["/images/art.png", "/images/stargazing.png"],
    rating: 4.2,
    reviews: 32,
    price: 40,
  },
  {
    id: "flcgrand",
    name: "FLC Grand Hotel Samson",
    images: ["/images/haian.png", "/images/sala.png"],
    rating: 4.0,
    reviews: 27,
    price: 55,
  },
  {
    id: "flcluxury",
    name: "FLC Luxury Hotel Samson",
    images: ["/images/ninh_binh.png", "/images/hue.png"],
    rating: 3.4,
    reviews: 76,
    price: 115,
  },
];

function HotelCard({ hotel }: { hotel: typeof HOTELS[0] }) {
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
    <Link href={`/hotel/${hotel.id}`} className="group flex flex-col cursor-pointer">
      <div 
        className="relative w-full h-[240px] rounded-xl overflow-hidden mb-3 border border-gray-100 bg-gray-900 shadow-sm"
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
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${i === imgIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
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
           <div className="flex gap-0.5 items-center">
             {[1, 2, 3, 4, 5].map((bubble) => {
               const isFull = hotel.rating >= bubble;
               const isHalf = hotel.rating >= bubble - 0.5 && hotel.rating < bubble;
               return isFull ? (
                 <svg key={bubble} width="14" height="14" viewBox="0 0 16 16" fill="#00aa6c" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" /></svg>
               ) : isHalf ? (
                 <svg key={bubble} width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id={`half-${bubble}`}><rect x="0" y="0" width="8" height="16" /></clipPath></defs><circle cx="8" cy="8" r="7.5" fill="none" stroke="#00aa6c" strokeWidth="1" /><circle cx="8" cy="8" r="8" fill="#00aa6c" clipPath={`url(#half-${bubble})`} /></svg>
               ) : (
                 <svg key={bubble} width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#00aa6c" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7.25" /></svg>
               );
             })}
           </div>
           <span className="text-[13px] text-gray-500">({hotel.reviews})</span>
        </div>

        <div className="text-[14px] text-gray-700 mt-1">
          {dict.destination?.from || "from"} <span className="font-bold text-black text-[15px]">${hotel.price}</span>/{dict.destination?.night || "night"}
        </div>
      </div>
    </Link>
  );
}

export function DestinationHotels() {
  const { dict } = useLanguage();
  return (
    <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-3">
        <h2 className="text-[22px] font-extrabold text-[#004f32] tracking-tight">{dict.destination?.placesToStay || "Places to stay"}</h2>
        <a href="#" className="text-[15px] font-bold text-black hover:underline underline-offset-2 hover:text-[#004f32] transition-colors">{dict.hotelDetail?.seeAll || "See all"}</a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {HOTELS.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
      
      <div className="mt-12 flex justify-center mb-8">
        <button className="bg-white border-2 border-black hover:bg-gray-50 text-black font-bold px-8 py-3.5 rounded-full transition-colors w-full sm:w-auto min-w-[300px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-[16px]">
          {dict.destination?.showMoreHotels || "Show more hotels"}
        </button>
      </div>
    </div>
  );
}
