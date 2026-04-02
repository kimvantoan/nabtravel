"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/app/providers";

export function LiveListPrice({ 
  hotelName, 
  fallbackPrice,
  priceUpdatedAt,
  fontSize = "15px"
}: { 
  hotelName: string, 
  fallbackPrice: number | string,
  priceUpdatedAt?: string | null,
  fontSize?: string
}) {
  const { locale } = useLanguage();
  const [livePrice, setLivePrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Check if DB price is fresh (e.g., < 6 hours old)
    if (priceUpdatedAt) {
      const updatedAtFormat = new Date(priceUpdatedAt).getTime();
      const now = new Date().getTime();
      const hoursDiff = (now - updatedAtFormat) / (1000 * 60 * 60);
      
      if (hoursDiff < 6 && typeof fallbackPrice === 'number') {
        // Highly fresh! Don't consume RapidAPI. Format and show DB price immediately
        const formatter = new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', {
          style: 'currency',
          currency: 'VND', // Defaulting to VND since Backend price is mostly VND
          maximumFractionDigits: 0
        });
        setLivePrice(formatter.format(fallbackPrice));
        return;
      }
    }

    // 2. Otherwise, use IntersectObserver to lazy-load fresh price
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          setIsLoading(true);
          fetch(`/api/hotel-price-by-name?name=${encodeURIComponent(hotelName)}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data && data.price) {
                const formatter = new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', {
                  style: 'currency',
                  currency: data.currency || 'VND',
                  maximumFractionDigits: 0
                });
                setLivePrice(formatter.format(data.price));
              }
              setIsLoading(false);
            })
            .catch(() => {
              setIsLoading(false);
            });
        }
      },
      { rootMargin: "100px" } // trigger 100px before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hotelName, locale, priceUpdatedAt, fallbackPrice]);

  return (
    <div ref={containerRef} className="flex items-center">
      {isLoading ? (
        <span className="text-gray-400 text-sm animate-pulse whitespace-nowrap">
          {locale === "vi" ? "Đang tải giá..." : "Loading price..."}
        </span>
      ) : livePrice ? (
        <span className={`font-bold text-black whitespace-nowrap text-[${fontSize}]`}>
          {livePrice}
        </span>
      ) : (
        <span className={`font-bold text-black whitespace-nowrap text-[${fontSize}]`}>
          {typeof fallbackPrice === 'number' 
            ? new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(fallbackPrice)
            : fallbackPrice}
        </span>
      )}
    </div>
  );
}
