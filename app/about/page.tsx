"use client";

import { useLanguage } from "@/app/providers";

export default function AboutPage() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-12 lg:p-16">
        {locale === 'vi' ? <AboutVi /> : <AboutEn />}
      </div>
    </div>
  );
}

function AboutVi() {
  return (
    <div className="space-y-10 text-gray-700 leading-relaxed text-lg">
      <section>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          Giới thiệu về NabTravel
        </h1>
        <p className="mb-4">
          <strong>NabTravel</strong> là nền tảng du lịch trực tuyến được phát triển bởi <strong>CÔNG TY CỔ PHẦN Kolsup Limited</strong>, với mục tiêu giúp người dùng dễ dàng tìm kiếm, so sánh và đặt các dịch vụ du lịch một cách nhanh chóng, minh bạch và tối ưu chi phí.
        </p>
        <p>
          Chúng tôi tập trung xây dựng một hệ sinh thái du lịch thông minh, nơi bạn có thể lên kế hoạch cho toàn bộ hành trình chỉ trong vài phút – từ đặt khách sạn, lựa chọn tour cho đến tham khảo lịch trình chi tiết.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4 flex items-center gap-2">
          🌍 Sứ mệnh của chúng tôi
        </h2>
        <p className="mb-4">NabTravel ra đời với mong muốn:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Đơn giản hóa việc lên kế hoạch du lịch</li>
          <li>Mang đến mức giá tốt thông qua việc so sánh và tối ưu dữ liệu</li>
          <li>Ứng dụng công nghệ và AI để cá nhân hóa trải nghiệm cho từng người dùng</li>
        </ul>
        <p className="font-medium text-[#004f32]">
          Chúng tôi tin rằng du lịch không nên phức tạp — và công nghệ chính là chìa khóa để giải quyết điều đó.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-6 flex items-center gap-2">
          🚀 NabTravel mang đến điều gì?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f0f8f5] p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-[#004f32] mb-3">
              🔎 Tìm kiếm & so sánh
            </h3>
            <p className="mb-2 text-base">Người dùng có thể nhanh chóng tìm kiếm:</p>
            <ul className="list-disc pl-5 space-y-1 text-base">
              <li>Khách sạn theo địa điểm, ngân sách</li>
              <li>Tour du lịch phù hợp lịch trình</li>
              <li>Các gợi ý hành trình tối ưu</li>
            </ul>
          </div>

          <div className="bg-[#f0f8f5] p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-[#004f32] mb-3">
              🧠 Gợi ý thông minh (AI)
            </h3>
            <p className="mb-2 text-base">Chúng tôi đang phát triển tính năng:</p>
            <ul className="list-disc pl-5 space-y-1 text-base">
              <li>Gợi ý lịch trình cá nhân hóa</li>
              <li>Đề xuất khách sạn phù hợp</li>
              <li>Tối ưu chi phí theo ngân sách</li>
            </ul>
          </div>

          <div className="bg-[#f0f8f5] p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-[#004f32] mb-3">
              💰 Tối ưu chi phí
            </h3>
            <p className="mb-2 text-base">NabTravel hướng tới:</p>
            <ul className="list-disc pl-5 space-y-1 text-base">
              <li>Hiển thị thông tin rõ ràng</li>
              <li>So sánh nhiều lựa chọn</li>
              <li>Giúp bạn ra quyết định tốt nhất</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4 flex items-center gap-2">
          🤝 Cam kết của chúng tôi
        </h2>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Thông tin rõ ràng, minh bạch</li>
          <li>Hợp tác với các đối tác uy tín</li>
          <li>Luôn đặt trải nghiệm người dùng làm trung tâm</li>
        </ul>
        <p className="text-gray-600 italic mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-base">
          Theo các phân tích thị trường, nhiều website du lịch mới thường có lượng truy cập thấp ở giai đoạn đầu và cần thời gian để xây dựng độ tin cậy. Vì vậy, NabTravel tập trung phát triển bền vững, cải thiện sản phẩm từng ngày để mang lại giá trị thực sự cho người dùng.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold text-[#004f32] mb-4 flex items-center gap-2">
            🏢 Thông tin công ty
          </h2>
          <ul className="space-y-3 text-base">
            <li><span className="font-semibold text-gray-900">Tên pháp lý:</span> CÔNG TY CỔ PHẦN Kolsup Limited</li>
            <li><span className="font-semibold text-gray-900">Mã số thuế:</span> 0110704552 (cấp ngày 04/05/2024)</li>
            <li><span className="font-semibold text-gray-900">Địa chỉ:</span><br /> 398 Kwun Tong Road, Kwun Tong, Hong Kong</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#004f32] mb-4 flex items-center gap-2">
            📞 Liên hệ
          </h2>
          <p className="mb-2">Nếu bạn cần hỗ trợ hoặc tư vấn hành trình:</p>
          <div className="inline-block bg-[#eef8f3] text-[#004f32] font-bold text-xl py-3 px-6 rounded-xl border border-green-100">
            Hotline: (+852) 5170 7620
          </div>
        </section>
      </div>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4 flex items-center gap-2">
          💡 Tầm nhìn
        </h2>
        <p>
          Trong tương lai, NabTravel hướng tới trở thành nền tảng du lịch ứng dụng AI hàng đầu tại Việt Nam, giúp người dùng không chỉ “đặt dịch vụ” mà còn trải nghiệm một cách thông minh hơn.
        </p>
      </section>

      <div className="mt-12 bg-[#004f32] text-white p-6 md:p-8 rounded-2xl text-center font-medium shadow-xl shadow-green-900/10 leading-relaxed">
        <span className="text-2xl block mb-2">👉</span>
        NabTravel không chỉ là một website du lịch — mà là công cụ giúp bạn khám phá thế giới theo cách dễ dàng và tối ưu nhất.
      </div>
    </div>
  );
}

function AboutEn() {
  return (
    <div className="space-y-10 text-gray-700 leading-relaxed text-lg">
      <section>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          About NabTravel
        </h1>
        <p className="mb-4">
          <strong>NabTravel</strong> is an online travel platform developed by <strong>Kolsup Limited</strong>, with the goal of helping users easily search, compare, and book travel services quickly, transparently, and cost-effectively.
        </p>
        <p>
          We focus on building a smart travel ecosystem where you can plan your entire trip in just a few minutes — from booking hotels and choosing tours to exploring detailed itineraries.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4 flex items-center gap-2">
          🌍 Our Mission
        </h2>
        <p className="mb-4">NabTravel was created with the mission to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Simplify travel planning</li>
          <li>Provide the best prices through data comparison and optimization</li>
          <li>Leverage technology and AI to personalize each user’s experience</li>
        </ul>
        <p className="font-medium text-[#004f32]">
          We believe travel shouldn’t be complicated — and technology is the key to making it easier.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-6 flex items-center gap-2">
          🚀 What NabTravel Offers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f0f8f5] p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-[#004f32] mb-3">
              🔎 Easy Search & Compare
            </h3>
            <p className="mb-2 text-base">Users can quickly find:</p>
            <ul className="list-disc pl-5 space-y-1 text-base">
              <li>Hotels based on location & budget</li>
              <li>Tours that match their schedule</li>
              <li>Optimized travel suggestions</li>
            </ul>
          </div>

          <div className="bg-[#f0f8f5] p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-[#004f32] mb-3">
              🧠 Smart AI Recommendations
            </h3>
            <p className="mb-2 text-base">We are developing features to:</p>
            <ul className="list-disc pl-5 space-y-1 text-base">
              <li>Suggest personalized itineraries</li>
              <li>Recommend tailored hotels</li>
              <li>Optimize budget options</li>
            </ul>
          </div>

          <div className="bg-[#f0f8f5] p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-[#004f32] mb-3">
              💰 Transparency & Savings
            </h3>
            <p className="mb-2 text-base">NabTravel is committed to:</p>
            <ul className="list-disc pl-5 space-y-1 text-base">
              <li>Clear and transparent info</li>
              <li>Comparing multiple options</li>
              <li>Helping you make best decisions</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4 flex items-center gap-2">
          🤝 Our Commitment
        </h2>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Transparent and reliable information</li>
          <li>Partnerships with trusted providers</li>
          <li>A user-first approach in everything we build</li>
        </ul>
        <p className="text-gray-600 italic mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-base">
          According to market observations, new travel websites often start with low traffic and need time to build trust. Therefore, NabTravel focuses on sustainable growth, continuously improving our product to deliver real value to users.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold text-[#004f32] mb-4 flex items-center gap-2">
            🏢 Company Information
          </h2>
          <ul className="space-y-3 text-base">
            <li><span className="font-semibold text-gray-900">Legal Name:</span> Kolsup Limited</li>
            <li><span className="font-semibold text-gray-900">Tax Code:</span> 0110704552 (May 4, 2024)</li>
            <li><span className="font-semibold text-gray-900">Address:</span><br /> 398 Kwun Tong Road, Kwun Tong, Hong Kong</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#004f32] mb-4 flex items-center gap-2">
            📞 Contact
          </h2>
          <p className="mb-2">If you need support or travel consultation:</p>
          <div className="inline-block bg-[#eef8f3] text-[#004f32] font-bold text-xl py-3 px-6 rounded-xl border border-green-100">
            Hotline: (+852) 5170 7620
          </div>
        </section>
      </div>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4 flex items-center gap-2">
          💡 Vision
        </h2>
        <p>
          In the future, NabTravel aims to become a leading AI-powered travel platform in Vietnam, helping users not only “book services” but also travel smarter.
        </p>
      </section>

      <div className="mt-12 bg-[#004f32] text-white p-6 md:p-8 rounded-2xl text-center font-medium shadow-xl shadow-green-900/10 leading-relaxed">
        <span className="text-2xl block mb-2">👉</span>
        NabTravel is not just a travel website — it’s a tool to help you explore the world in the easiest and most optimized way.
      </div>
    </div>
  );
}
