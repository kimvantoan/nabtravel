"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { useState } from "react";
import { LiveListPrice } from "./live-list-price";

export interface HotelGridData {
  id: string;
  slug: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  reviews: number;
  reviewWord: "excellent" | "veryGood" | "good";
  price: number;
  price_updated_at?: string;
  originalPrice?: number;
  stars?: number;
  propertyType?: string;
  priceLevel?: string;
  neighborhood?: string;
}

export function HotelGridCard({ hotel }: { hotel: HotelGridData }) {
  const { dict } = useLanguage();
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col overflow-hidden h-full relative">

      {/* Image Container */}
      <Link href={`/hotel/${hotel.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer block">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 will-change-transform"
        />
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsLiked(!isLiked); }}
        className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2.5 rounded-full bg-black/20 hover:bg-white backdrop-blur-sm transition-all duration-300 shadow-sm group/btn z-20 cursor-pointer"
        aria-label="Save to favorites"
      >
        <Heart
          className={`w-[18px] h-[18px] md:w-[22px] md:h-[22px] transition-colors duration-300 ${isLiked ? "fill-red-500 text-red-500" : "text-white group-hover/btn:text-gray-900"}`}
          strokeWidth={isLiked ? 0 : 2}
        />
      </button>

      {/* Content Container */}
      <div className="p-3 md:p-5 flex flex-col flex-1">

        {/* Title & Location */}
        <div className="mb-3 md:mb-4">
          <Link href={`/hotel/${hotel.slug}`} className="hover:text-green-700 transition-colors">
            <h3 className="font-extrabold text-gray-900 text-[14px] md:text-[19px] leading-snug line-clamp-2 mb-1.5 md:mb-2">
              {hotel.name}
            </h3>
          </Link>
          <div className="flex items-start gap-1 md:gap-1.5 text-gray-500">
            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-[1px] md:mt-0.5 text-gray-400" />
            <span className="text-[12px] md:text-[14px] font-medium leading-normal line-clamp-1">{hotel.location}</span>
          </div>
        </div>

        {/* Reviews */}
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 mt-auto">
          <div className="bg-[#004f32] text-white font-extrabold text-[13px] md:text-[15px] px-1.5 py-0.5 md:px-2 md:py-1 rounded-[4px] md:rounded-[6px] shadow-sm">
            {hotel.rating.toFixed(1)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-[12px] md:text-[14px] leading-none mb-1">
              {dict.hotelsPage?.[hotel.reviewWord] || "Tuyệt vời"}
            </span>
            <span className="text-[11px] md:text-[13px] text-gray-500 font-medium leading-none">
              {(hotel.reviews || 0).toLocaleString('vi-VN')} {dict.hotelsPage?.reviews || "đánh giá"}
            </span>
          </div>
        </div>

        <div className="w-full h-px bg-gray-100 mb-3 md:mb-5" />

        {/* Price & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-auto gap-3 sm:gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 md:mb-1.5">
              1 {dict.hotelsPage?.night || "đêm"}
            </span>
            {hotel.originalPrice && (
              <span className="text-[11px] md:text-[13px] text-gray-400 line-through font-semibold mb-0.5">
                {hotel.originalPrice.toLocaleString('vi-VN')} ₫
              </span>
            )}
            <span className="text-[16px] md:text-[22px] font-extrabold text-gray-900 leading-none tracking-tight">
              <LiveListPrice hotelName={hotel.name} fallbackPrice={hotel.price} priceUpdatedAt={hotel.price_updated_at} fontSize="22px" />
            </span>
          </div>

          <Link
            href={`/hotel/${hotel.slug}`}
            className="w-full sm:w-auto text-center bg-[#34e065] text-black hover:bg-[#2fc458] font-bold text-[13px] md:text-[15px] px-3 py-2 md:px-5 md:py-3 rounded-lg md:rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] shrink-0"
          >
            {dict.hotelsPage?.viewDeal || "Xem ưu đãi"}
          </Link>
        </div>
      </div>
    </div>
  );
}
