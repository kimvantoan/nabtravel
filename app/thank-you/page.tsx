"use client";

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../providers';

export default function ThankYouPage() {
  const { dict } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#f8f9fa] flex flex-col items-center justify-center py-10 px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm p-8 md:p-10 text-center flex flex-col items-center">
        <div className="mb-5 flex justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-[#10a36e] flex items-center justify-center text-[#10a36e]">
            <CheckCircle className="w-7 h-7" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-[#333] mb-2 leading-tight">
          {dict.thankYou.title}
        </h1>
        <p className="text-gray-600 text-[13px] md:text-[14px] mb-6">
          {dict.thankYou.subtitle}
        </p>

        <div className="mb-6 text-[13px] md:text-[14px] text-gray-700 leading-relaxed bg-[#f9fafb] p-4 rounded-lg w-full text-left">
          <p className="mb-2">
            <span className="text-red-500 font-bold">(*)</span> {dict.thankYou.spamNotice}
          </p>
          <p>
            {dict.thankYou.questionsNotice}{" "}
            <a href="mailto:sales@nabtravel.com" className="text-[#2074d5] font-semibold hover:underline mt-1 block md:inline-block">
              sales@nabtravel.com
            </a>
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex justify-center items-center px-8 py-3 bg-[#10a36e] hover:bg-[#0d8055] text-white font-bold rounded-full transition-colors w-full md:w-auto"
        >
          {dict.thankYou.backHome}
        </Link>
      </div>
    </div>
  );
}
