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
                {section.links.map((linkStr: string, linkIdx: number) => {
                  let href = "#";
                  const lower = linkStr.toLowerCase();
                  if (lower.includes("về chúng tôi") || lower.includes("about")) href = "/about";
                  else if (lower.includes("liên hệ") || lower.includes("contact")) href = "/contact";
                  else if (lower.includes("chính sách") || lower.includes("policy")) href = "/policy";
                  else if (lower.includes("điều khoản") || lower.includes("terms")) href = "/terms";

                  return (
                    <li key={linkIdx}>
                      <Link
                        href={href}
                        className="hover:underline underline-offset-4 hover:text-black transition-colors"
                      >
                        {linkStr}
                      </Link>
                    </li>
                  );
                })}
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
                <Link href="/terms" className="hover:underline">{dict.footer.terms}</Link>
                <Link href="/policy" className="hover:underline">{dict.footer.privacy}</Link>
                <Link href="#" className="hover:underline">{dict.footer.cookieConsent}</Link>
                <Link href="/about" className="hover:underline">{dict.footer.howItWorks}</Link>
                <Link href="/contact" className="hover:underline">{dict.footer.contact}</Link>
                <Link href="#" className="hover:underline">{dict.footer.accessibility}</Link>
              </div>
              <p className="text-gray-500 mt-4 leading-relaxed">
                {dict.footer.regionalDisclaimer}
                <button className="font-semibold text-black ml-1 hover:underline">{dict.footer.readMore} <ChevronDown className="inline w-3 h-3" /></button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
