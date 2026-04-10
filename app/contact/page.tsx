"use client";

import { useLanguage } from "@/app/providers";
import { Mail, MapPin, Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function ContactPage() {
  const { dict, locale } = useLanguage();

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({ type: "error", text: locale === "vi" ? "Vui lòng điền đầy đủ thông tin." : "Please fill out all fields." });
      return;
    }
    
    setSubmitStatus(null);
    setShowCaptcha(true);
  };

  const onCaptchaChange = async (token: string | null) => {
    if (!token) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const payload = { ...formData, recaptcha_token: token };
      
      const res = await fetch(`${backendUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitStatus({ type: "success", text: locale === "vi" ? "Gửi tin nhắn liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất." : "Message sent successfully! We will contact you soon." });
        setFormData({ name: "", email: "", message: "" });
        setShowCaptcha(false);
      } else {
        setSubmitStatus({ type: "error", text: data.message || (locale === "vi" ? "Có lỗi xảy ra, vui lòng thử lại." : "An error occurred, please try again.") });
        setShowCaptcha(false);
        recaptchaRef.current?.reset();
      }
    } catch (err) {
      setSubmitStatus({ type: "error", text: locale === "vi" ? "Không thể kết nối đến máy chủ." : "Could not connect to server." });
      setShowCaptcha(false);
      recaptchaRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-6 md:p-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#004f32] mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
          {locale === "vi" ? "Liên Hệ" : "Contact Us"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === "vi" ? "Thông Tin Liên Hệ" : "Get In Touch"}
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-gray-700">
                <div className="w-12 h-12 bg-[#e6f4ef] rounded-full flex items-center justify-center text-[#00aa6c] shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">{locale === "vi" ? "Địa chỉ" : "Address"}</div>
                  <div>Số 12-BT 11 Khu đô thị Mới Vân Canh, Xã Sơn Đồng, TP Hà Nội</div>
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
                  <div className="font-bold">{locale === "vi" ? "Điện thoại" : "Phone"}</div>
                  <div>098 2838 383</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 flex flex-col justify-center">
            {submitStatus?.type === 'success' ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
                  {locale === 'vi' ? 'Gửi Thành Công!' : 'Sent Successfully!'}
                </h3>
                <p className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed font-medium mb-8">
                  {submitStatus.text}
                </p>
                <button
                  onClick={() => {
                    setSubmitStatus(null);
                    setShowCaptcha(false);
                  }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {locale === 'vi' ? 'Gửi tin nhắn khác' : 'Send another message'}
                </button>
              </div>
            ) : (
              <form className="space-y-4 w-full" onSubmit={handleInitialSubmit}>
                
                {submitStatus && submitStatus.type === 'error' && (
                  <div className="p-4 rounded-xl flex gap-3 text-[14px] font-medium bg-red-50 text-red-800 border border-red-200 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{submitStatus.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{locale === "vi" ? "Họ tên" : "Name"}</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if(showCaptcha) setShowCaptcha(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00aa6c] focus:ring-1 focus:ring-[#00aa6c] outline-none transition-all disabled:bg-gray-100" 
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if(showCaptcha) setShowCaptcha(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00aa6c] focus:ring-1 focus:ring-[#00aa6c] outline-none transition-all disabled:bg-gray-100" 
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{locale === "vi" ? "Tin nhắn" : "Message"}</label>
                  <textarea 
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if(showCaptcha) setShowCaptcha(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#00aa6c] focus:ring-1 focus:ring-[#00aa6c] outline-none transition-all disabled:bg-gray-100 resize-none"
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                
                {showCaptcha ? (
                  <div className="flex flex-col items-center justify-center min-h-[78px] mt-4 animate-in fade-in slide-in-from-bottom-2">
                    {isSubmitting ? (
                      <div className="flex items-center gap-3 font-bold text-[#00aa6c] animate-pulse">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        {locale === "vi" ? "Đang gửi lời nhắn..." : "Sending message..."}
                      </div>
                    ) : (
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                        onChange={onCaptchaChange}
                        hl={locale === 'vi' ? 'vi' : 'en'}
                      />
                    )}
                  </div>
                ) : (
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-[#00aa6c] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#008f5a] focus:ring-4 focus:ring-green-500/20 transition-all mt-6 cursor-pointer"
                  >
                    {locale === "vi" ? "Gửi Lời Nhắn" : "Send Message"}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
