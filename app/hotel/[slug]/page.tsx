import { HotelBreadcrumb } from "@/components/hotel-breadcrumb";
import { HotelGallery } from "@/components/hotel-gallery";
import { HotelPricing } from "@/components/hotel-pricing";
import { HotelDetailsAmenities } from "@/components/hotel-details-amenities";
import { HotelReviews } from "@/components/hotel-reviews";
import { SimilarHotels } from "@/components/similar-hotels";

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
