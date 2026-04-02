"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Heart, Image as ImageIcon, X } from "lucide-react";
import { useLanguage } from "@/app/providers";

export function DestinationHero({ name, images }: { name: string, images: string[] }) {
  const { dict, locale } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback to empty array to prevent map crashes if no images provided
  const displayImages = images && images.length > 0 ? images : ["/images/hotel_main.png"];

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isModalOpen]);

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 pt-6">
        <div className="text-[13px] text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap">
          <a href="/" className="hover:underline">{locale === 'vi' ? 'Châu Á' : 'Asia'}</a>
          <span>›</span>
          <a href="/" className="hover:underline">{locale === 'vi' ? 'Việt Nam' : 'Vietnam'}</a>
          <span>›</span>
          <span className="text-black font-semibold">{name}</span>
          <span className="text-gray-500 ml-auto hidden sm:block">{dict.destination?.planYourTrip || "Plan Your Trip to"} {name}: {dict.destination?.bestOf || "Best of"} {name}</span>
        </div>

        <div 
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth >= 768) {
              setIsModalOpen(true);
            }
          }}
          className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] rounded-2xl overflow-hidden mb-8 group bg-gray-900 shadow-sm border border-gray-100 md:cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {displayImages.map((imgSrc, idx) => (
            <Image 
              key={idx}
              src={imgSrc} 
              alt={`${name} - ${idx}`} 
              fill 
              className={`object-cover transition-opacity duration-300 ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              priority={idx === currentIndex}
            />
          ))}
          
          {/* Gradients */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

          {/* Prev/Next Buttons */}
          <button 
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer hidden md:flex"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer hidden md:flex"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20" onClick={(e) => e.stopPropagation()}>
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-colors shadow-sm ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>

          {/* Image count */}
          <div className="absolute bottom-4 right-6 bg-black/60 border border-white/10 text-white text-[13px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 z-20 backdrop-blur-sm shadow-md">
            <ImageIcon className="w-4 h-4" />
            {displayImages.length}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-[36px] md:text-[46px] font-extrabold text-[#004f32] tracking-tight leading-tight">
            {name}
          </h1>
          <button className="flex items-center gap-2 border border-black rounded-full px-5 py-2.5 hover:bg-gray-50 font-bold text-[15px] transition-colors w-fit shadow-sm">
            <Heart className="w-4 h-4" /> {dict.hotelGallery?.save || "Save"}
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md">
          {/* Close Button */}
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 lg:top-8 lg:right-10 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-[110]"
          >
            <X className="w-8 h-8" />
          </button>
          
          {/* Nav Buttons */}
          <button 
            onClick={prevImage}
            className="absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-opacity z-[110]"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          
          <button 
            onClick={nextImage}
            className="absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-opacity z-[110]"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
          
          {/* Main Image Object Contain */}
          <div className="relative w-full h-[80vh] md:h-[90vh] mx-16 flex items-center justify-center">
            <Image
              src={displayImages[currentIndex]}
              alt={`Zoomed ${name} - ${currentIndex}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          
          {/* Index counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-medium text-[15px] tracking-wide bg-black/50 px-4 py-1.5 rounded-full">
            {currentIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  );
}
