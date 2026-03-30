import { SearchHero } from "@/components/search-hero";
import { IconicDestinations } from "@/components/iconic-destinations";
import { HotelRecommendations } from "@/components/hotel-recommendations";
import { InspirationSection } from "@/components/inspiration-section";

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
