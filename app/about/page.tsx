"use client";

import { useLanguage } from "@/app/providers";

export default function AboutPage() {
  const { dict, locale } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          {locale === 'vi' ? 'Về Chúng Tôi' : 'About Us'}
        </h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
          <p>
            {locale === 'vi' 
              ? 'Chào mừng bạn đến với Nabtravel! Chúng tôi là nền tảng đáng tin cậy của bạn để khám phá, lên kế hoạch và đặt chỗ cho chuyến đi hoàn hảo tiếp theo.'
              : 'Welcome to Nabtravel! We are your trusted platform to discover, plan, and book your next perfect trip.'}
          </p>
          <p>
            {locale === 'vi'
              ? 'Sứ mệnh của chúng tôi là đem đến những trải nghiệm lưu trú tuyệt vời nhất thông qua hệ thống đánh giá trung thực, cập nhật giá thời gian thực từ các đối tác lớn như Booking.com hay Agoda, và tích hợp AI thông minh để giúp bạn lên lịch trình.'
              : 'Our mission is to provide the best accommodation experiences through honest reviews, real-time prices from major partners like Booking.com or Agoda, and smart AI integration to help you plan your itinerary.'}
          </p>
          <div className="bg-[#f0f8f5] p-6 rounded-2xl mt-8">
            <h2 className="text-xl font-bold text-[#004f32] mb-3">
              {locale === 'vi' ? 'Giá Trị Cốt Lõi' : 'Core Values'}
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>{locale === 'vi' ? 'Sự minh bạch tuyệt đối trong đánh giá' : 'Absolute transparency in reviews'}</li>
              <li>{locale === 'vi' ? 'Luôn hướng tới người dùng' : 'Always user-centric'}</li>
              <li>{locale === 'vi' ? 'Đổi mới công nghệ với AI' : 'Technological innovation with AI'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
