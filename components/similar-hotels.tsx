"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { LiveListPrice } from "./live-list-price";

export interface SimilarHotelData {
  id: string | number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  price_updated_at?: string;
}

function Rating({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((bubble) => {
        const isFull = score >= bubble;
        const isHalf = score >= bubble - 0.5 && score < bubble;

        if (isFull) {
          return (
            <svg key={bubble} width="12" height="12" viewBox="0 0 16 16" fill="#00aa6c" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="8" />
            </svg>
          );
        } else if (isHalf) {
          return (
            <svg key={bubble} width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id={`half-${bubble}`}>
                  <rect x="0" y="0" width="8" height="16" />
                </clipPath>
              </defs>
              <circle cx="8" cy="8" r="7.5" fill="none" stroke="#00aa6c" strokeWidth="1" />
              <circle cx="8" cy="8" r="8" fill="#00aa6c" clipPath={`url(#half-${bubble})`} />
            </svg>
          );
        } else {
          return (
            <svg key={bubble} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#00aa6c" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7.5" />
            </svg>
          );
        }
      })}
    </div>
  );
}

export function SimilarHotels({ hotels = [] }: { hotels?: SimilarHotelData[] }) {
  const { dict } = useLanguage();
  if (!hotels || hotels.length === 0) return null;

  return (
    <section className="w-full mt-4 border-t border-gray-200 py-10">
      <h2 className="text-[20px] font-bold text-[#004f32] tracking-tight mb-6">
        {dict.hotelDetail.similarHotels}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {hotels.map((hotel) => (
          <Link href={`/hotel/${encodeURIComponent(hotel.name)}`} key={hotel.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col bg-white hover:shadow-md transition-shadow group cursor-pointer block">
            {/* Image Area */}
            <div className="w-full h-[200px] relative">
              <Image
                src={hotel.image}
                alt={hotel.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Save Heart Button */}
              <button
                onClick={(e) => e.preventDefault()}
                className="absolute top-3 right-3 w-8 h-8 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
              >
                <Heart className="w-4 h-4 text-black stroke-[1.5]" />
              </button>
            </div>

            {/* Info Area */}
            <div className="flex flex-col flex-1 p-4">
              <h3 className="font-bold text-[15px] text-gray-900 leading-snug line-clamp-2 min-h-[44px]">
                {hotel.name}
              </h3>

              <div className="flex items-center text-sm text-gray-700 mt-1">
                <span className="font-medium mr-1.5 text-[13px]">{Number.isInteger(hotel.rating) ? hotel.rating.toFixed(1) : hotel.rating}</span>
                <Rating score={hotel.rating} />
                <span className="text-[12px] underline decoration-gray-400 underline-offset-2 ml-1.5 cursor-pointer hover:text-gray-900">
                  ({hotel.reviews} {dict.home.reviews})
                </span>
              </div>

              <div className="mt-3">
                <LiveListPrice hotelName={hotel.name} fallbackPrice={hotel.price} priceUpdatedAt={hotel.price_updated_at} fontSize="16px" />
              </div>

              <div className="mt-auto pt-4">
                <button className="w-full py-2.5 rounded-full bg-[#34e065] hover:bg-[#2fc458] text-black font-bold text-[14px] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#34e065]">
                  {dict.hotelDetail.viewHotel}
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
