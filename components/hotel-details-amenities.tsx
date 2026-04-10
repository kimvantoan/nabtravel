"use client";

import { useState } from "react";
import { ParkingCircle, Wifi, Utensils, GlassWater, Snowflake, Archive, BoxSelect, MountainSnow, Building2, Ban, Users, Waves, Landmark, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/app/providers";



function RatingBar({ label, score, percent }: { label: string; score: string; percent: string }) {
  return (
    <div className="flex items-center justify-between text-[15px] mb-1.5">
      <span className="w-32 text-gray-800">{label}</span>
      <div className="flex-1 max-w-[140px] ml-4 h-3 bg-gray-200 rounded-sm overflow-hidden">
        <div className="h-full bg-[#00aa6c] rounded-sm" style={{ width: percent }}></div>
      </div>
      <span className="w-8 text-right font-medium text-gray-800">{score}</span>
    </div>
  );
}

interface Amenity {
  name: string;
  type: string;
}

function getIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('park')) return <ParkingCircle className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('restaurant') || lower.includes('dining')) return <Utensils className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('bar ') || lower.includes('drink')) return <GlassWater className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('air cond')) return <Snowflake className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('safe')) return <Archive className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('mini')) return <BoxSelect className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('pool') || lower.includes('beach') || lower.includes('swimm')) return <Waves className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('mountain')) return <MountainSnow className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('city') || lower.includes('build')) return <Building2 className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('family') || lower.includes('kid')) return <Users className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  if (lower.includes('smok')) return <Ban className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
  return <CheckCircle2 className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />;
}

export function HotelDetailsAmenities({ rating, reviewsCount, description, amenities }: { rating?: number, reviewsCount?: number, description?: string, amenities?: Amenity[] }) {
  const { dict, locale } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const groupedAmenities = amenities?.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    if (!acc[curr.type].includes(curr.name)) acc[curr.type].push(curr.name);
    return acc;
  }, {} as Record<string, string[]>) || {};

  // Default fallback if API fails
  if (!amenities || amenities.length === 0) {
    groupedAmenities['Property'] = ['Parking', 'Free WiFi', 'Restaurant', 'Bar/Lounge'];
    groupedAmenities['Room'] = ['Air conditioning', 'Safe', 'Minibar', 'Flat-screen TV'];
    groupedAmenities['Room Types'] = ['Non-smoking rooms', 'Family rooms'];
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-12 py-10 border-t border-gray-200" id="reviews">

      {/* LEFT COLUMN: Overview & Ratings */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-black mb-4">{dict.hotelAmenities?.about || "Giới thiệu"}</h2>

          <div className="flex items-center gap-3 mb-4 mt-2">
            <div className="bg-[#004f32] text-white font-black text-[32px] px-4 py-2 rounded-xl shadow-md flex items-center justify-center">
              {Number.isInteger(rating) ? (rating || 8.5).toFixed(1) : (rating || 8.5)}
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-extrabold text-[16px] text-gray-900 leading-none mb-1.5">
                {(rating || 8.5) >= 9 ? (locale === 'vi' ? 'Tuyệt hảo' : 'Exceptional') : 
                 (rating || 8.5) >= 8 ? (locale === 'vi' ? 'Rất tốt' : 'Very Good') : 
                 (rating || 8.5) >= 7 ? (locale === 'vi' ? 'Tốt' : 'Good') : 
                 (locale === 'vi' ? 'Đáng giá' : 'Review score')}
              </span>
              <a href="#reviews" className="text-[13px] text-gray-500 hover:text-[#004f32] hover:underline cursor-pointer">
                {reviewsCount || 40} {locale === 'vi' ? 'đánh giá' : 'reviews'}
              </a>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-4">
            {/* Description Text */}
            <div
              className={`text-[15px] text-gray-800 leading-[1.65] transition-all duration-300 ${!isExpanded ? "line-clamp-4" : ""}`}
            >
              {description || "Khách sạn sang trọng với nhiều tiện nghi hiện đại và thiết kế bắt mắt, mang lại trải nghiệm nghỉ dưỡng tuyệt vời cho khách hàng."}
            </div>

            {/* Read More / Read Less Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="cursor-pointer flex items-center gap-1 font-bold text-[15px] text-black underline underline-offset-2 decoration-8 decoration-transparent hover:opacity-80 transition-opacity w-fit mt-1"
            >
              {isExpanded ? (dict.hotelAmenities?.readLess || "Read less") : (dict.hotelAmenities?.readMore || "Read more")}
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 ml-0.5" strokeWidth={2} />
              ) : (
                <ChevronDown className="w-5 h-5 ml-0.5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Amenities */}
      <div className="w-full md:w-2/3 flex flex-col gap-10">

        {Object.entries(groupedAmenities).slice(0, 4).map(([type, names]) => {
          let displayType = type;
          if (locale === 'vi') {
            const t = type.toLowerCase();
            if (t === 'property') displayType = 'Tiện nghi chung';
            else if (t === 'room') displayType = 'Tiện ích phòng';
            else if (t === 'bathroom') displayType = 'Phòng tắm';
            else if (t === 'general') displayType = 'Thông tin chung';
            else if (t === 'accessibility') displayType = 'Hỗ trợ người khuyết tật';
            else if (t === 'media & technology') displayType = 'Giải trí & Công nghệ';
            else if (t === 'food & drink') displayType = 'Ẩm thực';
            else if (t === 'services & extras') displayType = 'Dịch vụ & Tiện ích thêm';
            else if (t === 'outdoor & view') displayType = 'Ngoài trời & Tầm nhìn';
            else if (t === 'room amenities') displayType = 'Tiện ích phòng';
            else if (t === 'room types') displayType = 'Loại phòng';
          }

          return (
            <div key={type}>
              <h3 className="text-[17px] font-bold text-black mb-4 uppercase">{displayType}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {names.slice(0, 8).map((name) => (
                  <div key={name} className="flex items-center gap-3 text-[15px] text-gray-800">
                    {getIcon(name)}
                    {name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
