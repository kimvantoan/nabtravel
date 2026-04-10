"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/app/providers";
import { ArticleCard, ArticleData } from "@/components/article-card";

function SkeletonArticleCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl md:rounded-[24px] shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="relative w-full aspect-[4/3] md:aspect-[3/2] bg-gray-200"></div>
      <div className="flex flex-col p-4 md:p-6 w-full">
        <div className="h-5 bg-gray-200 rounded-md w-1/3 mb-4"></div>
        <div className="h-7 bg-gray-200 rounded-md w-full mb-2"></div>
        <div className="h-7 bg-gray-200 rounded-md w-5/6 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded-md w-2/3 mt-3"></div>
      </div>
    </div>
  );
}

export function ArticlesClientView({ articles }: { articles: ArticleData[] }) {
  const { dict } = useLanguage();

  const featuredArticle = articles[0];
  const allGridArticles = articles.slice(1);

  const [displayCount, setDisplayCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const loaderRef = useRef<HTMLDivElement>(null);
  const hasMore = displayCount < allGridArticles.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          // Mô phỏng độ trễ tải để hiển thị rõ Skeleton chuyên nghiệp
          setTimeout(() => {
            setDisplayCount((prev) => prev + 12);
            setIsLoadingMore(false);
          }, 800);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  const gridArticles = allGridArticles.slice(0, displayCount);

  return (
    <>
      {/* Featured Article Section */}
      {featuredArticle && (
        <div className="mb-16 xl:mb-24">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-[#004f32] rounded-full inline-block"></span>
            {dict.articlesPage?.featured || "Bài viết nổi bật"}
          </h2>
          <ArticleCard article={featuredArticle} featured={true} dict={dict} />
        </div>
      )}

      {/* Article Grid Section */}
      <div>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
           <span className="w-2 h-8 bg-[#004f32] rounded-full inline-block"></span>
           {dict.articlesPage?.latest || "Mới nhất"}
        </h2>
        
        {allGridArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {gridArticles.map((article) => (
              <ArticleCard key={article.id} article={article} featured={false} dict={dict} />
            ))}
            
            {/* Hiển thị Skeleton khi đang tải */}
            {isLoadingMore && (
              <>
                <SkeletonArticleCard />
                <SkeletonArticleCard />
                <SkeletonArticleCard />
              </>
            )}
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg font-medium">{dict.articlesPage?.empty || "Chưa có bài viết nào."}</p>
          </div>
        )}
        
        {/* Infinite Scroll intersection target */}
        {hasMore && (
           <div ref={loaderRef} className="h-10 mt-8 w-full border-t border-transparent cursor-default"></div>
        )}
      </div>
    </>
  );
}
