"use client";

import { useLanguage } from "@/app/providers";

export default function TermsPage() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-12 lg:p-16">
        {locale === 'vi' ? <TermsVi /> : <TermsEn />}
      </div>
    </div>
  );
}

function TermsVi() {
  return (
    <div className="space-y-10 text-gray-700 leading-relaxed text-lg">
      <section>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          Điều Khoản Dịch Vụ
        </h1>
        <p>
          Chào mừng bạn đến với NabTravel. Khi truy cập và sử dụng website của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">1. Giới thiệu</h2>
        <p className="mb-4">
          NabTravel là nền tảng trực tuyến cung cấp thông tin, so sánh và hỗ trợ người dùng tìm kiếm các dịch vụ du lịch như khách sạn, tour và các sản phẩm liên quan.
        </p>
        <p>
          Việc bạn tiếp tục sử dụng website đồng nghĩa với việc bạn chấp nhận các điều khoản này.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">2. Phạm vi dịch vụ</h2>
        <p className="mb-4">Chúng tôi cung cấp:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Thông tin về khách sạn, tour du lịch và điểm đến</li>
          <li>Công cụ tìm kiếm và so sánh giá</li>
          <li>Gợi ý hành trình và nội dung du lịch</li>
        </ul>
        <p>
          NabTravel không trực tiếp sở hữu hoặc vận hành các khách sạn hay tour (trừ khi có thông báo cụ thể). Một số dịch vụ có thể được cung cấp bởi bên thứ ba.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">3. Tài khoản người dùng</h2>
        <p className="mb-4">Khi sử dụng dịch vụ, bạn đồng ý:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Cung cấp thông tin chính xác và đầy đủ</li>
          <li>Không sử dụng website cho mục đích gian lận hoặc vi phạm pháp luật</li>
          <li>Bảo mật thông tin tài khoản cá nhân (nếu có)</li>
        </ul>
        <p>
          Chúng tôi có quyền tạm ngưng hoặc chấm dứt quyền truy cập nếu phát hiện hành vi vi phạm.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">4. Nội dung và quyền sở hữu</h2>
        <p className="mb-4">Toàn bộ nội dung trên NabTravel bao gồm:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Văn bản, hình ảnh, dữ liệu</li>
          <li>Thiết kế giao diện</li>
          <li>Nội dung AI tạo ra</li>
        </ul>
        <p className="mb-4">Đều thuộc quyền sở hữu của NabTravel hoặc đối tác liên quan.</p>
        <p>Bạn không được sao chép, phân phối hoặc sử dụng lại mà không có sự cho phép bằng văn bản.</p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">5. Đặt dịch vụ và thanh toán</h2>
        <p className="mb-4">Khi bạn thực hiện đặt dịch vụ:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Bạn đồng ý với các điều khoản của đối tác cung cấp (khách sạn, công ty du lịch, v.v.)</li>
          <li>Giá cả và tình trạng phòng/tour có thể thay đổi theo thời điểm</li>
          <li>NabTravel không chịu trách nhiệm cho các thay đổi từ phía bên cung cấp dịch vụ</li>
        </ul>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">6. Liên kết bên thứ ba</h2>
        <p className="mb-4">Website có thể chứa liên kết đến các nền tảng hoặc dịch vụ bên thứ ba.</p>
        <p className="mb-4">Chúng tôi không kiểm soát và không chịu trách nhiệm đối với:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Nội dung</li>
          <li>Chính sách bảo mật</li>
          <li>Điều khoản sử dụng</li>
        </ul>
        <p>của các bên này.</p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">7. Giới hạn trách nhiệm</h2>
        <p className="mb-4">NabTravel không đảm bảo:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Tính chính xác tuyệt đối của mọi thông tin</li>
          <li>Dịch vụ sẽ không bị gián đoạn hoặc lỗi</li>
        </ul>
        <p>
          Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng website hoặc dịch vụ liên quan.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">8. Thay đổi điều khoản</h2>
        <p className="mb-4">
          Chúng tôi có quyền cập nhật hoặc thay đổi Điều khoản Dịch vụ bất cứ lúc nào mà không cần thông báo trước.
        </p>
        <p>Phiên bản mới sẽ có hiệu lực ngay khi được đăng tải trên website.</p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">9. Luật áp dụng</h2>
        <p className="mb-4">Các điều khoản này được điều chỉnh và giải thích theo pháp luật Việt Nam.</p>
        <p>Mọi tranh chấp phát sinh sẽ được giải quyết theo quy định của pháp luật hiện hành.</p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">10. Liên hệ</h2>
        <p className="mb-4">Nếu bạn có bất kỳ câu hỏi nào về Điều khoản Dịch vụ, vui lòng liên hệ:</p>
        <div className="inline-block bg-[#eef8f3] text-[#004f32] font-bold text-xl py-3 px-6 rounded-xl border border-green-100">
          Hotline: 0988 999 395
        </div>
      </section>

      <div className="mt-12 bg-[#f0f8f5] text-[#004f32] p-6 rounded-2xl text-center font-medium border border-green-100">
        Việc tiếp tục sử dụng NabTravel đồng nghĩa với việc bạn đã đọc, hiểu và đồng ý với toàn bộ Điều khoản Dịch vụ này.
      </div>
    </div>
  );
}

function TermsEn() {
  return (
    <div className="space-y-10 text-gray-700 leading-relaxed text-lg">
      <section>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          Terms of Service
        </h1>
        <p>
          Welcome to NabTravel. By accessing and using our website, you agree to comply with the following terms and conditions. Please read them carefully before using our services.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">1. Introduction</h2>
        <p className="mb-4">
          NabTravel is an online platform that provides information, comparison tools, and support for users to search, evaluate, and access travel-related services such as hotels, tours, and other travel products.
        </p>
        <p>
          By continuing to use our website, you acknowledge that you have read, understood, and agreed to these Terms of Service.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">2. Scope of Services</h2>
        <p className="mb-4">We provide:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Information about hotels, tours, and destinations</li>
          <li>Search and price comparison tools</li>
          <li>Travel recommendations and content</li>
        </ul>
        <p>
          NabTravel does not directly own or operate hotels or tours (unless explicitly stated). Some services may be provided by third-party partners.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">3. User Accounts</h2>
        <p className="mb-4">When using our services, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Provide accurate and complete information</li>
          <li>Not use the website for fraudulent or illegal purposes</li>
          <li>Keep your account information secure (if applicable)</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate access if any violations are detected.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">4. Content and Ownership</h2>
        <p className="mb-4">All content on NabTravel, including:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Text, images, and data</li>
          <li>Interface design</li>
          <li>AI-generated content</li>
        </ul>
        <p className="mb-4">is owned by NabTravel or its partners.</p>
        <p>You may not copy, distribute, or reuse any content without prior written permission.</p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">5. Bookings and Payments</h2>
        <p className="mb-4">When making a booking:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>You agree to the terms and conditions of the service provider (hotel, tour operator, etc.)</li>
          <li>Prices and availability may change over time</li>
          <li>NabTravel is not responsible for changes made by third-party providers</li>
        </ul>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">6. Third-Party Links</h2>
        <p className="mb-4">Our website may contain links to third-party platforms or services.</p>
        <p className="mb-4">We do not control and are not responsible for:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Content</li>
          <li>Privacy policies</li>
          <li>Terms of use</li>
        </ul>
        <p>of these external parties.</p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">7. Limitation of Liability</h2>
        <p className="mb-4">NabTravel does not guarantee:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Absolute accuracy of all information</li>
          <li>Uninterrupted or error-free service</li>
        </ul>
        <p>
          We are not liable for any damages arising from the use of our website or related services.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">8. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to update or modify these Terms of Service at any time without prior notice.
        </p>
        <p>The updated version will take effect immediately upon being published on the website.</p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">9. Governing Law</h2>
        <p className="mb-4">These Terms are governed and interpreted in accordance with the laws of Vietnam.</p>
        <p>Any disputes arising will be resolved in accordance with applicable legal regulations.</p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">10. Contact</h2>
        <p className="mb-4">If you have any questions regarding these Terms of Service, please contact us:</p>
        <div className="inline-block bg-[#eef8f3] text-[#004f32] font-bold text-xl py-3 px-6 rounded-xl border border-green-100">
          Hotline: 0988 999 395
        </div>
      </section>

      <div className="mt-12 bg-[#f0f8f5] text-[#004f32] p-6 rounded-2xl text-center font-medium border border-green-100">
        By continuing to use NabTravel, you confirm that you have read, understood, and agreed to these Terms of Service.
      </div>
    </div>
  );
}
