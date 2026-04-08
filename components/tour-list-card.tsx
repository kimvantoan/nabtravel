"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Check, ChevronDown, CheckCircle2, ChevronUp } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";

export interface TourItemData {
  id: string;
  slug?: string;
  name: { en: string; vi: string };
  priceVND: number;
  photoUrl: string;
  rating: number;
  totalReviews: number;
  categorySlug: string;
  cancellationPolicy: boolean;
  locations_applied?: string;
  shortDescription?: { en: string; vi: string };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export function TourListCard({ tour }: { tour: TourItemData }) {
  const { locale, dict } = useLanguage();
  const [showHighlights, setShowHighlights] = useState(false);
  const { toggleFavorite, isFavorite: checkIsFavorite } = useFavorites();
  
  const isFavorite = checkIsFavorite(tour.id, 'tour');

  // Handle Multi-language
  const name = typeof tour.name === "object" ? tour.name[locale as keyof typeof tour.name] || tour.name.en : tour.name;

  // Use the database slug directly
  const detailUrl = `/tour/${tour.slug || tour.id}`;

  // No discount mapped from real database, remove fake randomized deals
  const hasDeal = false;
  const originalPrice = tour.priceVND;
  const currentPrice = tour.priceVND;

  // Rating translation
  const ratingText = tour.rating >= 9 ? (locale === "vi" ? "Tuyệt vời" : "Excellent") :
    tour.rating >= 8 ? (locale === "vi" ? "Rất tốt" : "Very Good") :
      (locale === "vi" ? "Tốt" : "Good");

  // Derive an array of highlights from the short definition, or provide fake defaults if none to match the screenshot
  let highlightStr = typeof tour.shortDescription === "object" ? tour.shortDescription[locale as keyof typeof tour.shortDescription] : tour.shortDescription;
  let highlights = highlightStr ? highlightStr.split('. ').filter(s => s.trim().length > 5).slice(0, 3) : [];

  if (highlights.length === 0) {
    highlights = locale === "vi"
      ? [
        "Hỗ trợ hướng dẫn viên thân thiện chuyên nghiệp suốt tuyến.",
        "Khám phá các điểm đến hot nhất, tạo nên trải nghiệm trọn vẹn.",
      ]
      : [
        "Professional and friendly tour guide support throughout the journey.",
        "Visiting must-see attractions, creating a complete experience journey."
      ];
  }

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-xl md:rounded-[18px] lg:rounded-[20px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group duration-300 h-full flex-1">
      
      {/* Photo Section */}
      <Link href={detailUrl} className="relative block w-full md:w-[260px] lg:w-[280px] shrink-0 aspect-[4/3] md:aspect-[4/3] overflow-hidden md:self-start">
        {tour.photoUrl ? (
          <Image
            src={tour.photoUrl}
            alt={name || "Tour"}
            fill
            sizes="(max-width: 768px) 50vw, 350px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
            No Image
          </div>
        )}
        
        {/* Wishlist button */}
        <button 
           className="absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors z-10 group/btn outline-none"
           onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             toggleFavorite({
               id: tour.id,
               type: 'tour',
               title: typeof tour.name === 'object' ? tour.name.en : tour.name,
               image: tour.photoUrl || '',
               url: detailUrl
             });
           }}
        >
          <Heart className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-gray-400 group-hover/btn:text-rose-500'}`} />
        </button>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-3 md:p-5 lg:p-6 relative h-full">

        <div className="flex flex-col md:flex-row md:justify-between flex-1 md:mb-4 md:gap-6 lg:gap-8 gap-1.5">
          {/* Left Info */}
          <div className="flex-1 pr-0 lg:pr-4">
            <Link href={detailUrl} className="block group/link">
              <h2 className="text-[14px] leading-snug md:leading-tight md:text-[20px] lg:text-[22px] font-bold text-gray-900 group-hover/link:text-[#004f32] transition-colors line-clamp-2">
                {name}
              </h2>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-1.5 md:gap-2 mt-2 md:mt-3">
              <div className="bg-[#10a36e] text-white font-bold px-1.5 md:px-2 py-[2px] rounded text-[11px] md:text-[13px] flex items-center shadow-sm">
                {tour.rating || 9.5}
              </div>
              <span className="text-[#10a36e] font-semibold text-[12px] md:text-[14px] hidden sm:inline">{ratingText}</span>
              <span className="text-gray-400 text-[11px] md:text-[14px] truncate">
                 <span className="hidden sm:inline">- </span>{tour.totalReviews > 0 ? tour.totalReviews : 20} <span className="hidden sm:inline">{locale === 'vi' ? 'đánh giá' : 'reviews'}</span>
              </span>
            </div>

            {/* Location Route */}
            <div className="flex items-start mt-1.5 md:mt-3 gap-1 md:gap-1.5 text-gray-500">
              <MapPin className="w-[12px] h-[12px] md:w-[18px] md:h-[18px] shrink-0 mt-[2px] md:mt-0.5 text-gray-400" />
              <span className="text-[11px] md:text-[15px] leading-snug md:leading-relaxed line-clamp-1 md:line-clamp-2 pr-0 font-medium">
                {tour.locations_applied || "Hanoi - Halong Bay..."}
              </span>
            </div>

            {/* Original fake deals tag has been completely removed to prevent lint errors */}
          </div>

          {/* Right Price (Desktop & Mobile) */}
          <div className="md:min-w-[170px] lg:min-w-[190px] shrink-0 flex flex-col md:items-end justify-start mt-2 md:mt-0 lg:-mt-2">
            {hasDeal && (
               <span className="text-gray-400 font-medium line-through text-[11px] md:text-[14px]">{formatCurrency(originalPrice)}</span>
            )}
            <div className={`flex items-baseline md:items-end gap-1 flex-row md:flex-col lg:flex-row lg:items-baseline ${!hasDeal ? 'md:mt-4' : ''}`}>
              <span className="text-gray-700 font-bold text-[11px] md:text-[14px] hidden lg:inline">{locale === 'vi' ? 'Chỉ' : 'from'}</span>
              <span className="text-[#d83b20] font-extrabold text-[15px] md:text-[24px] xl:text-[28px] leading-none">
                {formatCurrency(currentPrice)}
              </span>
            </div>
            <span className="text-gray-500 text-[10px] md:text-[13px] mt-0.5 md:mt-1 hidden md:block">/{locale === 'vi' ? 'người' : 'pax'}</span>
          </div>
        </div>

        {/* Description & Action */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-3 md:gap-6 flex-none">
          {/* Left side: Highlights Collapsible */}
          <div className="hidden md:flex flex-col flex-1 w-full">
             <button 
                onClick={() => setShowHighlights(!showHighlights)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-[#004f32] transition-colors w-fit focus:outline-none"
             >
                {locale === 'vi' ? 'Điểm nhấn' : 'Highlights'}
                <ChevronUp className={`w-[13px] h-[13px] text-gray-400 transition-transform duration-300 ${!showHighlights ? 'rotate-180' : ''}`} />
             </button>
             
             <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${showHighlights ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}>
                {highlights.map((h, i) => (
                   <div key={i} className="flex items-start gap-2.5 text-[13px] text-gray-600 leading-snug">
                      <Check className="w-[13px] h-[13px] text-[#004f32] shrink-0 mt-[2px] stroke-[2]" />
                      <span>{h}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Right side: Button */}
          <div className="w-full md:w-auto shrink-0 flex md:justify-end self-end">
            <Link
              href={detailUrl}
              className="bg-[#004f32] text-white font-bold text-[14px] px-6 py-2.5 rounded-[6px] hover:bg-[#003d27] transition-colors shadow-sm active:scale-95 duration-200 block text-center w-full md:w-auto whitespace-nowrap"
            >
              {locale === 'vi' ? "Xem tour" : "View tour"}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
