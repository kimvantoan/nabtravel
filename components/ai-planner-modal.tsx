import { X, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useLanguage } from "@/app/providers";

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiPlannerModal({ isOpen, onClose }: AiPlannerModalProps) {
  const { dict } = useLanguage();
  // Prevent scrolling when modal is open
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
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal/Drawer Panel */}
      <div className="fixed inset-0 md:inset-y-0 md:inset-x-auto md:right-0 z-[101] w-full md:w-[450px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right-full md:slide-in-from-right-auto slide-in-from-bottom-full md:slide-in-from-bottom-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            {dict.modals.planWithAiTitle}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold mb-3">{dict.modals.planWithAiTitle}</h3>
          <p className="text-gray-600 mb-8 max-w-sm">
            {dict.modals.planWithAiDesc}
          </p>
          
          <div className="w-full">
            <textarea 
              className="w-full h-36 p-4 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-[15px] shadow-sm"
              placeholder={dict.modals.whereToPlaceholder}
            ></textarea>
            <button className="w-full mt-6 bg-green-950 text-white font-bold py-4 rounded-xl hover:bg-green-900 transition-colors shadow-md">
              {dict.modals.generate}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
