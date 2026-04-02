import { SearchHero } from "@/components/search-hero";
import { IconicDestinations, IconicDestination } from "@/components/iconic-destinations";
import { HotelRecommendations } from "@/components/hotel-recommendations";
import { InspirationSection } from "@/components/inspiration-section";
import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { getCachedArticles } from "@/lib/data";

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

export const dynamic = 'force-dynamic';


const RAPID_API_KEY = process.env.RAPID_API_KEY as string;

async function searchAttractions(): Promise<IconicDestination[]> {
  const targetCities = ["Hà Nội", "Đà Nẵng", "Nha Trang", "Đà Lạt", "Sa Pa", "Hội An"];
  try {
    const promises = targetCities.map(async (city) => {
      const response = await fetch(
        `https://travel-advisor.p.rapidapi.com/locations/search?query=${city}&limit=5`,
        {
          headers: {
            "X-RapidAPI-Key": RAPID_API_KEY,
            "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
            Accept: "application/json"
          },
          next: { revalidate: 2592000 } // Cache 1 tháng — destinations hiếm thay đổi
        }
      );
      if (!response.ok) return null;
      const data = await response.json();
      const place = data?.data?.find((d: any) => d.result_type === 'geos')?.result_object || data?.data?.[0]?.result_object;
      if (!place) return null;

      const photo = place.photo?.images?.large?.url || 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop';
      return {
        id: place.location_id?.toString() || Math.random().toString(),
        name: city,
        image: photo
      };
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(Boolean) as IconicDestination[];

    if (validResults.length === 0) {
      console.warn(`⚠️ Tất cả request RapidAPI Điểm đến đều lỗi. Đang trả về mảng rỗng.`);
      return [];
    }
    return validResults;
  } catch (error) {
    console.warn("⚠️ Lỗi kết nối RapidAPI Điểm đến:", error);
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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
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

export default async function Home() {
  const [destinations, hotels, articles] = await Promise.all([
    searchAttractions(),
    fetchTopHotels(),
    getCachedArticles()
  ]);

  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-white w-full">
      <SearchHero />
      <IconicDestinations destinations={destinations} />
      <HotelRecommendations hotels={hotels} />
      <InspirationSection articles={articles} />
    </div>
  );
}
