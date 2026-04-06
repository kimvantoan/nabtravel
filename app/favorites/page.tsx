"use client";

import { useLanguage } from "@/app/providers";
import { useFavorites, FavoriteItem } from "@/hooks/use-favorites";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Building2, Newspaper, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function FavoritesPage() {
  const { dict, locale } = useLanguage();
  const { data: session, status } = useSession();
  const { favorites, toggleFavorite, isClient } = useFavorites();
  const [filter, setFilter] = useState<'all' | 'hotel' | 'article'>('all');

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google");
    }
  }, [status]);

  if (status === "loading" || !isClient) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#00aa6c] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (status === "unauthenticated") {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  const filteredFavorites = favorites.filter(f => filter === 'all' || f.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-10 pb-10 px-6 mb-8">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight flex items-center gap-3">
            <Heart className="w-8 h-8 md:w-10 md:h-10 fill-red-500 text-red-500" />
            {locale === 'vi' ? 'Bộ Sưu Tập Của Tôi' : 'My Collection'}
          </h1>
          <p className="text-gray-500 text-lg font-medium">
            {locale === 'vi' 
              ? 'Khách sạn và bài viết yêu thích của bạn, được lưu trữ an toàn.'
              : 'Your favorite hotels and articles, stored securely.'}
          </p>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full font-bold text-[13px] md:text-sm whitespace-nowrap transition-all ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {locale === 'vi' ? 'Tất cả' : 'All'}
            </button>
            <button 
              onClick={() => setFilter('hotel')}
              className={`px-4 py-2 rounded-full font-bold text-[13px] md:text-sm whitespace-nowrap flex items-center gap-1.5 transition-all ${filter === 'hotel' ? 'bg-[#004f32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Building2 className="w-4 h-4" /> {locale === 'vi' ? 'Khách sạn' : 'Hotels'}
            </button>
            <button 
              onClick={() => setFilter('article')}
              className={`px-4 py-2 rounded-full font-bold text-[13px] md:text-sm whitespace-nowrap flex items-center gap-1.5 transition-all ${filter === 'article' ? 'bg-[#004f32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Newspaper className="w-4 h-4" /> {locale === 'vi' ? 'Bài viết' : 'Articles'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 md:p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
             </div>
             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
               {locale === 'vi' ? 'Chưa có mục nào ở đây' : 'Nothing here yet'}
             </h3>
             <p className="text-gray-500 mb-8 max-w-md text-sm md:text-base">
               {locale === 'vi' 
                 ? 'Khám phá các khách sạn và bài viết hấp dẫn, thả tim để lưu chúng vào bộ sưu tập cá nhân của bạn.'
                 : 'Explore amazing hotels and articles, and tap the heart icon to save them to your personal collection.'}
             </p>
             <Link href="/" className="bg-[#00aa6c] text-white font-bold py-3 md:py-3.5 px-6 md:px-8 rounded-full hover:bg-[#008f5a] transition-colors inline-block text-sm md:text-base">
               {locale === 'vi' ? 'Bắt đầu khám phá' : 'Start Exploring'}
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredFavorites.map((item) => (
              <div key={item.id + item.type} className="group flex flex-col bg-white rounded-2xl md:rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-lg transition-all h-full relative cursor-pointer">
                <Link href={item.url} className="relative aspect-[4/3] overflow-hidden block">
                  <Image 
                    src={item.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-[4px] md:rounded-md text-gray-800 shadow-sm flex items-center gap-1 uppercase tracking-wider">
                     {item.type === 'hotel' ? <Building2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Newspaper className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                     <span className="hidden sm:inline">{item.type === 'hotel' ? (locale === 'vi' ? 'Khách sạn' : 'Hotel') : (locale === 'vi' ? 'Bài viết' : 'Article')}</span>
                  </div>
                </Link>

                {/* Unfavorite Button */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item); }}
                  className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-white rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform z-10"
                >
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                </button>

                <Link href={item.url} className="p-3 md:p-5 flex flex-col flex-1">
                  <h4 className="font-extrabold text-gray-900 text-[13px] md:text-lg line-clamp-2 mb-2 md:mb-3 leading-snug group-hover:text-[#004f32] transition-colors">{item.title}</h4>
                  <div className="mt-auto flex items-center font-bold text-[12px] md:text-sm text-[#00aa6c] group-hover:translate-x-1 transition-transform">
                    {locale === 'vi' ? 'Xem chi tiết' : 'View Details'} <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
