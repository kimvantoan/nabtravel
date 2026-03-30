import { DestinationHero } from "@/components/destination-hero";
import { DestinationHotels } from "@/components/destination-hotels";

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
