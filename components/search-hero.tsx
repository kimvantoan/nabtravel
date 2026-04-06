"use client";

import { useState } from "react";
import { Home, Bed, BookOpen, Search } from "lucide-react";


import { useLanguage } from "@/app/providers";

export function SearchHero() {
  const { dict } = useLanguage();


  return (
    <section className="w-full flex justify-center pt-10 md:pt-16 pb-10 md:pb-20 px-4">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-[2.25rem] sm:text-[3rem] md:text-[4rem] whitespace-nowrap font-extrabold text-[#004f32] tracking-tight mb-8">
          {dict.searchHero.whereTo}
        </h1>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const q = formData.get('q') as string;
            if (q && q.trim()) {
              const createSlug = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              window.location.href = `/hotels?search=${createSlug(q)}`;
            } else {
              window.location.href = `/hotels`;
            }
          }}
          className="w-full relative bg-white border border-gray-300 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow duration-200"
        >
          <label className="flex items-center w-full p-1 md:p-[6px] cursor-text">
            <div className="pl-3 md:pl-4 pr-1 md:pr-3 text-gray-700">
              <Search className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              name="q"
              autoFocus
              placeholder={dict.header.searchPlaceholder2}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] md:text-[17px] text-gray-900 font-medium placeholder:font-normal placeholder:text-gray-500 py-3 md:py-4 cursor-text"
            />
            <button type="submit" className="bg-[#34e065] text-black font-semibold text-[14px] md:text-base px-5 md:px-8 py-2.5 md:py-[14px] rounded-full hover:bg-[#2fc458] transition-colors ml-1 md:ml-2 whitespace-nowrap cursor-pointer shrink-0">
              {dict.header.searchButton}
            </button>
          </label>
        </form>
      </div>
    </section>
  );
}
