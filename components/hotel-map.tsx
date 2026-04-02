"use client";

import { MapPin, ExternalLink, Map } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/app/providers";

interface HotelMapProps {
  hotelName: string;
  address?: string;
}

export function HotelMap({ hotelName, address }: HotelMapProps) {
  const { dict, locale } = useLanguage();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Build query string for Google Maps
  const query = [hotelName, address].filter(Boolean).join(", ");
  const encodedQuery = encodeURIComponent(query);

  // Google Maps URLs
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodedQuery}&output=embed&z=16`;

  if (!query) return null;

  return (
    <div className="w-full border border-gray-200 rounded-2xl overflow-hidden my-8 shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[#004f32]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] text-gray-500 font-medium">
              {locale === "vi" ? "Địa chỉ" : "Address"}
            </p>
            <p className="text-[14px] font-bold text-gray-900 leading-tight">
              {address || hotelName}
            </p>
          </div>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[13px] font-bold text-[#004f32] hover:text-[#003d27] transition-colors shrink-0 ml-4"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {locale === "vi" ? "Mở Google Maps" : "Open in Google Maps"}
        </a>
      </div>

      {/* Map area */}
      {!showMap ? (
        /* Placeholder button to lazy-load map */
        <button
          onClick={() => setShowMap(true)}
          className="w-full h-[200px] bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center gap-3 group hover:from-green-50 hover:to-gray-50 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Map className="w-7 h-7 text-[#004f32]" />
          </div>
          <span className="text-[14px] font-semibold text-gray-600 group-hover:text-[#004f32] transition-colors">
            {locale === "vi" ? "Nhấn để xem bản đồ" : "Click to view map"}
          </span>
        </button>
      ) : (
        /* Google Maps embed — only loads when user clicks */
        <div className="relative w-full h-[280px]">
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-3 border-[#004f32] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setMapLoaded(true)}
            title={`Map of ${hotelName}`}
          />
          {/* Click overlay to open full Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-20 cursor-pointer"
            aria-label={`Open ${hotelName} in Google Maps`}
          />
        </div>
      )}
    </div>
  );
}
