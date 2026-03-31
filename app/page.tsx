import { SearchHero } from "@/components/search-hero";
import { IconicDestinations } from "@/components/iconic-destinations";
import { HotelRecommendations } from "@/components/hotel-recommendations";
import { InspirationSection } from "@/components/inspiration-section";
import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";

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

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-white w-full">
      <SearchHero />
      <IconicDestinations />
      <HotelRecommendations />
      <InspirationSection />
    </div>
  );
}
