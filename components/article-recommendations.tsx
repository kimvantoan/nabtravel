"use client";

import { useLanguage } from "@/app/providers";
import { ArticleData, ArticleCard } from "@/components/article-card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ArticleRecommendationsProps {
  articles: ArticleData[];
}

export function ArticleRecommendations({ articles }: ArticleRecommendationsProps) {
  const { dict } = useLanguage();

  if (!articles || articles.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 mt-4 border-t border-gray-200">
      <div className="flex justify-between items-end mb-8 md:mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {dict.home.inspiration || "Cẩm nang du lịch"}
          </h2>
        </div>
        <Link href="/articles" className="hidden md:flex items-center gap-1.5 text-[15px] font-bold text-[#004f32] hover:text-green-800 transition-colors cursor-pointer">
          {dict.hotelDetail?.seeAll || "Xem tất cả"} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} dict={dict} />
        ))}
      </div>
      
      <div className="mt-10 text-center md:hidden">
        <Link href="/articles" className="inline-block flex justify-center bg-gray-50 border border-gray-200 text-gray-900 font-bold px-8 py-3.5 rounded-2xl text-[15px] shadow-sm hover:bg-gray-100 transition-colors cursor-pointer w-full">
          {dict.hotelDetail?.seeAll || "Xem tất cả bài viết"}
        </Link>
      </div>
    </section>
  );
}
