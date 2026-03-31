"use client";

import { useLanguage } from "@/app/providers";
import { HotelFilters } from "@/components/hotel-filters";
import { HotelGridCard, HotelGridData } from "@/components/hotel-grid-card";
import { ChevronDown, SlidersHorizontal, Search } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop"
];

const SORT_OPTIONS = [
  { id: "recommended", labelKey: "recommended" },
  { id: "priceLowToHigh", labelKey: "priceLowToHigh" },
  { id: "priceHighToLow", labelKey: "priceHighToLow" },
  { id: "topReviewed", labelKey: "topReviewed" },
];

export function HotelsClientView({ initialHotels }: { initialHotels: HotelGridData[] }) {
  const { dict } = useLanguage();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState("recommended");
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50/50 pb-20">
      
      {/* Search Hero Area */}
      <div className="container mx-auto px-4 md:px-8 mt-4 md:mt-6 mb-6 md:mb-10">
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[460px] flex items-center justify-center rounded-2xl md:rounded-[32px] overflow-hidden shadow-md bg-gray-900">
          {HERO_IMAGES.map((src, idx) => (
            <Image 
              key={idx}
              src={src} 
              alt={`Resort Inspiration ${idx + 1}`}
              fill
              className={`object-cover transition-opacity duration-1000 ${heroIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              priority={idx === 0}
            />
          ))}

          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

          {/* Dots (Bottom Center) - Decorative */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {HERO_IMAGES.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${heroIndex === idx ? 'bg-white opacity-100 w-3' : 'bg-white opacity-50'}`} 
              />
            ))}
          </div>

          <div className="relative z-20 flex flex-col items-center w-full max-w-2xl px-4">
            <h1 className="text-[36px] md:text-[52px] font-extrabold text-white tracking-tight mb-6 md:mb-8 text-center leading-[1.1]" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
              {dict.hotelsPage?.heroTitle || "Find hotels travelers love"}
            </h1>
            
            <div className="w-full relative shadow-2xl rounded-full">
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <Search className="w-[18px] h-[18px] md:w-5 md:h-5 text-gray-500" strokeWidth={2.5} />
            </div>
            <input 
              type="text" 
              placeholder={dict.hotelsPage?.searchPlaceholder || "Hotel name or destination"}
              className="w-full h-14 md:h-[60px] pl-[50px] md:pl-[60px] pr-6 rounded-full bg-white text-[15px] md:text-[17px] font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-500/30 placeholder:text-gray-500 placeholder:font-medium shadow-sm"
            />
          </div>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar - Filters */}
          <div className="hidden lg:block w-[300px] xl:w-[320px] shrink-0 sticky top-28 h-fit">
            <HotelFilters />
          </div>

          {/* Right Content - Grid */}
          <div className="flex-1 min-w-0">
            
            {/* Sort Bar */}
            <div className="flex justify-between items-center mb-6 relative z-30">
              <span className="font-bold text-gray-700 text-[15px]">
                {initialHotels.length} {dict.searchHero?.hotels || "Khách sạn"}
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMobileFilterOpen(true)} 
                  className="flex lg:hidden items-center justify-center gap-1.5 bg-white border border-gray-300 rounded-xl px-4 py-2 font-bold text-[14px] text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Lọc
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-2 font-bold text-[14px] shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <span className="hidden md:inline">{dict.hotelsPage?.sortBy || "Sắp xếp theo"}:</span>
                    <span>{dict.hotelsPage?.[sortOption as keyof typeof dict.hotelsPage] || "Đề xuất"}</span>
                    <ChevronDown className={`w-4 h-4 ml-1 text-gray-500 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
                  </button>

                {isSortOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSortOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSortOption(opt.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-gray-50 ${sortOption === opt.id ? "text-green-700 bg-green-50/50" : "text-gray-700"}`}
                        >
                          {dict.hotelsPage?.[opt.labelKey as keyof typeof dict.hotelsPage] || opt.labelKey}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {initialHotels.map((hotel) => (
                <HotelGridCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
            
            {/* Load More Button Placeholder */}
            <div className="mt-12 flex justify-center">
               <button className="bg-white border-2 border-black text-black font-extrabold rounded-full px-8 py-3.5 hover:bg-gray-50 transition-colors text-[15px]">
                 Tải thêm kết quả
               </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col lg:hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0">
            <h3 className="font-extrabold text-gray-900 text-[17px]">
              {dict.hotelsPage?.filters || "Bộ lọc"}
            </h3>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto w-full">
            <HotelFilters />
          </div>
          <div className="p-4 border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0">
            <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-[#004f32] text-white font-extrabold text-[15px] py-4 rounded-xl shadow-sm hover:bg-[#003d27] transition-colors">
              Hiển thị kết quả
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
