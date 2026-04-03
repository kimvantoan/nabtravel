"use client";

import Link from "next/link";
import { MapPin, Star, ExternalLink } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { useEffect, useState } from "react";

interface HotelCardData {
  slug: string;
  name: string;
  image?: string;
  location?: string;
  rating?: number;
  price?: number;
  stars?: number;
}

export function AiHotelCard({ slug, name }: { slug: string; name: string }) {
  const { dict, locale } = useLanguage();
  const [hotel, setHotel] = useState<HotelCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch hotel details from backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    if (!backendUrl) {
      setLoading(false);
      return;
    }
    fetch(`${backendUrl}/api/hotels/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) {
          setHotel({
            slug: data.slug || slug,
            name: data.name || name,
            image: data.image,
            location: data.location,
            rating: data.rating ? Number(data.rating) : undefined,
            price: data.price ? Number(data.price) : undefined,
            stars: data.stars ? Number(data.stars) : undefined,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, name]);

  if (loading) {
    return (
      <div className="animate-pulse flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 my-2">
        <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  const displayName = hotel?.name || name;
  const displayImage = hotel?.image;
  const displayLocation = hotel?.location;
  const displayRating = hotel?.rating;
  const displayPrice = hotel?.price;

  return (
    <Link
      href={`/hotel/${slug}`}
      className="group flex gap-3 p-3 rounded-xl bg-gradient-to-br from-green-50/80 to-emerald-50/40 border border-green-100/80 hover:border-green-200 hover:shadow-md transition-all duration-200 my-2 no-underline"
    >
      {/* Thumbnail */}
      {displayImage ? (
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
          <img
            src={displayImage}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-lg shrink-0 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-green-600/60" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-1.5">
          <h4 className="font-bold text-[14px] text-gray-900 truncate leading-tight">
            {displayName}
          </h4>
          <ExternalLink className="w-3.5 h-3.5 text-green-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        {displayLocation && (
          <p className="text-[12px] text-gray-500 truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {displayLocation}
          </p>
        )}

        <div className="flex items-center gap-3">
          {displayRating && (
            <span className="flex items-center gap-0.5 text-[12px] font-semibold text-amber-600">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {displayRating.toFixed(1)}
            </span>
          )}
          {displayPrice && (
            <span className="text-[12px] font-bold text-green-700">
              {Number(displayPrice).toLocaleString('vi-VN')}đ
              <span className="font-normal text-gray-500">/{locale === 'vi' ? 'đêm' : 'night'}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
