import { HotelGallery } from "@/components/hotel-gallery";
import { HotelPricing } from "@/components/hotel-pricing";
import { HotelDetailsAmenities } from "@/components/hotel-details-amenities";
import { HotelReviews } from "@/components/hotel-reviews";
import { SimilarHotels } from "@/components/similar-hotels";

const RAPID_API_KEY = process.env.RAPID_API_KEY as string;
const RAPID_API_HOST = "travel-advisor.p.rapidapi.com";
const BASE_URL = "https://travel-advisor.p.rapidapi.com";

// ── Fetch helpers ─────────────────────────────────────────────

async function fetchHotelPhotos(id: string, lang: string) {
  if (!id) return [];
  try {
    const res = await fetch(`${BASE_URL}/photos/list?location_id=${id}&limit=10&lang=${lang}`, {
      headers: { "X-RapidAPI-Key": RAPID_API_KEY, "X-RapidAPI-Host": RAPID_API_HOST },
      next: { revalidate: 2592000 } // Cache 1 tháng
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return data?.map((p: any) => p.images?.original?.url || p.images?.large?.url).filter(Boolean) || [];
  } catch { return []; }
}

async function fetchBookingPhotos(destId: string | null) {
  if (!destId) return [];
  try {
    const res = await fetch(`https://apidojo-booking-v1.p.rapidapi.com/properties/get-hotel-photos?hotel_ids=${destId}`, {
      headers: { "X-RapidAPI-Key": RAPID_API_KEY, "X-RapidAPI-Host": "apidojo-booking-v1.p.rapidapi.com" },
      next: { revalidate: 2592000 } // Cache 1 tháng
    });
    if (!res.ok) return [];
    const parsed = await res.json();
    const photosArray = parsed.data?.[destId] || [];
    return photosArray.slice(0, 15).map((p: any) => {
      const urlPath = p[4];
      if (!urlPath) return null;
      return `https://cf.bstatic.com${urlPath}`.replace(/max\d+x\d+/, 'max1280x900');
    }).filter(Boolean) || [];
  } catch { return []; }
}

async function fetchHotelReviews(id: string, lang: string) {
  if (!id) return [];
  try {
    const res = await fetch(`${BASE_URL}/reviews/list?location_id=${id}&limit=10&currency=USD&lang=${lang}`, {
      headers: { "X-RapidAPI-Key": RAPID_API_KEY, "X-RapidAPI-Host": RAPID_API_HOST },
      next: { revalidate: 2592000 } // Cache 1 tháng
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return data?.map((r: any) => ({
      id: r.id,
      user: {
        name: r.user?.username || "Guest",
        avatar: r.user?.avatar?.thumbnail || "/images/tourist.png",
        location: r.user?.user_location?.name || "Global Traveler",
        contributions: r.user?.contributions?.reviews || Math.floor(Math.random() * 50) + 1,
        helpfulVotes: r.user?.contributions?.helpful_votes || Math.floor(Math.random() * 20),
      },
      dateWritten: r.published_date ? new Date(r.published_date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' }) : "Recent",
      timestamp: r.published_date ? new Date(r.published_date).getTime() : 0,
      rating: r.rating || 5,
      title: r.title || "Review",
      text: r.text || "",
      dateOfStay: r.travel_date || "Recent",
      tripType: r.trip_type || "Traveled context",
      helpfulCount: r.helpful_votes || 0,
      source: 'tripadvisor'
    })) || [];
  } catch { return []; }
}

async function fetchGoogleReviews(hotelName: string, lang: string) {
  try {
    const searchRes = await fetch(`https://maps-data.p.rapidapi.com/searchmaps.php?query=${encodeURIComponent(hotelName)}&limit=1`, {
      headers: { "X-RapidAPI-Key": RAPID_API_KEY, "X-RapidAPI-Host": "maps-data.p.rapidapi.com" },
      next: { revalidate: 2592000 } // Cache 1 tháng
    });
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const businessId = searchData.data?.[0]?.business_id;
    if (!businessId) return [];
    const res = await fetch(`https://maps-data.p.rapidapi.com/reviews.php?business_id=${encodeURIComponent(businessId)}&limit=10&language=${lang === 'vi' ? 'vi' : 'en'}`, {
      headers: { "X-RapidAPI-Key": RAPID_API_KEY, "X-RapidAPI-Host": "maps-data.p.rapidapi.com" },
      next: { revalidate: 2592000 } // Cache 1 tháng
    });
    if (!res.ok) return [];
    const parsed = await res.json();
    let reviewsList: any[] = [];
    if (parsed.data && Array.isArray(parsed.data.reviews)) reviewsList = parsed.data.reviews;
    else if (Array.isArray(parsed.data)) reviewsList = parsed.data;
    if (!reviewsList.length) return [];
    return reviewsList.slice(0, 10).map((r: any) => ({
      id: r.review_id || Math.random().toString(),
      user: {
        name: r.author_name || r.author_title || "Guest",
        avatar: r.author_photo_url || r.author_image || r.author_avatar_url || "/images/tourist.png",
        location: "Google Maps User",
        contributions: r.author_reviews_count || r.reviews_count || Math.floor(Math.random() * 50) + 1,
        helpfulVotes: Math.floor(Math.random() * 20),
      },
      dateWritten: (r.review_datetime_utc || r.publish_date || r.review_date)
        ? new Date(r.review_datetime_utc || r.publish_date || r.review_date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' })
        : "Recent",
      timestamp: (r.review_datetime_utc || r.publish_date || r.review_date)
        ? new Date(r.review_datetime_utc || r.publish_date || r.review_date).getTime() : 0,
      rating: r.rating || 5,
      title: r.review_text ? (r.review_text.substring(0, 30) + "...") : "Google Review",
      text: r.review_text || r.text || "",
      dateOfStay: "Recent",
      tripType: "Google Maps",
      helpfulCount: r.review_likes || r.likes_count || r.review_likes_count || 0,
      source: 'google'
    }));
  } catch { return []; }
}

async function fetchBookingDescription(destId: string | null, langQuery: string) {
  if (!destId) return null;
  const lang = langQuery === 'vi_VN' ? 'vi' : 'en-us';
  try {
    const res = await fetch(`https://booking-com15.p.rapidapi.com/api/v1/hotels/getDescriptionAndInfo?hotel_id=${destId}&languagecode=${lang}`, {
      headers: { "X-RapidAPI-Key": RAPID_API_KEY, "X-RapidAPI-Host": "booking-com15.p.rapidapi.com" },
      next: { revalidate: 2592000 } // Cache 1 tháng
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data?.[0]?.description || null;
  } catch { return null; }
}

async function fetchBookingAmenities(destId: string | null, langQuery: string) {
  if (!destId) return [];
  const lang = langQuery === 'vi_VN' ? 'vi' : 'en-us';
  try {
    const res = await fetch(`https://booking-com15.p.rapidapi.com/api/v1/hotels/getHotelDetails?hotel_id=${destId}&arrival_date=2026-05-15&departure_date=2026-05-16&languagecode=${lang}`, {
      headers: { "X-RapidAPI-Key": RAPID_API_KEY, "X-RapidAPI-Host": "booking-com15.p.rapidapi.com" },
      next: { revalidate: 2592000 } // Cache 1 tháng
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    const amenities: any[] = [];
    if (data?.family_facilities) amenities.push(...data.family_facilities.map((f: string) => ({ name: f, type: 'Property' })));
    const rooms = Object.values(data?.rooms || {});
    if (rooms.length > 0) {
      const roomFacs = (rooms[0] as any).facilities || [];
      amenities.push(...roomFacs.map((f: any) => ({ name: f.name, type: f.alt_facilitytype_name || 'Room' })));
    }
    return amenities;
  } catch { return []; }
}

// ── Section: Gallery (priority 1 — needs photos) ─────────────

export async function HotelGallerySection({
  hotelBasic, dbHotel, locationId, bookingDestId, langQuery, hotelNameQuery
}: {
  hotelBasic: any; dbHotel: any; locationId: string;
  bookingDestId: string | null; langQuery: string; hotelNameQuery: string;
}) {
  const [fetchedPhotos, fetchedBookingPhotos] = await Promise.all([
    fetchHotelPhotos(locationId, langQuery),
    fetchBookingPhotos(bookingDestId),
  ]);

  const mainPhoto = hotelBasic?.photo?.images?.original?.url
    || hotelBasic?.photo?.images?.large?.url
    || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";
  const advisorPhotos = fetchedPhotos.includes(mainPhoto) ? fetchedPhotos : [mainPhoto, ...fetchedPhotos];
  const photos = fetchedBookingPhotos.length > 0 ? fetchedBookingPhotos : advisorPhotos;
  const isBookingPhotos = fetchedBookingPhotos.length > 0;

  return (
    <HotelGallery
      name={hotelBasic?.name || hotelNameQuery}
      rating={hotelBasic?.rating ? Number(hotelBasic.rating) : undefined}
      reviewsCount={hotelBasic?.num_reviews ? Number(hotelBasic.num_reviews) : undefined}
      address={hotelBasic?.address_obj?.address_string || hotelBasic?.location_string}
      photos={photos}
      locationId={locationId}
      langQuery={langQuery}
      isBookingPhotos={isBookingPhotos}
      phone={hotelBasic?.phone || hotelBasic?.contact?.phone}
    />
  );
}

// ── Section: Amenities & Description (priority 3) ────────────

export async function HotelAmenitiesSection({
  hotelBasic, bookingDestId, langQuery
}: {
  hotelBasic: any; bookingDestId: string | null; langQuery: string;
}) {
  const [bookingDesc, bookingAmenities] = await Promise.all([
    fetchBookingDescription(bookingDestId, langQuery),
    fetchBookingAmenities(bookingDestId, langQuery),
  ]);

  const finalDescription = bookingDesc || hotelBasic?.description || "";
  const finalAmenities = bookingAmenities.length > 0
    ? bookingAmenities
    : (hotelBasic?.amenities ? hotelBasic.amenities.map((a: any) => ({ name: a.name || a.v, type: 'Property' })) : []);

  return (
    <HotelDetailsAmenities
      rating={hotelBasic?.rating ? Number(hotelBasic.rating) : undefined}
      reviewsCount={hotelBasic?.num_reviews ? Number(hotelBasic.num_reviews) : undefined}
      description={finalDescription}
      amenities={finalAmenities}
    />
  );
}

// ── Section: Reviews (priority 4) ────────────────────────────

export async function HotelReviewsSection({
  hotelBasic, locationId, langQuery, slug, bookingDestId, backendUrl, photos
}: {
  hotelBasic: any; locationId: string; langQuery: string;
  slug: string; bookingDestId: string | null; backendUrl: string; photos?: string[];
}) {
  const [tripAdvisorReviews, googleReviews, bookingDesc, bookingAmenities] = await Promise.all([
    fetchHotelReviews(locationId, langQuery),
    fetchGoogleReviews(hotelBasic?.name || "", langQuery),
    fetchBookingDescription(bookingDestId, langQuery),
    fetchBookingAmenities(bookingDestId, langQuery),
  ]);

  const combinedReviews: any[] = [];
  const maxLength = Math.max(tripAdvisorReviews.length, googleReviews.length);
  for (let i = 0; i < maxLength; i++) {
    if (i < tripAdvisorReviews.length) combinedReviews.push(tripAdvisorReviews[i]);
    if (i < googleReviews.length) combinedReviews.push(googleReviews[i]);
  }
  const reviews = combinedReviews.slice(0, 20);

  const finalDescription = bookingDesc || hotelBasic?.description || "";
  const finalAmenities = bookingAmenities.length > 0
    ? bookingAmenities
    : (hotelBasic?.amenities ? hotelBasic.amenities.map((a: any) => ({ name: a.name || a.v, type: 'Property' })) : []);

  // Fire & Forget: Sync back to DB
  if (photos) {
    try {
      fetch(`${backendUrl}/api/hotels/sync-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ slug, description: finalDescription, photos, latest_reviews: reviews })
      }).catch(() => {});
    } catch {}
  }

  return <HotelReviews reviews={reviews} />;
}

// ── Section: Similar Hotels (priority 5) ─────────────────────

export async function SimilarHotelsSection({
  slug, currentLocation, backendUrl
}: {
  slug: string; currentLocation: string; backendUrl: string;
}) {
  try {
    const sugRes = await fetch(`${backendUrl}/api/hotels`, { next: { revalidate: 60 } });
    if (!sugRes.ok) return <SimilarHotels hotels={[]} />;
    const allHotels = await sugRes.json();

    let filtered = Array.isArray(allHotels)
      ? allHotels.filter((h: any) => h.slug !== slug)
      : [];

    filtered = filtered.sort((a: any, b: any) => {
      const aLoc = (a.location || "").toLowerCase();
      const bLoc = (b.location || "").toLowerCase();
      const currLoc = currentLocation.toLowerCase();
      let scoreA = Math.random();
      let scoreB = Math.random();
      if (currLoc && aLoc.includes(currLoc)) scoreA += 10;
      if (currLoc && bLoc.includes(currLoc)) scoreB += 10;
      const words = currLoc.split(" ").filter((w: string) => w.length > 3);
      words.forEach((w: string) => {
        if (aLoc.includes(w) || a.name.toLowerCase().includes(w)) scoreA += 5;
        if (bLoc.includes(w) || b.name.toLowerCase().includes(w)) scoreB += 5;
      });
      return scoreB - scoreA;
    });

    const suggestedHotels = filtered.slice(0, 4).map((h: any) => ({
      id: h.id || h.slug,
      name: h.name,
      image: h.image || (h.photos && h.photos.length > 0 ? h.photos[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070"),
      rating: h.rating ? Number(h.rating) : 4.5,
      reviews: h.reviews ? Number(h.reviews) : 50,
      price: h.price ? Number(h.price) : 100
    }));

    return <SimilarHotels hotels={suggestedHotels} />;
  } catch {
    return <SimilarHotels hotels={[]} />;
  }
}
