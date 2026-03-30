"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/providers";
import { Globe, Search, MapPin, Sparkles, Menu, UserCircle } from "lucide-react";
import { Logo } from "./logo";
import { AiPlannerModal } from "./ai-planner-modal";
import { LoginModal } from "./login-modal";

export function SiteHeader() {
  const router = useRouter();
  const { dict, locale } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  const isHotelPage = pathname?.startsWith("/hotel");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [lang, setLang] = useState(locale.toUpperCase());

  const handleLanguageChange = (newLocal: string) => {
    setLang(newLocal.toUpperCase());
    document.cookie = `NEXT_LOCALE=${newLocal}; path=/; max-age=31536000`;
    router.refresh(); // Refresh the Server Components
  };

  useEffect(() => {
    const handleScroll = () => {
      // Show search bar after scrolling past 200px (approx height of hero title/tabs)
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showSearch = isHotelPage || isScrolled;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      
      {/* --- MOBILE HEADER (md:hidden) --- */}
      <div className="md:hidden flex h-16 items-center justify-between px-4 w-full relative">
        {/* Left Side: Menu + optional Logo Icon */}
        <div className="flex items-center gap-3">
          <button className="p-1 -ml-1 text-gray-900 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          {showSearch && (
            <Link href="/" className="shrink-0 scale-90 origin-left">
              <Logo iconOnly />
            </Link>
          )}
        </div>

        {/* Center: Search Bar OR absolute centered Full Logo */}
        {showSearch ? (
          <div className="flex-1 px-3">
            <form action="/search" method="GET" className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-[18px] w-[18px] text-gray-600" strokeWidth={2} />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder={dict.header.searchPlaceholder1}
                className="w-full pl-10 pr-4 py-2 bg-[#f2f2f2] rounded-full text-[15px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all border border-transparent shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
              />
            </form>
          </div>
        ) : (
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-90">
            <Logo />
          </Link>
        )}

        {/* Right Side: Profile & AI AI Button */}
        <div className="flex items-center gap-1 shrink-0">
          {/* We keep the AI button as an icon on mobile */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="p-1.5 text-green-700 bg-green-50 hover:bg-green-100 rounded-full transition-colors mr-1"
            title={dict.header.planWithAi}
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="p-1 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <UserCircle className="w-[28px] h-[28px] stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* --- DESKTOP HEADER (hidden md:flex) --- */}
      <div className="hidden md:flex container mx-auto px-4 lg:px-6 h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        {/* Center Search Bar for Desktop */}
        <div 
          className={`flex-1 max-w-2xl px-4 transition-all duration-300 ease-in-out ${
            showSearch 
              ? "opacity-100 translate-y-0 visible" 
              : "opacity-0 -translate-y-2 invisible"
          } hidden md:flex`}
        >
          <form action="/search" method="GET" className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" strokeWidth={2} />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder={dict.header.searchPlaceholder2}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-full text-[15px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all shadow-sm"
            />
            <button type="submit" className="absolute inset-y-1 right-1 bg-[#34e065] text-black font-semibold text-[15px] px-6 rounded-full hover:bg-[#2fc458] transition-colors">
              {dict.header.searchButton}
            </button>
          </form>
        </div>

        {/* Right Section for Desktop */}
        <div className="flex items-center gap-4 shrink-0 selection:bg-transparent">
          <nav className="flex items-center gap-6 pr-2">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 text-[15px] font-bold text-gray-900 hover:text-green-800 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {dict.header.planWithAi}
            </button>
            <Link
              href="/discover"
              className="text-[15px] font-bold text-gray-900 hover:text-green-800 transition-colors"
            >
              {dict.header.discover}
            </Link>
            <Link
              href="/reviews"
              className="text-[15px] font-bold text-gray-900 hover:text-green-800 transition-colors"
            >
              {dict.header.review}
            </Link>
          </nav>
          
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-[15px] font-bold text-gray-900 transition-colors px-3 py-2 rounded-full hover:bg-gray-100">
              <Globe className="w-5 h-5" />
              <span>{lang}</span>
              <span className="text-gray-300 ml-0.5">|</span>
              <span className="ml-0.5">VND</span>
            </button>
            <div className="absolute right-0 top-[90%] mt-1 w-36 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2">
              <button 
                onClick={() => handleLanguageChange("en")} 
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-[14px] font-bold flex justify-between items-center ${lang === 'EN' ? 'text-black' : 'text-gray-600'}`}
              >
                English {lang === "EN" && <span className="text-green-600 font-extrabold text-[12px]">✓</span>}
              </button>
              <button 
                onClick={() => handleLanguageChange("vi")} 
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-[14px] font-bold flex justify-between items-center ${lang === 'VI' ? 'text-black' : 'text-gray-600'}`}
              >
                Tiếng Việt {lang === "VI" && <span className="text-green-600 font-extrabold text-[12px]">✓</span>}
              </button>
            </div>
          </div>
          <Button 
            onClick={() => setIsLoginModalOpen(true)}
            className="rounded-full bg-green-950 text-white hover:bg-green-900 px-6 py-5 font-bold text-[15px]"
          >
            {dict.header.signIn}
          </Button>
        </div>
      </div>

      {/* Sub Navigation Bar for Hotel Page */}
      {isHotelPage && (
        <div className="border-t border-gray-200">
          <div className="container mx-auto px-4 lg:px-6 hidden md:flex items-center gap-8 overflow-x-auto">
            <Link
              href="#"
              className="flex items-center gap-1.5 text-black font-extrabold text-[15px] pb-3 pt-4 border-b-[3px] border-transparent hover:border-gray-900 transition-colors shrink-0"
            >
              <MapPin className="w-5 h-5 text-black" />
              Da Nang
            </Link>
            <Link
              href="#"
              className="text-green-900 font-extrabold text-[15px] pb-3 pt-4 border-b-[3px] border-green-900 shrink-0"
            >
              {dict.searchHero.hotels}
            </Link>
            <Link
              href="#"
              className="text-gray-800 font-extrabold text-[15px] pb-3 pt-4 border-b-[3px] border-transparent hover:border-gray-900 hover:text-black transition-colors shrink-0"
            >
              {dict.searchHero.thingsToDo}
            </Link>
            <Link
              href="#"
              className="text-gray-800 font-extrabold text-[15px] pb-3 pt-4 border-b-[3px] border-transparent hover:border-gray-900 hover:text-black transition-colors shrink-0"
            >
              {dict.searchHero.restaurants}
            </Link>
          </div>
        </div>
      )}

      {/* Ai Planner Modal */}
      <AiPlannerModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
}
