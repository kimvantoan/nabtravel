"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/providers";
import { Globe, Search, Sparkles, Menu, UserCircle } from "lucide-react";
import { Logo } from "./logo";
import { AiPlannerModal } from "./ai-planner-modal";
import { LoginModal } from "./login-modal";

export function SiteHeader() {
  const router = useRouter();
  const { dict, locale } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || searchParams?.get("search") || "";
  const isHotelPage = pathname?.startsWith("/hotel");
  const isDestinationPage = pathname?.startsWith("/destination");
  const isArticlePage = pathname?.startsWith("/article");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState(locale.toUpperCase());
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocal: string) => {
    setLang(newLocal.toUpperCase());
    document.cookie = `NEXT_LOCALE=${newLocal}; path=/; max-age=31536000`;
    startTransition(() => {
      router.refresh(); // Refresh the Server Components smoothly
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showSearch = isHotelPage || isDestinationPage || isArticlePage || isScrolled;

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-[9999] bg-white/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4 bg-white/80 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/50 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
              <Globe className="w-5 h-5 text-green-600 absolute animate-pulse" />
            </div>
            <p className="text-[15px] font-bold text-gray-800 tracking-tight">
              {lang === 'VI' ? 'Đang chuyển ngôn ngữ...' : 'Changing language...'}
            </p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">

        {/* --- MOBILE HEADER (md:hidden) --- */}
        <div className="md:hidden flex h-16 items-center justify-between px-4 w-full relative">
          {/* Left Side: Menu + optional Logo Icon */}
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 -ml-1 text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
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
              <form action="/hotels" method="GET" className="relative w-full">
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
              className="p-1.5 text-green-700 bg-green-50 hover:bg-green-100 rounded-full transition-colors mr-1 cursor-pointer"
              title={dict.header.planWithAi}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="p-1 text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
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
            className={`flex-1 max-w-2xl px-4 transition-all duration-300 ease-in-out ${showSearch
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-2 invisible"
              } hidden md:flex`}
          >
            <form action="/hotels" method="GET" className="relative w-full">
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
                className="flex items-center gap-2 text-[15px] font-bold text-gray-900 hover:text-green-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {dict.header.planWithAi}
              </button>
              <Link
                href="/hotels"
                className="text-[15px] font-bold text-gray-900 hover:text-green-800 transition-colors"
              >
                {dict.header.hotels}
              </Link>
              <Link
                href="/articles"
                className="text-[15px] font-bold text-gray-900 hover:text-green-800 transition-colors"
              >
                {dict.header.articles}
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
              className="rounded-full bg-green-950 text-white hover:bg-green-900 px-6 py-5 font-bold text-[15px] cursor-pointer"
            >
              {dict.header.signIn}
            </Button>
          </div>
        </div>



        {/* --- MOBILE FULLSCREEN MENU --- */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col md:hidden animate-in slide-in-from-left-4 duration-200">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Logo />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
              <nav className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAiModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-[17px] font-bold text-gray-900"
                >
                  <Sparkles className="w-5 h-5 text-green-700" />
                  {dict.header.planWithAi}
                </button>
                <Link
                  href="/hotels"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[17px] font-bold text-gray-900"
                >
                  {dict.header.hotels}
                </Link>
                <Link
                  href="/articles"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[17px] font-bold text-gray-900"
                >
                  {dict.header.articles}
                </Link>
              </nav>
              <div className="h-px bg-gray-100 w-full my-2" />
              <div className="flex flex-col gap-6">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full text-left text-[17px] font-bold text-gray-900"
                >
                  {dict.header.signIn}
                </button>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-gray-900 mb-1">
                    <Globe className="w-5 h-5" />
                    <span>Ngôn ngữ / Language</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleLanguageChange("en");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex-1 py-2.5 text-center rounded-xl border ${lang === "EN" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"} font-bold text-[15px] transition-colors`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        handleLanguageChange("vi");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex-1 py-2.5 text-center rounded-xl border ${lang === "VI" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"} font-bold text-[15px] transition-colors`}
                    >
                      Tiếng Việt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ai Planner Modal */}
        <AiPlannerModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

        {/* Login Modal */}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </header>
    </>
  );
}
