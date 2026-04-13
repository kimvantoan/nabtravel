import { TourDetailClient } from "../../../components/tour-detail-client";
import type { Metadata, ResolvingMetadata } from "next";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.id;
  const locale = await getLocale();

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const res = await fetch(`${backendUrl}/api/tours/${slug}`, { next: { revalidate: 3600 } }); // Cache 1 hour

    if (res.ok) {
      const tour = await res.json();

      const title = locale === 'vi' 
        ? (tour.name?.vi || tour.name?.en || 'Tour Du Lịch') 
        : (tour.name?.en || tour.name?.vi || 'Travel Tour');
        
      const rawDesc = locale === 'vi' 
        ? (tour.shortDescription?.vi || tour.shortDescription?.en || '') 
        : (tour.shortDescription?.en || tour.shortDescription?.vi || '');
        
      const priceStrVND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tour.priceVND || 0);
      const priceStrUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(tour.priceUSD || 0);
      const priceStr = locale === 'vi' ? priceStrVND : priceStrUSD;

      let description = typeof rawDesc === 'string' ? rawDesc : '';
      // Strip HTML if any
      description = description.replace(/<[^>]+>/g, '').substring(0, 150).trim();
      
      if (!description) {
        description = locale === 'vi' 
          ? `Trải nghiệm chuyến đi tuyệt vời ${title} cùng NabTravel. Giá cực sốc chỉ từ ${priceStr}. Lịch trình chuẩn 5 sao, đội ngũ HDV chuyên nghiệp.`
          : `Experience an amazing trip ${title} with NabTravel. Starting from just ${priceStr}. 5-star standard itinerary, professional tour guides.`;
      } else {
        description = locale === 'vi' ? `[Chỉ ${priceStr}] ${description}...` : `[Only ${priceStr}] ${description}...`;
      }

      const ogImage = tour.photoUrl || "https://nabtravel.com/booking-placeholder.jpg";

      return {
        title: `${title} | NabTravel`,
        description,
        openGraph: {
          title,
          description,
          type: "article",
          url: `https://nabtravel.com/tour/${slug}`,
          siteName: "NabTravel",
          images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [ogImage]
        },
        alternates: {
          canonical: `https://nabtravel.com/tour/${slug}`
        }
      };
    }
  } catch (error) {
    console.error("Error generating metadata for tour", slug, error);
  }

  // Fallback metadata
  const fallbackTitle = locale === 'vi' ? "Chi tiết Tour | NabTravel" : "Tour Details | NabTravel";
  const fallbackDesc = locale === 'vi' 
    ? "Khám phá chuyến đi tuyệt vời cùng NabTravel với lịch trình chi tiết và giá siêu tốt."
    : "Discover great tours with NabTravel featuring detailed itineraries and best prices.";

  return {
    title: fallbackTitle,
    description: fallbackDesc,
  };
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TourDetailClient tourId={resolvedParams.id} />;
}
