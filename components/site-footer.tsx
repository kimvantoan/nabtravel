"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Logo } from "./logo";
import { useLanguage } from "@/app/providers";

export function SiteFooter() {
  const { dict } = useLanguage();
  return (
    <footer className="bg-[#faf1ed] py-12 px-4 md:px-6 lg:px-8 text-sm text-gray-700">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {dict.footer.sections.map((section: any, idx: number) => (
            <div key={idx}>
              <h4 className="font-semibold text-gray-900 mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((linkStr: string, linkIdx: number) => (
                  <li key={linkIdx}>
                    <Link
                      href="#"
                      className="hover:underline underline-offset-4 hover:text-black transition-colors"
                    >
                      {linkStr}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-8 border-t border-gray-300">
          <div className="flex flex-col items-start gap-4">
            {/* Logo */}
            <Logo />
            
            <div className="text-xs space-y-2 max-w-2xl">
              <p>{dict.footer.copyright}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 font-medium text-gray-900">
                <Link href="#" className="hover:underline">{dict.footer.terms}</Link>
                <Link href="#" className="hover:underline">{dict.footer.privacy}</Link>
                <Link href="#" className="hover:underline">{dict.footer.cookieConsent}</Link>
                <Link href="#" className="hover:underline">{dict.footer.howItWorks}</Link>
                <Link href="#" className="hover:underline">{dict.footer.contact}</Link>
                <Link href="#" className="hover:underline">{dict.footer.accessibility}</Link>
              </div>
              <p className="text-gray-500 mt-4 leading-relaxed">
                {dict.footer.regionalDisclaimer}
                <button className="font-semibold text-black ml-1 hover:underline">{dict.footer.readMore} <ChevronDown className="inline w-3 h-3" /></button>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-end">
            <div className="flex gap-4">
              <button className="flex items-center gap-4 border border-black rounded-xl px-4 py-2 bg-white font-semibold hover:bg-gray-50 transition-colors">
                <span className="font-bold">₫</span> VND <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-4 border border-black rounded-xl px-4 py-2 bg-white font-semibold hover:bg-gray-50 transition-colors">
                {dict.footer.country} <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Link href="#" className="hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </Link>
              <Link href="#" className="hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
              </Link>
              <Link href="#" className="hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </Link>
              <Link href="#" className="hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </Link>
              <Link href="#" className="hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
