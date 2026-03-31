import { HotelBreadcrumb } from "@/components/hotel-breadcrumb";
import { HotelGallery } from "@/components/hotel-gallery";
import { HotelPricing } from "@/components/hotel-pricing";
import { HotelDetailsAmenities } from "@/components/hotel-details-amenities";
import { HotelReviews } from "@/components/hotel-reviews";
import { SimilarHotels } from "@/components/similar-hotels";
import { Metadata } from "next";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  // Convert "intercontinental-danang" to "Intercontinental Danang"
  const hotelName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const desc = locale === 'vi' 
    ? `Khám phá đánh giá khách quan, hình ảnh chi tiết và cơ sở vật chất của ${hotelName}. Liên hệ đặt phòng giá tốt tại NabTravel.`
    : `Discover objective reviews, detailed photos, and facilities of ${hotelName}. Book at best rates on NabTravel.`;

  return {
    title: hotelName,
    description: desc,
    openGraph: {
      title: `${hotelName} | NabTravel`,
      description: desc,
    }
  };
}

export default function HotelReviewPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-white w-full">
      <div className="max-w-6xl mx-auto w-full px-4 lg:px-6">
        <HotelBreadcrumb />
        <HotelGallery />
        <HotelPricing />
        <HotelDetailsAmenities />
        <HotelReviews />
        <SimilarHotels />
      </div>
    </div>
  );
}
