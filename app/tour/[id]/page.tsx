import { TourDetailClient } from "../../../components/tour-detail-client";
import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.id;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const res = await fetch(`${backendUrl}/api/tours/${slug}`, { next: { revalidate: 3600 } }); // Cache 1 hour

    if (res.ok) {
      const tour = await res.json();

      const title = tour.name?.vi || tour.name?.en || 'Tour Du Lịch';
      const rawDesc = tour.shortDescription?.vi || tour.shortDescription?.en || '';
      const priceStr = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tour.priceVND || 0);

      let description = typeof rawDesc === 'string' ? rawDesc : '';
      // Strip HTML if any
      description = description.replace(/<[^>]+>/g, '').substring(0, 150).trim();
      if (!description) {
        description = `Trải nghiệm chuyến đi tuyệt vời ${title} cùng NabTravel. Giá cực sốc chỉ từ ${priceStr}. Lịch trình chuẩn 5 sao, đội ngũ HDV chuyên nghiệp.`;
      } else {
        description = `[Chỉ ${priceStr}] ${description}...`;
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
  return {
    title: "Chi tiết Tour | NabTravel",
    description: "Khám phá chuyến đi tuyệt vời cùng NabTravel với lịch trình chi tiết và giá siêu tốt.",
  };
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TourDetailClient tourId={resolvedParams.id} />;
}
