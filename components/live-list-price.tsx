"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/app/providers";

import { differenceInDays } from "date-fns";

// Global queue to prevent RapidAPI 429 Rate Limit Errors
const fetchQueue: (() => Promise<void>)[] = [];
let isFetchingQueue = false;

async function processQueue() {
  if (isFetchingQueue || fetchQueue.length === 0) return;
  isFetchingQueue = true;
  while (fetchQueue.length > 0) {
    const task = fetchQueue.shift();
    if (task) {
      await task();
      // Delay 1000ms between requests to respect the free-tier API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  isFetchingQueue = false;
}

export function LiveListPrice({
  hotelName,
  fallbackPrice,
  priceUpdatedAt,
  fontSize = "15px",
  checkin,
  checkout,
  adults,
  rooms,
  bulkPrice,
  isFetchingBulk
}: {
  hotelName: string,
  fallbackPrice: number | string,
  priceUpdatedAt?: string | null,
  fontSize?: string,
  checkin?: string,
  checkout?: string,
  adults?: number,
  rooms?: number,
  bulkPrice?: number,
  isFetchingBulk?: boolean
}) {
  const { locale } = useLanguage();
  const [livePrice, setLivePrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Always clear old price when dates change so we fetch fresh
    setLivePrice(null);

    const isCustomDate = !!(checkin && checkout) || (adults !== undefined && adults !== 2) || (rooms !== undefined && rooms !== 1);

    // 1. Check if DB price is fresh ONLY IF NO CUSTOM DATES
    if (priceUpdatedAt && !isCustomDate) {
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

    // 1.5 Handle Bulk Architecture (Highest Priority if active)
    if (isFetchingBulk) {
      setIsLoading(true);
      return;
    }
    
    if (bulkPrice !== undefined) {
      setIsLoading(false);
      const formatter = new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
      });
      setLivePrice(formatter.format(bulkPrice));
      return; // Skip intersection observer!
    }

    // 2. Otherwise, use IntersectObserver to lazy-load fresh price (Fallback Legacy Mode)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          setIsLoading(true);

          // Add fetch task to queue
          fetchQueue.push(async () => {
            try {
              let url = `/api/hotel-price-by-name?name=${encodeURIComponent(hotelName)}`;
              if (checkin && checkout) url += `&checkin=${checkin}&checkout=${checkout}`;
              if (adults) url += `&adults=${adults}`;
              if (rooms) url += `&rooms=${rooms}`;
              
              const r = await fetch(url);
              const data = r.ok ? await r.json() : null;
              if (data && data.price) {
                const formatter = new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', {
                  style: 'currency',
                  currency: data.currency || 'VND',
                  maximumFractionDigits: 0
                });
                setLivePrice(formatter.format(data.price));
              }
            } catch {
              // Ignore errors
            } finally {
              setIsLoading(false);
            }
          });

          processQueue();
        }
      },
      { rootMargin: "100px" } // trigger 100px before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hotelName, locale, priceUpdatedAt, fallbackPrice, checkin, checkout, adults, rooms, bulkPrice, isFetchingBulk]);

  // Math-derived fallback for instantaneous UI feel
  const numNights = Math.max(1, (checkin && checkout) ? differenceInDays(new Date(checkout), new Date(checkin)) : 1);
  const totalFallback = typeof fallbackPrice === 'number' ? fallbackPrice * numNights * (rooms || 1) : fallbackPrice;

  // Format the visual price correctly
  const renderFallback = typeof totalFallback === 'number'
    ? new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(totalFallback)
    : totalFallback;

  return (
    <div ref={containerRef} className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
      {isLoading ? (
        <span className={`font-bold text-gray-400 whitespace-nowrap text-[${fontSize}] animate-pulse`}>
          {renderFallback}
        </span>
      ) : livePrice ? (
        <span className={`font-bold text-black whitespace-nowrap text-[${fontSize}] animate-in fade-in duration-500`}>
          {livePrice}
        </span>
      ) : (
        <span className={`font-bold text-black whitespace-nowrap text-[${fontSize}]`}>
          {renderFallback}
        </span>
      )}
    </div>
  );
}
