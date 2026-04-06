"use client";

import { useLanguage } from "@/app/providers";

export default function PolicyPage() {
  const { dict, locale } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          {locale === 'vi' ? 'Chính Sách Bảo Mật' : 'Privacy Policy'}
        </h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. {locale === 'vi' ? 'Thu thập thông tin' : 'Information Collection'}</h2>
            <p>
              {locale === 'vi' 
                ? 'Chúng tôi thu thập thông tin cơ bản khi bạn đăng nhập bằng Google, bao gồm Tên, Email và Hình ảnh đại diện để cá nhân hóa trải nghiệm trên trang.'
                : 'We collect basic information when you sign in with Google, including your Name, Email, and Avatar, to personalize your experience on the site.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. {locale === 'vi' ? 'Sử dụng thông tin' : 'Use of Information'}</h2>
            <p>
              {locale === 'vi'
                ? 'Thông tin cá nhân chỉ được sử dụng cho việc định danh tài khoản khi bạn viết đánh giá hoặc tương tác với trợ lý AI. Chúng tôi không bao giờ bán dữ liệu của bạn cho bên thứ ba.'
                : 'Personal information is used solely for account identification when you write reviews or interact with our AI assistant. We never sell your data to third parties.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. {locale === 'vi' ? 'Cookie dữ liệu' : 'Data Cookies'}</h2>
            <p>
              {locale === 'vi'
                ? 'NAB Travel sử dụng cookie để lưu ưu tiên ngôn ngữ (locale) và session trạng thái đăng nhập, nhằm mang lại trải nghiệm duyệt web mượt mà.'
                : 'NAB Travel uses cookies to store language preferences and login session state, providing a smooth browsing experience.'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. {locale === 'vi' ? 'Bảo vệ dữ liệu' : 'Data Protection'}</h2>
            <p>
              {locale === 'vi'
                ? 'Dữ liệu được mã hóa và bảo mật tại máy chủ của chúng tôi. Nếu bạn muốn xóa tài khoản và mọi dữ liệu liên quan, vui lòng gửi email tới bộ phận hỗ trợ.'
                : 'Data is encrypted and secured on our servers. If you wish to delete your account and all associated data, please email our support team.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
