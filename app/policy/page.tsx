"use client";

import { useLanguage } from "@/app/providers";

export default function PolicyPage() {
  const { locale } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-12 lg:p-16">
        {locale === 'vi' ? <PolicyVi /> : <PolicyEn />}
      </div>
    </div>
  );
}

function PolicyVi() {
  return (
    <div className="space-y-10 text-gray-700 leading-relaxed text-lg">
      <section>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          Chính Sách Bảo Mật
        </h1>
        <p>
          NabTravel cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng khi truy cập và sử dụng website. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-6">1. Thông tin chúng tôi thu thập</h2>
        <p className="mb-4">Chúng tôi có thể thu thập các loại thông tin sau:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#f0f8f5] p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-[#004f32] mb-3">Thông tin cá nhân</h3>
            <ul className="list-disc pl-5 space-y-2 text-base">
              <li>Họ và tên</li>
              <li>Số điện thoại</li>
              <li>Email</li>
              <li>Thông tin đặt dịch vụ (nếu có)</li>
            </ul>
          </div>
          
          <div className="bg-[#f0f8f5] p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-[#004f32] mb-3">Thông tin kỹ thuật</h3>
            <ul className="list-disc pl-5 space-y-2 text-base">
              <li>Địa chỉ IP</li>
              <li>Loại trình duyệt</li>
              <li>Thiết bị truy cập</li>
              <li>Dữ liệu hành vi trên website (cookies, lịch sử truy cập)</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">2. Mục đích sử dụng thông tin</h2>
        <p className="mb-4">Thông tin của bạn được sử dụng để:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Cung cấp và cải thiện dịch vụ</li>
          <li>Xử lý yêu cầu, đặt dịch vụ</li>
          <li>Liên hệ hỗ trợ khách hàng</li>
          <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</li>
          <li>Phân tích và tối ưu trải nghiệm người dùng</li>
        </ul>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">3. Chia sẻ thông tin</h2>
        <p className="mb-4">NabTravel có thể chia sẻ thông tin trong các trường hợp:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Với đối tác cung cấp dịch vụ (khách sạn, công ty du lịch) để hoàn tất đặt dịch vụ</li>
          <li>Khi có yêu cầu từ cơ quan nhà nước có thẩm quyền</li>
          <li>Khi cần thiết để bảo vệ quyền lợi hợp pháp của chúng tôi</li>
        </ul>
        <p className="font-bold text-[#004f32] mt-4">
          Chúng tôi không bán hoặc trao đổi thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">4. Bảo mật thông tin</h2>
        <p className="mb-4">Chúng tôi áp dụng các biện pháp bảo mật phù hợp để:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Ngăn chặn truy cập trái phép</li>
          <li>Bảo vệ dữ liệu khỏi mất mát hoặc rò rỉ</li>
          <li>Đảm bảo an toàn trong quá trình truyền tải dữ liệu</li>
        </ul>
        <p className="italic text-gray-500">
          Tuy nhiên, không có hệ thống nào đảm bảo an toàn tuyệt đối trên Internet.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">5. Cookies và công nghệ theo dõi</h2>
        <p className="mb-4">Website sử dụng cookies để:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Ghi nhớ tùy chọn của người dùng</li>
          <li>Phân tích hành vi truy cập</li>
          <li>Cải thiện hiệu suất website</li>
        </ul>
        <p>
          Bạn có thể tắt cookies trong trình duyệt, tuy nhiên một số tính năng có thể bị hạn chế.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">6. Quyền của người dùng</h2>
        <p className="mb-4">Bạn có quyền:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân</li>
          <li>Từ chối nhận email marketing</li>
          <li>Yêu cầu hạn chế xử lý dữ liệu trong một số trường hợp</li>
        </ul>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">7. Lưu trữ dữ liệu</h2>
        <p>
          Thông tin cá nhân sẽ được lưu trữ trong thời gian cần thiết để phục vụ mục đích đã nêu, hoặc theo quy định của pháp luật.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">8. Thay đổi chính sách</h2>
        <p className="mb-4">Chúng tôi có thể cập nhật Chính Sách Bảo Mật bất cứ lúc nào.</p>
        <p>Phiên bản mới sẽ được đăng tải trên website và có hiệu lực ngay khi công bố.</p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">9. Liên hệ</h2>
        <p className="mb-4">Nếu bạn có câu hỏi về Chính Sách Bảo Mật, vui lòng liên hệ:</p>
        <div className="inline-block bg-[#eef8f3] text-[#004f32] font-bold text-xl py-3 px-6 rounded-xl border border-green-100">
          Hotline: (+852) 5170 7620
        </div>
      </section>

      <div className="mt-12 bg-[#f0f8f5] text-[#004f32] p-6 rounded-2xl text-center font-medium border border-green-100">
        Việc tiếp tục sử dụng NabTravel đồng nghĩa với việc bạn đã đọc, hiểu và đồng ý với Chính Sách Bảo Mật này.
      </div>
    </div>
  );
}

function PolicyEn() {
  return (
    <div className="space-y-10 text-gray-700 leading-relaxed text-lg">
      <section>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          Privacy Policy
        </h1>
        <p>
          NabTravel is committed to protecting your privacy and personal information when you access and use our website. This Privacy Policy explains how we collect, use, and safeguard your data.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-6">1. Information We Collect</h2>
        <p className="mb-4">We may collect the following types of information:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#f0f8f5] p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-[#004f32] mb-3">Personal Information</h3>
            <ul className="list-disc pl-5 space-y-2 text-base">
              <li>Full name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Booking-related information (if applicable)</li>
            </ul>
          </div>
          
          <div className="bg-[#f0f8f5] p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-[#004f32] mb-3">Technical Information</h3>
            <ul className="list-disc pl-5 space-y-2 text-base">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Website usage data (cookies, browsing behavior)</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">Your information may be used to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Provide and improve our services</li>
          <li>Process requests and bookings</li>
          <li>Offer customer support</li>
          <li>Send promotional information (if you consent)</li>
          <li>Analyze and optimize user experience</li>
        </ul>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">3. Information Sharing</h2>
        <p className="mb-4">NabTravel may share your information in the following cases:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>With service providers (hotels, tour operators) to complete bookings</li>
          <li>When required by competent authorities under applicable laws</li>
          <li>When necessary to protect our legal rights and interests</li>
        </ul>
        <p className="font-bold text-[#004f32] mt-4">
          We do not sell or trade your personal information to third parties for commercial purposes.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">4. Data Security</h2>
        <p className="mb-4">We implement appropriate security measures to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Prevent unauthorized access</li>
          <li>Protect data from loss or leakage</li>
          <li>Ensure secure data transmission</li>
        </ul>
        <p className="italic text-gray-500">
          However, no system can guarantee absolute security over the Internet.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">5. Cookies and Tracking Technologies</h2>
        <p className="mb-4">Our website uses cookies to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Remember user preferences</li>
          <li>Analyze browsing behavior</li>
          <li>Improve website performance</li>
        </ul>
        <p>
          You can disable cookies in your browser settings, but some features may not function properly.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">6. Your Rights</h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Request access to, correction, or deletion of your personal data</li>
          <li>Opt out of receiving marketing communications</li>
          <li>Request restriction of data processing in certain cases</li>
        </ul>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">7. Data Retention</h2>
        <p>
          Your personal information will be stored only for as long as necessary to fulfill the purposes outlined in this policy or as required by law.
        </p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">8. Changes to This Policy</h2>
        <p className="mb-4">We may update this Privacy Policy at any time.</p>
        <p>The updated version will take effect immediately upon publication on the website.</p>
      </section>

      <div className="border-t border-gray-100"></div>

      <section>
        <h2 className="text-2xl font-bold text-[#004f32] mb-4">9. Contact</h2>
        <p className="mb-4">If you have any questions regarding this Privacy Policy, please contact us:</p>
        <div className="inline-block bg-[#eef8f3] text-[#004f32] font-bold text-xl py-3 px-6 rounded-xl border border-green-100">
          Hotline: (+852) 5170 7620
        </div>
      </section>

      <div className="mt-12 bg-[#f0f8f5] text-[#004f32] p-6 rounded-2xl text-center font-medium border border-green-100">
        By continuing to use NabTravel, you confirm that you have read, understood, and agreed to this Privacy Policy.
      </div>
    </div>
  );
}
