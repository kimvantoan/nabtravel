"use client";

import { useState, useMemo } from "react";
import { Filter, ChevronUp } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { HotelGridData } from "./hotel-grid-card";

export interface HotelFiltersProps {
  initialHotels: HotelGridData[];
  selectedPropertyTypes: string[];
  setSelectedPropertyTypes: (v: string[]) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  selectedNeighborhoods: string[];
  setSelectedNeighborhoods: (v: string[]) => void;
  selectedStars: number[];
  setSelectedStars: (v: number[]) => void;
}

export function HotelFilters({
  initialHotels,
  selectedPropertyTypes,
  setSelectedPropertyTypes,
  maxPrice,
  setMaxPrice,
  selectedNeighborhoods,
  setSelectedNeighborhoods,
  selectedStars,
  setSelectedStars,
}: HotelFiltersProps) {
  const { dict } = useLanguage();
  const hp = dict.hotelsPage as any;

  // Accordion states
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(true);
  const [isPriceLevelOpen, setIsPriceLevelOpen] = useState(true);
  const [isNeighborhoodOpen, setIsNeighborhoodOpen] = useState(true);
  const [isStarOpen, setIsStarOpen] = useState(true);

  // Compute unique property type counts
  const propertyTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialHotels.forEach(h => {
      const type = h.propertyType || (hp?.otherType ?? "Other");
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [initialHotels, hp]);

  // Compute highest price for slider max limit
  const highestPriceInList = useMemo(() => {
    let max = 0;
    initialHotels.forEach(h => {
      if (h.price > max) max = h.price;
    });
    return Math.max(1000000, Math.ceil(max / 1000000) * 1000000);
  }, [initialHotels]);

  // Compute Star rating counts
  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    initialHotels.forEach(h => {
      const stars = h.stars || 3;
      counts[stars] = (counts[stars] || 0) + 1;
    });
    return Object.entries(counts).filter(([_, count]) => count > 0).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [initialHotels]);

  // Compute unique neighborhood counts
  const neighborhoodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialHotels.forEach(h => {
      const hood = h.neighborhood || (hp?.commonArea ?? "General area");
      counts[hood] = (counts[hood] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [initialHotels, hp]);

  const handleClearFilters = () => {
    setSelectedPropertyTypes([]);
    setMaxPrice(0);
    setSelectedNeighborhoods([]);
    setSelectedStars([]);
  };

  const toggleArrayItem = <T,>(item: T, selected: T[], setSelected: (v: T[]) => void) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const totalActive = selectedPropertyTypes.length + (maxPrice > 0 ? 1 : 0) + selectedNeighborhoods.length + selectedStars.length;

  return (
    <div className="bg-white p-4 lg:p-5 lg:rounded-xl lg:border lg:border-gray-100 lg:shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-[#004f32] text-lg flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {hp?.filterTitle ?? "Filters"}
          {totalActive > 0 && (
            <span className="ml-1 bg-[#004f32] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalActive}
            </span>
          )}
        </h3>
        <button
          onClick={handleClearFilters}
          className="text-[13px] font-semibold text-gray-500 hover:text-black underline-offset-4 hover:underline transition-all"
        >
          {hp?.clearFilters ?? "Clear filters"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Budget / Price Slider */}
        <div className="border-t border-gray-100 pt-5">
          <button
            onClick={() => setIsPriceLevelOpen(!isPriceLevelOpen)}
            className="flex items-center justify-between w-full text-left group"
          >
            <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-[#004f32] transition-colors">
              {hp?.maxPricePerNight ?? "Mức giá tối đa (1 đêm)"}
            </h4>
            <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${!isPriceLevelOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`mt-3 space-y-3 overflow-hidden transition-all duration-300 ${isPriceLevelOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex justify-between font-medium text-[14px]">
              <span>0 ₫</span>
              <span className="text-[#004f32] font-bold">
                {maxPrice === 0 || maxPrice >= highestPriceInList ? (hp?.unlimited ?? "Không giới hạn") : `${maxPrice.toLocaleString('vi-VN')} ₫`}
              </span>
            </div>
            <input
              type="range"
              min="100000"
              max={highestPriceInList}
              step="100000"
              value={maxPrice === 0 ? highestPriceInList : maxPrice}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMaxPrice(val >= highestPriceInList ? 0 : val);
              }}
              className="w-full accent-[#004f32] cursor-pointer"
            />
          </div>
        </div>

        {/* Star Rating Section */}
        {starCounts.length > 1 && (
          <div className="border-t border-gray-100 pt-5">
            <button
              onClick={() => setIsStarOpen(!isStarOpen)}
              className="flex items-center justify-between w-full text-left group"
            >
              <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-[#004f32] transition-colors">
                {hp?.starRating ?? "Hạng sao"}
              </h4>
              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${!isStarOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`mt-3 space-y-2.5 overflow-hidden transition-all duration-300 ${isStarOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {starCounts.map(([stars, count]) => (
                <label key={stars} className="flex items-start gap-3 group cursor-pointer">
                  <div className="relative flex items-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedStars.includes(Number(stars))}
                      onChange={() => toggleArrayItem(Number(stars), selectedStars, setSelectedStars)}
                      className="w-4 h-4 border-2 border-gray-300 rounded-[4px] text-[#004f32] focus:ring-[#003d27] transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-1 justify-between text-[14px] leading-tight select-none items-center">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Number(stars) }).map((_, i) => (
                        <span key={i} className="text-[#FFB800] text-[14px]">★</span>
                      ))}
                    </div>
                    <span className="text-gray-400 text-[13px]">{count}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Property Types */}
        {propertyTypeCounts.length > 1 && (
          <div className="border-t border-gray-100 pt-5">
            <button
              onClick={() => setIsPropertyTypeOpen(!isPropertyTypeOpen)}
              className="flex items-center justify-between w-full text-left group"
            >
              <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-[#004f32] transition-colors">
                {hp?.propertyTypeLabel ?? "Property type"}
              </h4>
              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${!isPropertyTypeOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`mt-3 space-y-2.5 overflow-hidden transition-all duration-300 ${isPropertyTypeOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {propertyTypeCounts.map(([type, count]) => (
                <label key={type} className="flex items-start gap-3 group cursor-pointer">
                  <div className="relative flex items-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedPropertyTypes.includes(type)}
                      onChange={() => toggleArrayItem(type, selectedPropertyTypes, setSelectedPropertyTypes)}
                      className="w-4 h-4 border-2 border-gray-300 rounded-[4px] text-[#004f32] focus:ring-[#003d27] transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-1 justify-between text-[14px] leading-tight select-none">
                    <span className={`transition-colors ${selectedPropertyTypes.includes(type) ? 'text-[#004f32] font-semibold' : 'text-gray-700'}`}>
                      {type}
                    </span>
                    <span className="text-gray-400 text-[13px]">{count}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Neighborhoods */}
        {neighborhoodCounts.length > 1 && (
          <div className="border-t border-gray-100 pt-5">
            <button
              onClick={() => setIsNeighborhoodOpen(!isNeighborhoodOpen)}
              className="flex items-center justify-between w-full text-left group"
            >
              <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-[#004f32] transition-colors">
                {hp?.neighborhoodLabel ?? "Neighborhood"}
              </h4>
              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${!isNeighborhoodOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`mt-3 space-y-2.5 overflow-hidden transition-all duration-300 ${isNeighborhoodOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {neighborhoodCounts.map(([hood, count]) => (
                <label key={hood} className="flex items-start gap-3 group cursor-pointer">
                  <div className="relative flex items-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedNeighborhoods.includes(hood)}
                      onChange={() => toggleArrayItem(hood, selectedNeighborhoods, setSelectedNeighborhoods)}
                      className="w-4 h-4 border-2 border-gray-300 rounded-[4px] text-[#004f32] focus:ring-[#003d27] transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-1 justify-between text-[14px] leading-tight select-none">
                    <span className={`transition-colors line-clamp-2 pr-2 ${selectedNeighborhoods.includes(hood) ? 'text-[#004f32] font-semibold' : 'text-gray-700'}`}>
                      {hood}
                    </span>
                    <span className="text-gray-400 text-[13px] shrink-0">{count}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
