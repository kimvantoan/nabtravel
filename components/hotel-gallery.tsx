"use client";

import Image from "next/image";
import { Share, Pencil, Heart, Phone, MapPin, ImageIcon } from "lucide-react";
import { useLanguage } from "@/app/providers";

function RatingBubbles() {
  return (
    <div className="flex gap-0.5 mx-1 items-center">
      {[1, 2, 3, 4, 5].map((bubble) => (
        <svg key={bubble} width="14" height="14" viewBox="0 0 16 16" fill="#00aa6c" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="8" />
        </svg>
      ))}
    </div>
  );
}

export function HotelGallery() {
  const { dict } = useLanguage();
  const scrollToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full pb-8">
      {/* Hotel Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        {/* Title and Ratings */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl md:text-[34px] font-bold text-[#004f32] tracking-tight">
            PĀMA Boutique Hotel
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <span className="font-bold text-base">4,9</span>
            <RatingBubbles />
            <button onClick={scrollToReviews} className="hover:underline text-gray-700 underline-offset-2">
              (40 {dict.hotelGallery?.reviews || "đánh giá"})
            </button>
            <span className="text-gray-400 mx-1">•</span>
            <a href="#" className="hover:underline text-gray-700 underline-offset-2">
              #8 {dict.header?.hotels || "Khách sạn"} Ngu Hanh Son
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mt-1">
            <a href="tel:0905685986" className="flex items-center gap-1.5 hover:underline shrink-0">
              <Phone className="w-4 h-4" />
              090 568 59 86
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-4 text-sm font-semibold text-gray-900">
            <button className="flex items-center gap-1.5 hover:text-green-800 transition-colors">
              <Share className="w-4 h-4" strokeWidth={2} />
              {dict.hotelGallery?.share || "Chia sẻ"}
            </button>
            <button onClick={scrollToReviews} className="flex items-center gap-1.5 hover:text-green-800 transition-colors">
              <Pencil className="w-4 h-4" strokeWidth={2} />
              {dict.hotelDetail?.writeReview || "Đánh giá"}
            </button>
            <button className="flex items-center gap-1.5 hover:text-green-800 transition-colors">
              <Heart className="w-4 h-4" strokeWidth={2} />
              {dict.hotelGallery?.save || "Lưu"}
            </button>
          </div>
          
          <button className="bg-[#0cf688] hover:bg-[#00aa6c] text-black hover:text-white font-bold px-6 py-2.5 rounded-full transition-colors shadow-sm w-full md:w-auto mt-2 text-[15px]">
            {dict.hotelDetail?.viewPrices || "Kiểm tra phòng trống"}
          </button>
        </div>
      </div>

      {/* Masonry Image Gallery */}
      <div className="flex flex-col md:flex-row gap-1 h-auto md:h-[460px] rounded-xl overflow-hidden">
        {/* Main large image */}
        <div className="relative w-full md:w-2/3 h-[300px] md:h-full cursor-pointer group">
          <Image
            src="/images/hotel_main.png"
            alt="PĀMA Boutique Hotel Room"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Right side 3 small images */}
        <div className="w-full md:w-1/3 flex flex-col gap-1 h-[400px] md:h-full relative">
          
          {/* Small 1 */}
          <div className="relative w-full h-1/3 cursor-pointer group overflow-hidden">
            <Image
              src="/images/hotel_tourist.png"
              alt="Tourist view"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark gradient overlay for text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white font-bold text-[15px]">
              <span>{dict.hotelGallery?.tourists || "Khách du lịch"}</span>
              <span>72</span>
            </div>
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Small 2 */}
          <div className="relative w-full h-1/3 cursor-pointer group overflow-hidden">
            <Image
              src="/images/hotel_suite.png"
              alt="Suite view"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white font-bold text-[15px]">
              <span>{dict.hotelGallery?.suites || "Phòng Suite"}</span>
              <span>9</span>
            </div>
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Small 3 */}
          <div className="relative w-full h-1/3 cursor-pointer group overflow-hidden">
            <Image
              src="/images/hotel_dining.png"
              alt="Dining view"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white font-bold text-[15px]">
              <span>{dict.hotelGallery?.dining || "Nhà hàng"}</span>
              <span>7</span>
            </div>
            
            {/* View all photos button overlay */}
            <button className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium text-sm">
              <ImageIcon className="w-4 h-4" />
              93
            </button>
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
        </div>
      </div>
    </div>
  );
}
