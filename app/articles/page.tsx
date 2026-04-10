import { getDictionary } from "@/lib/i18n";
import { getCachedArticles } from "@/lib/data";
import { ArticlesClientView } from "@/components/articles-client-view";

export const revalidate = 3600; // Cache 1 giờ
export default async function ArticlesPage() {
  const dict = await getDictionary();

  // ISR: Cached data fetching to deduce DB pressure across components
  const articles = await getCachedArticles();

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Page Header Section - Server Rendered */}
      <div className="bg-gradient-to-b from-[#f5fae8]/60 to-white pt-24 pb-20 mb-12 md:mb-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 text-center max-w-4xl">
          <h1 className="text-3xl md:text-5xl lg:text-[56px] font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            {dict.articlesPage?.title || "Cẩm nang du lịch"}
          </h1>
          <p className="text-gray-600 text-[17px] md:text-xl font-medium leading-relaxed">
            {dict.articlesPage?.subtitle || "Khám phá thế giới qua những câu chuyện và bí kíp du lịch thú vị nhất do cộng đồng chia sẻ."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-[1140px]">
        {/* Client Interactive Section */}
        <ArticlesClientView articles={articles} />
      </div>
    </div>
  );
}
