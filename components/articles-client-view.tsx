"use client";

import { useLanguage } from "@/app/providers";
import { ArticleCard, ArticleData } from "@/components/article-card";


export function ArticlesClientView({ articles }: { articles: ArticleData[] }) {
  const { dict } = useLanguage();

  const featuredArticle = articles[0];
  const gridArticles = articles.slice(1);

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
        
        {gridArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {gridArticles.map((article) => (
              <ArticleCard key={article.id} article={article} featured={false} dict={dict} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg font-medium">{dict.articlesPage?.empty || "Chưa có bài viết nào."}</p>
          </div>
        )}
        
        {/* Load More Button */}
        {gridArticles.length > 0 && (
           <div className="mt-14 mb-8 flex justify-center">
              <button className="bg-white border-2 border-black text-black font-extrabold rounded-full px-10 py-3.5 hover:bg-gray-50 transition-colors text-[15px] shadow-sm cursor-pointer">
                {dict.articlesPage?.loadMore || "Xem thêm bài viết"}
              </button>
           </div>
        )}
      </div>
    </>
  );
}
