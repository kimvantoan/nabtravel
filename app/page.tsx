import { SearchHero } from "@/components/search-hero";
import { IconicDestinations, IconicDestination } from "@/components/iconic-destinations";
import { HotelRecommendations } from "@/components/hotel-recommendations";
import { TourRecommendations } from "@/components/tour-recommendations";
import { Metadata } from "next";
import { TourItemData } from "@/components/tour-list-card";
import { ArticleRecommendations } from "@/components/article-recommendations";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getCachedArticles } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  
  const titleVi = "Chuyên Cung Cấp Tour Trọn Gói & Phòng Khách Sạn Giá Tốt - NabTravel";
  const titleEn = "Premium Tour Packages & Best Hotel Deals - NabTravel";
  
  const descVi = "Bạn đang tìm kiếm tour du lịch độc đáo hay phòng khách sạn sang trọng với giá ưu đãi? Truy cập NAB Travel để nhận ngay các deal du lịch tốt nhất. Đặt dịch vụ nhanh chóng, thanh toán an toàn, khởi hành mỗi ngày.";
  const descEn = "Looking for unique travel tours or luxury hotels at great prices? Visit NAB Travel for the best travel deals. Fast booking, secure payment, daily departures.";

  const title = locale === 'vi' ? titleVi : titleEn;
  const desc = locale === 'vi' ? descVi : descEn;

  return {
    title: title,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      url: "https://nabtravel.com",
      type: "website"
    }
  };
}

export const revalidate = 3600; // Cache 1 giờ
const RAPID_API_KEY = process.env.RAPID_API_KEY as string;

async function searchAttractions(): Promise<IconicDestination[]> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendUrl}/api/destinations`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("⚠️ Lỗi kết nối lấy Destinations từ Backend:", error);
    return [];
  }
}

export type HotelData = {
  id: string;
  slug: string;
  name: string;
  image: string;
  rating: string;
  reviews: string;
};

async function fetchTopHotels(): Promise<HotelData[]> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendUrl}/api/hotels/top`, {
      next: { revalidate: 1800 } // Cache 30 minutes — top hotels don't change often
    });
    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return [];

    return data
      .filter((h: any) => h.image && h.name && h.rating >= 4.3)
      .slice(0, 12)
      .map((h: any) => ({
        id: String(h.id || h.slug),
        slug: h.slug,
        name: h.name,
        image: h.image,
        rating: Number(h.rating).toFixed(1).replace('.', ','),
        reviews: Number(h.reviews).toLocaleString('vi-VN'),
      }));
  } catch {
    return [];
  }
}

async function fetchHomeTours(): Promise<TourItemData[]> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = new URL(`${backendUrl}/api/tours`);
    url.searchParams.set('limit', '12'); // Fetch top 12 tours for horizontal scroll
    url.searchParams.set('skip', '0');

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }
    });

    if (res.ok) {
      const data = await res.json();
      return data.tours || [];
    }
  } catch (error) {
    console.error("Error loading tours from API", error);
  }
  return [];
}

export default async function Home() {
  const [destinations, hotels, tours, allArticles] = await Promise.all([
    searchAttractions(),
    fetchTopHotels(),
    fetchHomeTours(),
    getCachedArticles()
  ]);

  const recentArticles = allArticles.slice(0, 3);

  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-white w-full">
      <SearchHero />
      <IconicDestinations destinations={destinations} />
      <HotelRecommendations hotels={hotels} />
      <TourRecommendations tours={tours} />
      <ArticleRecommendations articles={recentArticles} />
    </div>
  );
}
