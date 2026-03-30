"use client";

import { useState } from "react";
import { ParkingCircle, Wifi, Utensils, GlassWater, Snowflake, Archive, BoxSelect, MountainSnow, Building2, Ban, Users, Waves, Landmark, ChevronUp, ChevronDown } from "lucide-react";

function RatingBubbles() {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((bubble) => (
        <svg key={bubble} width="16" height="16" viewBox="0 0 16 16" fill="#00aa6c" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="8" />
        </svg>
      ))}
    </div>
  );
}

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

export function HotelDetailsAmenities() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full flex flex-col md:flex-row gap-12 py-10 border-t border-gray-200">

      {/* LEFT COLUMN: Overview & Ratings */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-black mb-4">Giới thiệu</h2>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-[48px] font-black tracking-tighter leading-none text-black">4,9</span>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[15px] text-black leading-none">Xuất sắc</span>
              <div className="flex items-center gap-1">
                <RatingBubbles />
                <a href="#" className="text-[13px] text-gray-600 hover:text-black hover:underline ml-1">
                  (40 đánh giá)
                </a>
              </div>
            </div>
          </div>

          <div className="text-[15px] text-gray-800 mb-6">
            Số 8 trong 14 khách sạn tại Ngu Hanh Son
          </div>

          <div className="flex flex-col">
            <RatingBar label="Địa điểm" score="4.9" percent="98%" />
            <RatingBar label="Phòng" score="5.0" percent="100%" />
            <RatingBar label="Giá trị" score="4.9" percent="98%" />
            <RatingBar label="Sự sạch sẽ" score="5.0" percent="100%" />
            <RatingBar label="Dịch vụ" score="5.0" percent="100%" />
            <RatingBar label="Giấc ngủ" score="5.0" percent="100%" />
          </div>

          <div className="mt-8 flex flex-col gap-4">
            {/* Description Text */}
            <div
              className={`text-[15px] text-gray-800 leading-[1.65] transition-all duration-300 ${!isExpanded ? "line-clamp-4" : ""}`}
            >
              The Furama Villas is a beautiful complex of two to four bedroom villas of Furama Resort Danang with private pools, fully equipped kitchen and luxurious beach access or in the plush gardens. The red-tiled roofs give the villas a distinctive Asian character influenced by the architectures of Champa, the royal temples and palace, while the lavish wood and marble interiors and state-of-the-art facilities help the guests enjoy the villas. Just 5-minute drive to Marble Mountain and a 20-minute drive to the UNESCO Heritage Site of Hoi An, Danang International Airport is a 15-minute drive away, you are able to enjoy many of the available services at Furama Resort Danang which includes two outdoor swimming pools, bars and lounges which open until 2.00am, luxurious restaurants offering Asian, Italian and Western cuisines, experienced and professional staff, a kids club with fun activities for children, a gym, spa facilities, billiards and tennis. We are sure that you and your friends or family will have a relaxing time at Furama Villas and Resort Danang!
            </div>

            {/* Read More / Read Less Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="cursor-pointer flex items-center gap-1 font-bold text-[15px] text-black underline underline-offset-2 decoration-8 decoration-transparent hover:opacity-80 transition-opacity w-fit mt-1"
            >
              {isExpanded ? "Read less" : "Read more"}
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

        {/* Tiện nghi của khách sạn */}
        <div>
          <h3 className="text-[17px] font-bold text-black mb-4">Tiện nghi của khách sạn</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <ParkingCircle className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Bãi đỗ xe miễn phí
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <ParkingCircle className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Bãi đỗ xe
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <Wifi className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Internet tốc độ miễn phí (WiFi)
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <GlassWater className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Quầy bar / sảnh chờ
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <Utensils className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Nhà hàng
            </div>
          </div>
        </div>

        {/* Tiện nghi trong phòng */}
        <div>
          <h3 className="text-[17px] font-bold text-black mb-4">Tiện nghi trong phòng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <Snowflake className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Điều hòa nhiệt độ
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <Archive className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Két sắt
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <BoxSelect className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Quầy bar mini
            </div>
          </div>
        </div>

        {/* Loại phòng */}
        <div>
          <h3 className="text-[17px] font-bold text-black mb-4">Loại phòng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <MountainSnow className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Ngắm cảnh núi
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <Waves className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Ngắm cảnh biển
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <Building2 className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Ngắm cảnh thành phố
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <Landmark className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Nhìn ra tòa nhà
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <Ban className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Phòng không hút thuốc
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <BoxSelect className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Phòng Suite
            </div>
            <div className="flex items-center gap-3 text-[15px] text-gray-800">
              <Users className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              Phòng cho gia đình
            </div>
          </div>
        </div>

        {/* Edit profile link */}
        <div className="mt-auto pt-6 text-right">
          <p className="text-[13px] text-gray-600">
            Đề xuất chỉnh sửa để cải thiện nội dung chúng tôi hiển thị.{" "}
            <a href="#" className="font-bold underline hover:text-black">Cải thiện hồ sơ này</a>
          </p>
        </div>

      </div>
    </div>
  );
}
