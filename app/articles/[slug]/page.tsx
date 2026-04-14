import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home, Clock } from "lucide-react";
import { getCachedArticleBySlug } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const revalidate = 3600;

// Dynamic SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedArticleBySlug(slug);

  if (!article) return { title: "Không tìm thấy bài viết" };

  return {
    title: article.title,
    description: article.meta_description || article.excerpt,
    openGraph: {
      title: `${article.title} | NabTravel`,
      description: article.meta_description || article.excerpt,
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

  let contentHTML = article.content || '<p>No content available.</p>';
  // Fix AI/Scraper text that uses non-breaking spaces natively, causing it to render as one massive word that forces mid-word breaking or overflow.
  contentHTML = contentHTML.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');

  const locale = await getLocale();
  const dict = await getDictionary();

  let formattedDate = article.publishedAt;
  try {
    const d = new Date(article.publishedAt);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch (e) { }

  return (
    <div className="bg-white min-h-screen pb-12">

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-6 pt-5 pb-6">
        <div className="max-w-[800px] mx-auto">
          <nav className="flex items-center gap-2 text-[12px] font-medium text-gray-400 uppercase tracking-widest justify-start">
            <Link href="/" className="hover:text-black transition-colors"><Home className="w-3.5 h-3.5" /></Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/articles" className="hover:text-black transition-colors">Cẩm nang</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800 truncate max-w-[200px] md:max-w-md">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Container for Header and Content */}
      <main className="container mx-auto px-4 lg:px-6 mb-20 md:mb-24">
        <div className="max-w-[800px] mx-auto w-full text-left">
          
          {/* Header */}
          <header className="mb-10 md:mb-12">
            <h1 className="text-[32px] md:text-[40px] lg:text-[44px] font-extrabold text-[#1a1a1a] leading-[1.3] tracking-tight mb-5">
              {article.title}
            </h1>
            <div className="flex items-center gap-1.5 text-[14px] text-gray-400 font-sans flex-wrap">
              <span className="uppercase text-gray-400 text-[12px] font-medium">{locale === 'vi' ? 'Bởi' : 'By'}</span> 
              <span className="font-bold text-gray-900 uppercase mr-1 text-[13px] tracking-wide">{article.author_name || (article.is_ai_generated ? "TRỢ LÝ AI" : "ADMIN")}</span>
              <span className="text-gray-300">—</span>
              <span className="ml-1">{formattedDate}</span>
              <span className="mx-1">{locale === 'vi' ? 'trong' : 'in'}</span>
              <span className="text-gray-400 font-medium">{locale === 'vi' ? 'Cẩm nang du lịch' : 'Travel & Guides'}</span>
            </div>
          </header>

          {/* Typography Content */}
          <article className="prose prose-lg md:prose-xl max-w-none w-full text-[#333]
            [&_h2]:text-2xl [&_h2]:md:text-[32px] [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:font-extrabold [&_h2]:text-gray-900 [&_h2]:tracking-tight [&_h2]:leading-tight
            [&_p]:text-[18px] [&_p]:md:text-[20px] [&_p]:leading-[1.65] [&_p]:text-[#333] [&_p]:mb-7 [&_p]:font-sans [&_p]:whitespace-normal [&_p]:break-words [&_p]:text-justify
            [&_blockquote]:border-l-4 [&_blockquote]:border-red-600 [&_blockquote]:pl-6 [&_blockquote]:md:pl-8 [&_blockquote]:italic [&_blockquote]:text-[22px] [&_blockquote]:md:text-[26px] [&_blockquote]:text-gray-900 [&_blockquote]:bg-gray-50 [&_blockquote]:py-6 [&_blockquote]:pr-6 [&_blockquote]:rounded-r-xl [&_blockquote]:my-10 [&_blockquote]:leading-relaxed [&_blockquote]:text-justify
            [&_img]:rounded-none [&_img]:w-full [&_img]:my-10 [&_img]:shadow-md
            [&_figcaption]:text-center [&_figcaption]:text-[13px] [&_figcaption]:text-gray-500 [&_figcaption]:mt-3
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ul]:space-y-2 [&_li]:text-[18px] [&_li]:md:text-[20px] [&_li]:font-sans [&_li]:text-[#333] [&_li]:whitespace-normal [&_li]:break-words [&_li]:text-justify
          ">
            <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
          </article>
        </div>
      </main>

    </div>
  );
}
