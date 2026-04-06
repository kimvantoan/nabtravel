"use client";

import { useLanguage } from "@/app/providers";

export default function TermsPage() {
  const { dict, locale } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          {locale === 'vi' ? 'Điều Khoản Dịch Vụ' : 'Terms of Service'}
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. {locale === 'vi' ? 'Chấp nhận điều khoản' : 'Acceptance of Terms'}</h2>
            <p>
              {locale === 'vi' 
                ? 'Bằng cách truy cập và sử dụng dịch vụ của Nabtravel, bạn đồng ý tuân thủ các điều khoản dịch vụ mà chúng tôi đề ra. Vui lòng đọc kỹ các điều khoản này trước khi sử dụng.'
                : 'By accessing and using Nabtravel services, you agree to comply with our stated terms of service. Please read these terms carefully before using.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. {locale === 'vi' ? 'Sử dụng dịch vụ' : 'Use of Service'}</h2>
            <p>
              {locale === 'vi'
                ? 'Bạn cam kết không sử dụng hệ thống vào các mục đích vi phạm pháp luật, giả mạo danh tính, hoặc spam hệ thống đánh giá bằng bot.'
                : 'You agree not to use the system for illegal purposes, impersonation, or spanning the review system with bots.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. {locale === 'vi' ? 'Chính sách giá' : 'Pricing Policy'}</h2>
            <p>
              {locale === 'vi'
                ? 'Giá phòng trên Nabtravel được tổng hợp từ đối tác thứ 3 (Booking.com, Agoda). Chúng tôi nỗ lực cập nhật liên tục nhưng giá cuối cùng có thể thay đổi tùy thuộc vào nhà cung cấp.'
                : 'Room prices on Nabtravel are aggregated from 3rd party partners (Booking.com, Agoda). We strive to update continuously but final prices may vary depending on the provider.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. {locale === 'vi' ? 'Sửa đổi điều khoản' : 'Modification of Terms'}</h2>
            <p>
              {locale === 'vi'
                ? 'Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào mà không cần báo trước. Sự thay đổi sẽ có hiệu lực ngay khi được đăng tải.'
                : 'We reserve the right to modify these terms at any time without prior notice. Changes are effective immediately upon posting.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
