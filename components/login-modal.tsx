import { X, Mail } from "lucide-react";
import { Logo } from "./logo";
import { useEffect } from "react";
import { useLanguage } from "@/app/providers";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { dict } = useLanguage();
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-[440px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Top Section */}
        <div className="p-10 pt-12 pb-6">
          <div className="flex justify-start mb-6">
            <Logo iconOnly className="scale-125 origin-left" /> 
          </div>

          <h2 className="text-[28px] leading-[1.15] font-extrabold text-[#004f32] mb-10 text-left tracking-tight">
            {dict.modals.welcome}
          </h2>

          <div className="flex flex-col gap-4 relative">
            <button className="flex items-center justify-center w-full border-[1.5px] border-black rounded-full py-3.5 px-4 font-bold text-[15px] hover:bg-gray-50 transition-colors relative">
              <svg viewBox="0 0 24 24" className="w-5 h-5 absolute left-6">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {dict.modals.continueGoogle}
            </button>
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-10 pb-12 bg-white">
          <p className="text-[12px] text-gray-600 text-center leading-relaxed">
            {dict.modals.terms}
          </p>
          <div className="mt-4">
            <p className="text-[12px] text-gray-600 text-center leading-relaxed">
              This site is protected by reCAPTCHA and the Google <a href="#" className="underline hover:text-gray-900 font-medium">Privacy Policy</a> and <a href="#" className="underline hover:text-gray-900 font-medium">Terms of Service</a> apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
