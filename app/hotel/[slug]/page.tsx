import { Suspense } from "react";
import { HotelPricing } from "@/components/hotel-pricing";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import {
  GallerySkeleton,
  AmenitiesSkeleton,
  ReviewsSkeleton,
  SimilarHotelsSkeleton,
} from "@/components/hotel-detail-skeletons";
import {
  HotelGallerySection,
  HotelAmenitiesSection,
  HotelReviewsSection,
  SimilarHotelsSection,
} from "./sections";
import { HotelMap } from "@/components/hotel-map";

const RAPID_API_KEY = process.env.RAPID_API_KEY as string;
const RAPID_API_HOST = "travel-advisor.p.rapidapi.com";
const BASE_URL = "https://travel-advisor.p.rapidapi.com";

async function fetchHotelBasic(name: string, lang: string, targetedLocationId?: string) {
  try {
    const res = await fetch(`${BASE_URL}/locations/search?query=${encodeURIComponent(name)}&lang=${lang}`, {
      headers: { "X-RapidAPI-Key": RAPID_API_KEY, "X-RapidAPI-Host": RAPID_API_HOST },
      next: { revalidate: 2592000 } // Cache 1 tháng
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    if (targetedLocationId) {
      const exactMatch = data?.find((d: any) => d.result_object?.location_id?.toString() === targetedLocationId);
      return exactMatch ? exactMatch.result_object : null;
    }
    const hotel = data?.find((d: any) => d.result_type === 'lodging');
    return hotel ? hotel.result_object : (data?.[0]?.result_object || null);
  } catch { return null; }
}

async function fetchBookingDestId(name: string) {
  try {
    const res = await fetch(`https://apidojo-booking-v1.p.rapidapi.com/locations/auto-complete?text=${encodeURIComponent(name)}&languagecode=en-us`, {
      headers: { "X-RapidAPI-Key": RAPID_API_KEY, "X-RapidAPI-Host": "apidojo-booking-v1.p.rapidapi.com" },
      next: { revalidate: 2592000 } // Cache 1 tháng
    });
    if (!res.ok) return null;
    const data = await res.json();
    const hotel = data?.find((d: any) => d.dest_type === 'hotel');
    return hotel ? String(hotel.dest_id) : null;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const safeSlug = decodeURIComponent(slug);
  const parts = safeSlug.split('-');
  const lastPart = parts.length > 1 ? parts[parts.length - 1] : "";
  let hotelNameStr = safeSlug;
  if (/^\d+$/.test(lastPart)) {
    parts.pop();
    hotelNameStr = parts.join(' ');
  }
  const hotelName = hotelNameStr.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  const desc = locale === 'vi'
    ? `Khám phá đánh giá khách quan, hình ảnh chi tiết và cơ sở vật chất của ${hotelName}. Liên hệ đặt phòng giá tốt tại NabTravel.`
    : `Discover objective reviews, detailed photos, and facilities of ${hotelName}. Book at best rates on NabTravel.`;
  return {
    title: hotelName,
    description: desc,
    openGraph: { title: `${hotelName} | NabTravel`, description: desc, }
  };
}

export default async function HotelReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const langQuery = locale === 'vi' ? 'vi_VN' : 'en_US';

  const safeSlug = decodeURIComponent(slug);
  const parts = safeSlug.split('-');
  const lastPart = parts.length > 1 ? parts[parts.length - 1] : "";

  let extractedLocationId = "";
  let hotelNameQuery = safeSlug;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

  // ── Priority 0: Check Laravel cache first (fastest possible) ──
  let isFresh = false;
  let dbHotel: any = null;
  try {
    const dbRes = await fetch(`${backendUrl}/api/hotels/${slug}`, { next: { revalidate: 0 } });
    if (dbRes.ok) {
      const h = await dbRes.json();
      if (h && h.name) {
        dbHotel = h;
        isFresh = true; // Always use DB data directly
      }
    }
  } catch { }

  // ── Slow path: fetch from APIs with streaming ──
  if (/^\d+$/.test(lastPart)) {
    extractedLocationId = parts.pop() || "";
    hotelNameQuery = parts.join(' ');
  }

  // Fetch basic hotel info — needed for slug/identity before streaming sections
  let [hotelBasic, bookingDestId] = await Promise.all([
    fetchHotelBasic(hotelNameQuery, 'en_US', extractedLocationId),
    fetchBookingDestId(hotelNameQuery),
  ]);

  if (!hotelBasic && !dbHotel) return notFound();

  // Fallback to DB data if RapidAPI is unavailable
  if (!hotelBasic && dbHotel) {
    hotelBasic = {
      name: dbHotel.name,
      rating: dbHotel.rating,
      num_reviews: dbHotel.reviews,
      location_string: dbHotel.location,
      location_id: dbHotel.rapid_id || extractedLocationId,
      price: dbHotel.price,
      photo: { images: { large: { url: dbHotel.image } } },
      description: null,
      amenities: dbHotel.amenities ? dbHotel.amenities.map((a: string) => ({ name: a, type: 'Property' })) : []
    };
  }

  if (dbHotel?.booking_id) bookingDestId = dbHotel.booking_id;

  const locationId = hotelBasic.location_id || extractedLocationId;
  const currentLocation = hotelBasic.location_string || dbHotel?.location || "";

  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-white w-full">
      <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 pt-4">

        {/* Priority 1: Gallery — streams photos from TripAdvisor/Booking */}
        <Suspense fallback={<GallerySkeleton />}>
          <HotelGallerySection
            hotelBasic={hotelBasic}
            dbHotel={dbHotel}
            locationId={locationId}
            bookingDestId={bookingDestId}
            langQuery={langQuery}
            hotelNameQuery={hotelNameQuery}
          />
        </Suspense>

        {/* Priority 2: Pricing — always client-side, renders immediately */}
        <HotelPricing
          price={hotelBasic?.price || dbHotel?.price?.toString()}
          hotelId={bookingDestId}
          hotelName={hotelBasic?.name || hotelNameQuery}
          agodaPrice={dbHotel?.agoda_price}
          agodaUrl={dbHotel?.agoda_url}
        />

        {/* Priority 3: Map — instant, no API needed */}
        <HotelMap
          hotelName={hotelBasic?.name || hotelNameQuery}
          address={hotelBasic?.address_obj?.address_string || currentLocation}
        />

        {/* Priority 4: Amenities + Description — streams or DB */}
        <Suspense fallback={<AmenitiesSkeleton />}>
          <HotelAmenitiesSection
            hotelBasic={hotelBasic}
            bookingDestId={bookingDestId}
            langQuery={langQuery}
            dbHotel={dbHotel}
            isFresh={isFresh}
          />
        </Suspense>

        {/* Priority 4: Reviews — slowest, streams or DB */}
        <Suspense fallback={<ReviewsSkeleton />}>
          <HotelReviewsSection
            hotelBasic={hotelBasic}
            locationId={locationId}
            langQuery={langQuery}
            slug={slug}
            bookingDestId={bookingDestId}
            backendUrl={backendUrl}
            dbHotel={dbHotel}
            isFresh={isFresh}
          />
        </Suspense>

        {/* Priority 5: Similar hotels */}
        <Suspense fallback={<SimilarHotelsSkeleton />}>
          <SimilarHotelsSection
            slug={slug}
            currentLocation={currentLocation}
            backendUrl={backendUrl}
          />
        </Suspense>

      </div>
    </div>
  );
}
