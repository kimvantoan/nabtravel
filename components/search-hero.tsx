"use client";

import { useState } from "react";
import { Home, Bed, BookOpen, Search } from "lucide-react";


import { useLanguage } from "@/app/providers";

export function SearchHero() {
  const { dict } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");

  const TABS = [
    { id: "all", label: dict.searchHero.searchAll, icon: Home },
    { id: "hotels", label: dict.searchHero.hotels, icon: Bed },
    { id: "articles", label: dict.searchHero.articles, icon: BookOpen },
  ];

  return (
    <section className="w-full flex justify-center pt-10 md:pt-16 pb-10 md:pb-20 px-4">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-[2.25rem] sm:text-[3rem] md:text-[4rem] whitespace-nowrap font-extrabold text-[#004f32] tracking-tight mb-8">
          {dict.searchHero.whereTo}
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 pb-2 transition-colors relative font-semibold text-[15px]
                  ${isActive ? "text-gray-900" : "text-gray-600 hover:bg-gray-100 rounded-lg"}
                `}
              >
                <Icon strokeWidth={isActive ? 2.5 : 2} className="w-[1.125rem] h-[1.125rem]" />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900" />
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input Container */}
        <form action="/hotels" className="w-full relative flex items-center bg-white border border-gray-300 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow duration-200 p-1 md:p-[6px]">
          <div className="pl-3 md:pl-4 pr-1 md:pr-3 text-gray-700">
            <Search className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            name="q"
            autoFocus
            placeholder={dict.header.searchPlaceholder2}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] md:text-[17px] text-gray-900 font-medium placeholder:font-normal placeholder:text-gray-500 py-3 md:py-4"
          />
          <button type="submit" className="bg-[#34e065] text-black font-semibold text-[14px] md:text-base px-5 md:px-8 py-2.5 md:py-[14px] rounded-full hover:bg-[#2fc458] transition-colors ml-1 md:ml-2 whitespace-nowrap cursor-pointer shrink-0">
            {dict.header.searchButton}
          </button>
        </form>
      </div>
    </section>
  );
}
