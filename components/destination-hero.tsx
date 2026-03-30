"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Heart, Image as ImageIcon } from "lucide-react";

const HERO_IMAGES = [
  "/images/da_nang.png",
  "/images/ha_long.png",
  "/images/hoi_an.png",
];

export function DestinationHero({ name }: { name: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? HERO_IMAGES.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === HERO_IMAGES.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 pt-6">
      <div className="text-[13px] text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap">
        <a href="/" className="hover:underline">Asia</a>
        <span>›</span>
        <a href="/" className="hover:underline">Vietnam</a>
        <span>›</span>
        <span className="text-black font-semibold">{name}</span>
        <span className="text-gray-500 ml-auto hidden sm:block">Plan Your Trip to {name}: Best of {name} Tourism</span>
      </div>

      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] rounded-2xl overflow-hidden mb-8 group bg-gray-100 shadow-sm border border-gray-100">
        <Image 
          src={HERO_IMAGES[currentIndex]} 
          alt={name} 
          fill 
          className="object-cover transition-transform duration-700 ease-in-out"
          priority
        />
        
        {/* Gradients */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Prev/Next Buttons */}
        <button 
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-colors shadow-sm ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>

        {/* Bottom Bar Info */}
        <div className="absolute bottom-4 left-6 flex items-center gap-2 text-white z-10">
          <div className="w-6 h-6 rounded-full bg-orange-500 border border-white/20 flex justify-center items-center text-xs font-bold shadow-sm">
            M
          </div>
          <span className="text-[14px] font-medium drop-shadow-md">By Management</span>
        </div>
        
        <div className="absolute bottom-4 right-6 bg-black/60 border border-white/10 text-white text-[13px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 z-10 backdrop-blur-sm">
          <ImageIcon className="w-4 h-4" />
          779
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-[36px] md:text-[46px] font-extrabold text-[#004f32] tracking-tight leading-tight">
          {name}
        </h1>
        <button className="flex items-center gap-2 border border-black rounded-full px-5 py-2.5 hover:bg-gray-50 font-bold text-[15px] transition-colors w-fit shadow-sm">
          <Heart className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
}
