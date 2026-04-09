"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/app/providers";

export interface IconicDestination {
  id: string;
  name: string;
  image: string;
  properties_count?: number;
}

interface IconicDestinationsProps {
  destinations: IconicDestination[];
}

export function IconicDestinations({ destinations }: IconicDestinationsProps) {
  const { dict } = useLanguage();

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {dict.home.iconicSpots || "Điểm đến đang thịnh hành"}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Các lựa chọn phổ biến nhất cho du khách từ Việt Nam
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {destinations.slice(0, 5).map((dest, index) => {
          // 2 items in first row (span-3), 3 items in second row (span-2)
          const spanClass = index < 2 ? "md:col-span-3" : "md:col-span-2";
          const searchSlug = encodeURIComponent(dest.name);

          return (
            <Link
              href={`/hotels?search=${searchSlug}`}
              key={dest.id}
              className={`relative h-[220px] md:h-[280px] rounded-xl overflow-hidden cursor-pointer group/card block ${spanClass}`}
            >
              {dest.image ? (
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm text-gray-500">No Image</span>
                </div>
              )}

              {/* Top Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Text Top Left */}
              <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
                <h3 className="text-white text-xl md:text-2xl font-bold drop-shadow-md leading-tight">
                  {dest.name}
                </h3>
                {/* Vietnamese Flag Icon */}
                <div className="bg-red-600 w-6 h-5 flex items-center justify-center rounded-[2px] shadow-sm">
                  <span className="text-yellow-400 text-[14px] leading-none mb-[2px]">★</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
