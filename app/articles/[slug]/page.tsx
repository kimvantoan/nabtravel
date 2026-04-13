import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home, Clock } from "lucide-react";
import { getCachedArticleBySlug, getCachedArticles, getCachedAdminArticles } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/i18n";
import { ArticleCard } from "@/components/article-card";
import { notFound } from "next/navigation";
import { ArticleSidebar } from "@/components/article-sidebar";

export const revalidate = 3600;

// Dynamic SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedArticleBySlug(slug);
  
  if (!article) return { title: "Không tìm thấy bài viết" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: `${article.title} | NabTravel`,
      description: article.excerpt,
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ]
    }
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getCachedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Related articles logic isolated by author type
  const allAiArticles = await getCachedArticles();
  const allAdminArticles = await getCachedAdminArticles();
  
  const sourceArticles = article.is_ai_generated ? allAiArticles : allAdminArticles;
  const relatedArticles = sourceArticles.filter(a => String(a.id) !== String(article.id));

  const contentHTML = article.content || '<p>No content available.</p>';
  const locale = await getLocale();
  const dict = await getDictionary();

  let formattedDate = article.publishedAt;
  try {
    const d = new Date(article.publishedAt);
    if (!isNaN(d.getTime())) {
       formattedDate = d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch(e) {}

  if (article.is_ai_generated) {
    return (
      <div className="bg-white min-h-screen pb-0">
        
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 lg:px-6 pt-5 pb-6">
          <nav className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
            <Link href="/" className="hover:text-black transition-colors"><Home className="w-3.5 h-3.5" /></Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/articles" className="hover:text-black transition-colors">Cẩm nang</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 truncate max-w-[200px] md:max-w-md">{article.title}</span>
          </nav>
        </div>

        {/* Hero Header */}
        <div className="container mx-auto px-4 lg:px-6 mb-10 md:mb-12">
          <div className="max-w-4xl mx-auto text-center">

            <h1 className="text-[32px] md:text-[46px] lg:text-[56px] font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-8">
              {article.title}
            </h1>
            <div className="flex items-center justify-center gap-3 text-[14px] text-gray-500 font-medium font-sans">
              <span>{formattedDate}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                {article.readTime} phút đọc
              </span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="container mx-auto px-4 lg:px-6 mb-16 md:mb-24 max-w-5xl">
          <div className="relative w-full aspect-[4/3] md:aspect-[16/7] rounded-2xl md:rounded-[32px] overflow-hidden shadow-md">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </div>

        {/* Content Body - Manual Typography styling */}
        <main className="container mx-auto px-4 lg:px-6 mb-24 md:mb-32">
          <article className="max-w-[720px] mx-auto w-full text-gray-800
            [&_h2]:text-2xl [&_h2]:md:text-[32px] [&_h2]:mt-16 [&_h2]:mb-6 [&_h2]:font-extrabold [&_h2]:text-gray-900 [&_h2]:tracking-tight [&_h2]:leading-tight
            [&_p]:text-[17px] [&_p]:md:text-[20px] [&_p]:leading-[1.9] [&_p]:text-gray-700 [&_p]:mb-7
            [&_blockquote]:border-l-4 [&_blockquote]:border-[#004f32] [&_blockquote]:pl-6 [&_blockquote]:md:pl-8 [&_blockquote]:italic [&_blockquote]:text-[20px] [&_blockquote]:md:text-[24px] [&_blockquote]:text-green-950 [&_blockquote]:bg-green-50/50 [&_blockquote]:py-6 [&_blockquote]:pr-6 [&_blockquote]:rounded-r-2xl [&_blockquote]:my-12 [&_blockquote]:leading-relaxed
            [&_img]:rounded-2xl [&_img]:w-full [&_img]:my-12 [&_img]:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
            [&_figcaption]:text-center [&_figcaption]:text-[14px] [&_figcaption]:text-gray-500 [&_figcaption]:mt-4 [&_figcaption]:italic
            [&_p.lead]:text-[20px] [&_p.lead]:md:text-[23px] [&_p.lead]:leading-[1.8] [&_p.lead]:text-gray-600 [&_p.lead]:font-medium [&_p.lead]:mb-12
          ">
            <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
          </article>
        </main>

        {/* Related Articles Section */}
        <section className="bg-gray-50 py-20 border-t border-gray-100">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="mb-10 md:mb-14 flex justify-between items-end">
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Khám phá thêm
              </h3>
              <Link href="/articles" className="hidden md:flex items-center gap-1.5 text-[15px] font-bold text-[#004f32] hover:text-green-800 transition-colors cursor-pointer">
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
               {relatedArticles.slice(0, 3).map((relArticle) => (
                  <ArticleCard key={relArticle.id} article={relArticle} dict={dict} />
               ))}
            </div>
            
            <div className="mt-10 text-center md:hidden">
              <Link href="/articles" className="inline-block bg-white border border-gray-300 text-gray-900 font-bold px-8 py-3.5 rounded-full text-[15px] shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
                Xem tất cả bài viết
              </Link>
            </div>
          </div>
        </section>

      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-12">
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 xl:px-12 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-[12px] font-medium text-gray-500 uppercase tracking-widest">
          <Link href="/" className="hover:text-black transition-colors"><Home className="w-3.5 h-3.5" /></Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/articles" className="hover:text-black transition-colors">Cẩm nang</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 truncate max-w-[200px] md:max-w-md">{article.title}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 lg:px-8 xl:px-12 mt-8 md:mt-12">
        {/* Magazine-style Header */}
        <header className="max-w-5xl mb-8">
          <h1 className="text-[34px] md:text-[44px] lg:text-[56px] font-extrabold text-[#1a1a1a] leading-[1.05] tracking-tight mb-6">
            {article.title}
          </h1>
          <div className="text-[13px] text-gray-500 uppercase tracking-wide font-medium flex flex-wrap items-center gap-1.5">
            BY <span className="font-bold text-gray-900">ADMIN</span>
            <span className="mx-1 text-gray-300">—</span>
            <span>{formattedDate}</span>
            <span className="lowercase mx-1">in</span>
            <span className="font-bold text-[#004f32]">Travel & Guides</span>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
          {/* Left Column: Main Content */}
          <main className="flex-1 w-full max-w-4xl min-w-0">
            {/* Hero Image */}
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[16/8] overflow-hidden mb-10 shadow-sm border border-gray-100 bg-gray-50">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
            
            {/* Typography Content */}
            <article className="prose prose-lg md:prose-xl max-w-none text-gray-800
              [&_h2]:text-2xl [&_h2]:md:text-[32px] [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:font-extrabold [&_h2]:text-gray-900 [&_h2]:tracking-tight [&_h2]:leading-tight
              [&_p]:text-[18px] [&_p]:md:text-[20px] [&_p]:leading-[1.8] [&_p]:text-[#333] [&_p]:mb-6 [&_p]:font-serif [&_p]:break-words
              [&_blockquote]:border-l-4 [&_blockquote]:border-red-600 [&_blockquote]:pl-6 [&_blockquote]:md:pl-8 [&_blockquote]:italic [&_blockquote]:text-[22px] [&_blockquote]:md:text-[26px] [&_blockquote]:text-gray-900 [&_blockquote]:bg-gray-50 [&_blockquote]:py-6 [&_blockquote]:pr-6 [&_blockquote]:rounded-r-xl [&_blockquote]:my-10 [&_blockquote]:leading-relaxed [&_blockquote]:break-words
              [&_img]:rounded-xl [&_img]:w-full [&_img]:my-10 [&_img]:shadow-md
              [&_figcaption]:text-left [&_figcaption]:text-[13px] [&_figcaption]:text-gray-500 [&_figcaption]:mt-3
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ul]:space-y-2 [&_li]:text-[18px] [&_li]:md:text-[20px] [&_li]:font-serif [&_li]:text-[#333] [&_li]:break-words
            ">
              <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
            </article>

          </main>

          {/* Right Column: Sidebar */}
          <aside className="w-full lg:w-[320px] xl:w-[380px] shrink-0 lg:pt-0 pt-10 lg:border-l-0 border-t lg:border-t-0 border-gray-200 lg:pl-0">
            <ArticleSidebar articles={relatedArticles} />
          </aside>
        </div>
      </div>
    </div>
  );
}
