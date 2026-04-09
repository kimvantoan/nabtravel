"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { LiveListPrice } from "./live-list-price";
import { useFavorites } from "@/hooks/use-favorites";

export interface SimilarHotelData {
  id: string | number;
  slug?: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  price_updated_at?: string;
}

function RatingStars({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = score >= star;
        const isHalf = score >= star - 0.5 && score < star;

        return (
          <div key={star} className="relative w-[14px] h-[14px]">
            <svg viewBox="0 0 24 24" fill="#E5E7EB" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {(isFull || isHalf) && (
              <svg viewBox="0 0 24 24" fill="#FFB800" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SimilarHotels({ hotels = [] }: { hotels?: SimilarHotelData[] }) {
  const { dict } = useLanguage();
  const { toggleFavorite, isFavorite, isClient } = useFavorites();
  
  const createSlug = (str: string) => {
    return str.normalize('NFD') 
      .replace(/[\u0300-\u036f]/g, '') 
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  if (!hotels || hotels.length === 0) return null;

  return (
    <section className="w-full mt-4 border-t border-gray-200 py-10">
      <h2 className="text-[20px] font-bold text-[#004f32] tracking-tight mb-6">
        {dict.hotelDetail.similarHotels}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {hotels.map((hotel) => {
          const hotelSlug = hotel.slug || `${createSlug(hotel.name)}-${hotel.id}`;
          const isLiked = isClient ? isFavorite(hotelSlug, 'hotel') : false;

          return (
            <Link href={`/hotel/${hotelSlug}`} key={hotel.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col bg-white hover:shadow-md transition-shadow group cursor-pointer block">
              {/* Image Area */}
              <div className="w-full h-[200px] relative">
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                  fill
                  unoptimized={hotel.image ? (hotel.image.includes('127.0.0.1') || hotel.image.includes('localhost')) : false}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Save Heart Button */}
                <button
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    toggleFavorite({
                      id: hotelSlug,
                      type: 'hotel',
                      title: hotel.name,
                      image: hotel.image,
                      url: `/hotel/${hotelSlug}`
                    });
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                >
                  <Heart className={`w-4 h-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-black stroke-[1.5]"}`} strokeWidth={isLiked ? 0 : 1.5} />
                </button>
              </div>

              {/* Info Area */}
              <div className="flex flex-col flex-1 p-4">
                <h3 className="font-bold text-[15px] text-gray-900 leading-snug line-clamp-2 min-h-[44px]">
                  {hotel.name}
                </h3>

                <div className="flex items-center text-sm text-gray-700 mt-1">
                  <span className="font-medium mr-1.5 text-[13px]">{Number.isInteger(hotel.rating) ? hotel.rating.toFixed(1) : hotel.rating}</span>
                  <RatingStars score={hotel.rating} />
                  <span className="text-[12px] underline decoration-gray-400 underline-offset-2 ml-1.5 cursor-pointer hover:text-gray-900">
                    ({hotel.reviews} {dict.home.reviews})
                  </span>
                </div>

                <div className="mt-3">
                  <LiveListPrice hotelName={hotel.name} fallbackPrice={hotel.price} bulkPrice={hotel.price} priceUpdatedAt={hotel.price_updated_at} fontSize="16px" />
                </div>

                <div className="mt-auto pt-4">
                  <button className="w-full py-2.5 rounded-full bg-[#34e065] hover:bg-[#2fc458] text-black font-bold text-[14px] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#34e065]">
                    {dict.hotelDetail.viewHotel}
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
