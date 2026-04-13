"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

import { useFavorites } from "@/hooks/use-favorites";

export interface ArticleData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  categoryKey: string;
  content?: string;
  publishedAt: string;
  readTime: number;
  is_ai_generated?: boolean;
}

interface ArticleCardProps {
  article: ArticleData;
  featured?: boolean;
  dict?: any; // To pass dictionary for translations
}

export function ArticleCard({ article, featured = false, dict }: ArticleCardProps) {
  const readTimeLabel = dict?.articlesPage?.minRead || "phút đọc";
  const { toggleFavorite, isFavorite, isClient } = useFavorites();
  const isLiked = isClient ? isFavorite(article.slug, 'article') : false;

  let formattedDate = article.publishedAt;
  try {
    const d = new Date(article.publishedAt);
    if (!isNaN(d.getTime())) {
      const isVi = dict?.header?.hotels === "Khách sạn";
      const locale = isVi ? "vi-VN" : "en-US";
      formattedDate = d.toLocaleDateString(locale, { month: 'short', day: '2-digit', year: 'numeric' });
    }
  } catch(e) {}

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    toggleFavorite({
      id: article.slug,
      type: 'article',
      title: article.title,
      image: article.image,
      url: `/article/${article.slug}`
    });
  };

  const HeartButton = ({ className }: { className: string }) => (
    <button
      onClick={handleFavorite}
      className={`absolute z-20 p-1.5 md:p-2.5 rounded-full bg-black/20 hover:bg-white backdrop-blur-sm transition-all duration-300 shadow-sm group/btn cursor-pointer ${className}`}
      aria-label="Save to favorites"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={isLiked ? 0 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-[18px] h-[18px] md:w-[22px] md:h-[22px] transition-colors duration-300 ${isLiked ? "text-red-500" : "text-white group-hover/btn:text-gray-900"}`}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );

  if (featured) {
    return (
      <Link href={`/articles/${article.slug}`} className="group relative block w-full h-[400px] md:h-[500px] lg:h-[550px] rounded-2xl overflow-hidden shadow-md">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <HeartButton className="top-4 right-4" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col justify-end h-full">

          <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 leading-tight line-clamp-3">
            {article.title}
          </h2>
          <p className="text-gray-300 text-[15px] md:text-lg line-clamp-2 md:line-clamp-3 mb-6 max-w-3xl">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 md:gap-4 text-gray-300 text-[13px] md:text-sm font-medium">
            <span>{formattedDate}</span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {article.readTime} {readTimeLabel}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group flex flex-col h-full cursor-pointer relative">
      <Link href={`/articles/${article.slug}`} className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[3/2] mb-4 xl:mb-5 block shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <HeartButton className="top-3 right-3" />
      </Link>
      
      <div className="flex flex-col flex-1 px-1">
        <div className="flex items-center gap-2.5 text-gray-500 text-[13px] font-medium mb-2.5">
          <span>{formattedDate}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {article.readTime} {readTimeLabel}
          </span>
        </div>
        
        <Link href={`/articles/${article.slug}`} className="block">
          <h3 className="text-[19px] xl:text-[21px] font-extrabold text-gray-900 leading-snug mb-2 group-hover:text-[#004f32] transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-[15px] leading-relaxed line-clamp-3 mb-5 flex-1">
            {article.excerpt}
        </p>
        
        <div className="flex items-center justify-end mt-auto">
          <Link href={`/articles/${article.slug}`} className="text-[#004f32] font-bold text-[14px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            {dict?.articlesPage?.readMore || "Đọc tiếp"}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
