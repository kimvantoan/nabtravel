"use client";

import { useState } from "react";
import { useLanguage } from "@/app/providers";
import { ArticleCard, ArticleData } from "@/components/article-card";

const CATEGORIES = [
  { id: "all", labelKey: "all" },
  { id: "reviews", labelKey: "reviews" },
  { id: "resorts", labelKey: "resorts" },
  { id: "tips", labelKey: "tips" },
  { id: "offers", labelKey: "offers" },
];

export function ArticlesClientView({ articles }: { articles: ArticleData[] }) {
  const { dict } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");

  const featuredArticle = articles[0];
  const gridArticles = activeTab === "all" 
    ? articles.slice(1) 
    : articles.filter(a => a.categoryKey === activeTab);

  return (
    <>
      {/* Category Tabs */}
      <div className="flex border-b border-gray-200 mb-10 overflow-x-auto scrollbar-hide pb-0">
        <div className="flex gap-8 px-1 min-w-max">
          {CATEGORIES.map((tab) => {
            const isActive = activeTab === tab.id;
            const categoriesDict = dict?.articlesPage?.categories as Record<string, string>;
            const label = categoriesDict?.[tab.labelKey] || tab.labelKey;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 text-[15px] md:text-base font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  isActive ? "text-[#004f32]" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#004f32] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Article Section */}
      {activeTab === "all" && featuredArticle && (
        <div className="mb-12 xl:mb-16">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#004f32] rounded-full inline-block"></span>
            {dict.articlesPage?.featured || "Bài viết nổi bật"}
          </h2>
          <ArticleCard article={featuredArticle} featured={true} dict={dict} />
        </div>
      )}

      {/* Article Grid Section */}
      <div>
        {activeTab === "all" && (
           <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-[#004f32] rounded-full inline-block"></span>
             {dict.articlesPage?.latest || "Mới nhất"}
           </h2>
        )}
        
        {gridArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {gridArticles.map((article) => (
              <ArticleCard key={article.id} article={article} featured={false} dict={dict} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg font-medium">Chưa có bài viết nào trong chuyên mục này.</p>
          </div>
        )}
        
        {/* Load More Button */}
        {gridArticles.length > 0 && (
           <div className="mt-14 mb-8 flex justify-center">
              <button className="bg-white border-2 border-black text-black font-extrabold rounded-full px-10 py-3.5 hover:bg-gray-50 transition-colors text-[15px] shadow-sm cursor-pointer">
                Xem thêm bài viết
              </button>
           </div>
        )}
      </div>
    </>
  );
}
