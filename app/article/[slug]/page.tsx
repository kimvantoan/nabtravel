import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChevronRight, Home } from "lucide-react";
import { MOCK_ARTICLES } from "@/lib/mock-articles";
import { getCachedArticleBySlug } from "@/lib/data";
import { ArticleCard } from "@/components/article-card";
import { notFound } from "next/navigation";

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

  // Related articles (random 3 excluding current)
  const relatedArticles = MOCK_ARTICLES.filter(a => a.id !== article.id).slice(0, 3);

  // MOCK HTML content
  const contentHTML = `
    <p class="lead">Nằm ẩn mình trên những sườn đồi xanh mướt hướng ra vịnh biển xanh ngọc, khu nghỉ dưỡng là một ví dụ quyến rũ về kiến trúc nhiệt đới đương đại. Với sự kết hợp hoàn hảo giữa thiên nhiên hoang sơ và tiện ích sang trọng, không có gì lạ khi nơi đây luôn thuộc danh sách điểm đến trong mơ của mọi du khách.</p>
    
    <h2>1. Thiết kế Giao thoa giữa Truyền thống và Hiện đại</h2>
    <p>Bước qua cánh cổng chào, bạn sẽ lập tức bị ấn tượng bởi mái ngói xám nhạt lấy cảm hứng từ những ngôi nhà cổ, cùng hệ thống cột kèo bằng gỗ tự nhiên nguyên khối. Khác với sự hào nhoáng của các khách sạn bê tông cốt thép, nơi đây mang lại sự tĩnh tại kỳ lạ.</p>
    
    <figure>
      <img src="https://images.unsplash.com/photo-1542314831-c6a4d27486c8?auto=format&fit=crop&q=80&w=2000" alt="Resort Architecture" />
      <figcaption>Kiến trúc mở đón nắng và gió biển tại sảnh chờ.</figcaption>
    </figure>

    <p>Các phòng nghỉ được thiết kế dật cấp tinh tế, đảm bảo 100% các căn villa đều có ban công lớn nhìn thẳng ra đại dương. Điểm nhấn là bồn tắm đá mài nguyên khối ôm trọn vẻ đẹp hoang dã của thảm thực vật xung quanh.</p>

    <h2>2. Bữa tiệc Ẩm thực Đánh thức Mọi Giác quan</h2>
    <p>Nhà hàng La Plage - trái tim của khu nghỉ dưỡng, phục vụ từ những món hải sản tươi rói đánh bắt trong ngày đến nghệ thuật ẩm thực Fusion đỉnh cao. Đầu bếp Michelin của nhà hàng không chỉ nấu ăn, họ kể câu chuyện văn hóa thông qua từng chiếc đĩa gốm mộc mạc.</p>

    <blockquote>
      "Trải nghiệm nghỉ dưỡng thực thụ không chỉ dừng lại ở chiếc giường êm ái, mà là việc đánh thức ngũ quan: nghe tiếng sóng, ngửi mùi gió biển, và thưởng thức sơn hào hải vị cùng người thương."
    </blockquote>

    <h2>3. Dịch vụ Đặc quyền Đẳng cấp</h2>
    <p>Thay vì sự vồn vã, dịch vụ ở đây được tính toán để bạn có cảm giác như đang ở nhà, nhưng với một "quản gia" túc trực mọi lúc. Từ bữa sáng khay nổi (Floating Breakfast) trên hồ bơi vô cực, đến các liệu trình Spa sử dụng thảo mộc địa phương, mọi thứ đều chạm đến sự hoàn hảo.</p>
    
    <p>Nếu bạn đang tìm kiếm một "nơi trốn" hoàn toàn xa rời khỏi khói bụi và nhịp sống số hối hả, thì đây đích thực là tấm vé hạng nhất để chữa lành tâm hồn.</p>
  `;

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
          <div className="mb-6 flex justify-center">
             <span className="bg-green-50 text-green-800 font-extrabold text-[12px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-green-200">
               {article.categoryKey}
             </span>
          </div>
          <h1 className="text-[32px] md:text-[46px] lg:text-[56px] font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-8">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-3 text-[14px] text-gray-500 font-medium font-sans">
            <span>{article.publishedAt}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              {article.readTime} phút đọc
            </span>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="container mx-auto px-4 lg:px-6 mb-16 md:mb-24">
        <div className="relative w-full aspect-[4/3] md:aspect-video lg:aspect-[21/9] rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
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
             {relatedArticles.map((relArticle) => (
                <ArticleCard key={relArticle.id} article={relArticle} />
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
