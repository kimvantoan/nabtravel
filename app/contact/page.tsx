"use client";

import { useLanguage } from "@/app/providers";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const { dict, locale } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          {locale === 'vi' ? 'Liên Hệ' : 'Contact Us'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === 'vi' ? 'Thông Tin Liên Hệ' : 'Get In Touch'}
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-gray-700">
                <div className="w-12 h-12 bg-[#e6f4ef] rounded-full flex items-center justify-center text-[#00aa6c] shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">{locale === 'vi' ? 'Địa chỉ' : 'Address'}</div>
                  <div>123 Đường Du Lịch, Quận 1, TP. HCM</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <div className="w-12 h-12 bg-[#e6f4ef] rounded-full flex items-center justify-center text-[#00aa6c] shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">Email</div>
                  <div>support@nabtravel.com</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <div className="w-12 h-12 bg-[#e6f4ef] rounded-full flex items-center justify-center text-[#00aa6c] shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">{locale === 'vi' ? 'Điện thoại' : 'Phone'}</div>
                  <div>+84 123 456 789</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{locale === 'vi' ? 'Họ tên' : 'Name'}</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00aa6c] focus:ring-1 focus:ring-[#00aa6c] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00aa6c] focus:ring-1 focus:ring-[#00aa6c] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{locale === 'vi' ? 'Tin nhắn' : 'Message'}</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00aa6c] focus:ring-1 focus:ring-[#00aa6c] outline-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-[#00aa6c] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#008f5a] transition-colors mt-2">
                {locale === 'vi' ? 'Gửi Lời Nhắn' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
