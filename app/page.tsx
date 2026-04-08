import { SearchHero } from "@/components/search-hero";
import { IconicDestinations, IconicDestination } from "@/components/iconic-destinations";
import { HotelRecommendations } from "@/components/hotel-recommendations";
import { TourRecommendations } from "@/components/tour-recommendations";
import { InspirationSection } from "@/components/inspiration-section";
import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { getCachedArticles } from "@/lib/data";
import { TourItemData } from "@/components/tour-list-card";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.seo?.homeTitle || "NabTravel",
    description: dict.seo?.defaultDescription,
    openGraph: {
      title: `${dict.seo?.homeTitle || "NabTravel"} | NabTravel`,
      description: dict.seo?.defaultDescription,
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
    // Lấy dữ liệu từ DB, backend đã tự động lo phần đối soát logic cập nhật 30 ngày/lần với RapidAPI.
    const response = await fetch(`${backendUrl}/api/destinations`, {
      next: { revalidate: 3600 } // Cache dữ liệu trả về trong 1 giờ
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
  const [destinations, hotels, articles, tours] = await Promise.all([
    searchAttractions(),
    fetchTopHotels(),
    getCachedArticles(),
    fetchHomeTours()
  ]);

  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-white w-full">
      <SearchHero />
      <IconicDestinations destinations={destinations} />
      <HotelRecommendations hotels={hotels} />
      <TourRecommendations tours={tours} />
      <InspirationSection articles={articles} />
    </div>
  );
}
