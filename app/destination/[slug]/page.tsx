import { DestinationHero } from "@/components/destination-hero";
import { DestinationHotels } from "@/components/destination-hotels";
import { Metadata } from "next";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const destName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const desc = locale === 'vi' 
    ? `Khám phá các điểm đến, khách sạn và cẩm nang du lịch tại ${destName}. Đặt phòng giá ưu đãi tại NabTravel.`
    : `Explore destinations, hotels, and travel guides in ${destName}. Book at best rates on NabTravel.`;

  return {
    title: `${destName} - NabTravel`,
    description: desc,
    openGraph: {
      title: `Travel ${destName} | NabTravel`,
      description: desc,
    }
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // We simply convert the slug to a nicely formatted title mock for display.
  // For example: sam-son -> Sam Son, Vietnam. hoian -> Hoi An, Vietnam
  const formatName = (str: string) => {
    return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ', Vietnam';
  }

  // Handle specific overrides if needed based on the mock IDs.
  let name = formatName(slug);
  if (slug === "halong") name = "Ha Long Bay, Vietnam";
  if (slug === "ninhbinh") name = "Ninh Binh, Vietnam";
  if (slug === "hoian") name = "Hoi An, Vietnam";
  if (slug === "danang") name = "Da Nang, Vietnam";
  if (slug === "phuquoc") name = "Phu Quoc, Vietnam";
  if (slug === "hue") name = "Hue, Vietnam";

  return (
    <div className="flex flex-col flex-1 bg-white min-h-screen pb-16">
      <DestinationHero name={name} />
      <DestinationHotels />
    </div>
  );
}
