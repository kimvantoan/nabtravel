"use client";

import { useState, useMemo } from "react";
import { Filter, ChevronUp } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { HotelGridData } from "./hotel-grid-card";

export interface HotelFiltersProps {
  initialHotels: HotelGridData[];
  selectedPropertyTypes: string[];
  setSelectedPropertyTypes: (v: string[]) => void;
  selectedPriceBuckets: string[];
  setSelectedPriceBuckets: (v: string[]) => void;
  selectedNeighborhoods: string[];
  setSelectedNeighborhoods: (v: string[]) => void;
  selectedStars: number[];
  setSelectedStars: (v: number[]) => void;
  selectedReviewScores: number[];
  setSelectedReviewScores: (v: number[]) => void;
}

export function HotelFilters({
  initialHotels,
  selectedPropertyTypes,
  setSelectedPropertyTypes,
  selectedPriceBuckets,
  setSelectedPriceBuckets,
  selectedNeighborhoods,
  setSelectedNeighborhoods,
  selectedStars,
  setSelectedStars,
  selectedReviewScores,
  setSelectedReviewScores,
}: HotelFiltersProps) {
  const { dict } = useLanguage();
  const hp = dict.hotelsPage as any;

  // Accordion states
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(true);
  const [isPriceLevelOpen, setIsPriceLevelOpen] = useState(true);
  const [isNeighborhoodOpen, setIsNeighborhoodOpen] = useState(true);
  const [isStarOpen, setIsStarOpen] = useState(true);
  const [isReviewScoreOpen, setIsReviewScoreOpen] = useState(true);

  // Compute unique property type counts
  const propertyTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialHotels.forEach(h => {
      const type = h.propertyType || (hp?.otherType ?? "Other");
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [initialHotels, hp]);

  const PRICE_BUCKETS = useMemo(() => [
    { id: 'under1M', label: hp?.under1M ?? "Dưới 1 triệu" },
    { id: '1Mto2M', label: hp?.["1Mto2M"] ?? "1 triệu - 2 triệu" },
    { id: '2Mto3_5M', label: hp?.["2Mto3_5M"] ?? "2 triệu - 3.5 triệu" },
    { id: 'over3_5M', label: hp?.over3_5M ?? "Trên 3.5 triệu" }
  ], [hp]);

  // Compute price bucket counts
  const priceCounts = useMemo(() => {
    const counts: Record<string, number> = { 'under1M': 0, '1Mto2M': 0, '2Mto3_5M': 0, 'over3_5M': 0 };
    initialHotels.forEach(h => {
      const p = h.price;
      if (p < 1000000) counts['under1M']++;
      else if (p < 2000000) counts['1Mto2M']++;
      else if (p < 3500000) counts['2Mto3_5M']++;
      else counts['over3_5M']++;
    });
    return counts;
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

  // Review Score Setup
  const SCORE_BUCKETS = useMemo(() => [
    { value: 9.5, label: hp?.scoreExceptional ?? "Đặc biệt: 9.5+ điểm" },
    { value: 9, label: hp?.scoreExcellent ?? "Tuyệt hảo: 9.0+ điểm" },
    { value: 8.5, label: hp?.scoreFabulous ?? "Rất tốt: 8.5+ điểm" },
    { value: 8, label: hp?.scoreVeryGood ?? "Tốt: 8.0+ điểm" }
  ], [hp]);

  // Compute Review Score counts
  const reviewScoreCounts = useMemo(() => {
    const counts: Record<number, number> = { 9.5: 0, 9: 0, 8.5: 0, 8: 0 };
    initialHotels.forEach(h => {
      const rating = h.rating || 0;
      if (rating >= 9.5) counts[9.5]++;
      if (rating >= 9) counts[9]++;
      if (rating >= 8.5) counts[8.5]++;
      if (rating >= 8) counts[8]++; // Cumulative counts for OTA standards
    });
    return counts;
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
    setSelectedPriceBuckets([]);
    setSelectedNeighborhoods([]);
    setSelectedStars([]);
    setSelectedReviewScores([]);
  };

  const toggleArrayItem = <T,>(item: T, selected: T[], setSelected: (v: T[]) => void) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const totalActive = selectedPropertyTypes.length + selectedPriceBuckets.length + selectedNeighborhoods.length + selectedStars.length + selectedReviewScores.length;

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
        {/* Budget / Price Section */}
        <div className="border-t border-gray-100 pt-5">
          <button
            onClick={() => setIsPriceLevelOpen(!isPriceLevelOpen)}
            className="flex items-center justify-between w-full text-left group"
          >
            <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-[#004f32] transition-colors">
              {hp?.budgetLabel ?? "Mức ngân sách"}
            </h4>
            <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${!isPriceLevelOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`mt-3 space-y-2.5 overflow-hidden transition-all duration-300 ${isPriceLevelOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {PRICE_BUCKETS.map((bucket) => {
              if (priceCounts[bucket.id] === 0) return null;
              return (
                <label key={bucket.id} className="flex items-start gap-3 group cursor-pointer">
                  <div className="relative flex items-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedPriceBuckets.includes(bucket.id)}
                      onChange={() => toggleArrayItem(bucket.id, selectedPriceBuckets, setSelectedPriceBuckets)}
                      className="w-4 h-4 border-2 border-gray-300 rounded-[4px] text-[#004f32] focus:ring-[#003d27] transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-1 justify-between text-[14px] leading-tight select-none items-center">
                    <span className={`transition-colors ${selectedPriceBuckets.includes(bucket.id) ? 'text-[#004f32] font-semibold' : 'text-gray-700'}`}>
                      {bucket.label}
                    </span>
                    <span className="text-gray-400 text-[13px]">{priceCounts[bucket.id]}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Review Score Section */}
        <div className="border-t border-gray-100 pt-5">
          <button
            onClick={() => setIsReviewScoreOpen(!isReviewScoreOpen)}
            className="flex items-center justify-between w-full text-left group"
          >
            <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-[#004f32] transition-colors">
              {hp?.reviewScore ?? "Điểm đánh giá"}
            </h4>
            <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${!isReviewScoreOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`mt-3 space-y-2.5 overflow-hidden transition-all duration-300 ${isReviewScoreOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {SCORE_BUCKETS.map((bucket) => {
              if (reviewScoreCounts[bucket.value] === 0) return null;
              return (
                <label key={bucket.value} className="flex items-start gap-3 group cursor-pointer">
                  <div className="relative flex items-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={selectedReviewScores.includes(bucket.value)}
                      onChange={() => toggleArrayItem(bucket.value, selectedReviewScores, setSelectedReviewScores)}
                      className="w-4 h-4 border-2 border-gray-300 rounded-[4px] text-[#004f32] focus:ring-[#003d27] transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-1 justify-between text-[14px] leading-tight select-none items-center">
                    <span className={`transition-colors ${selectedReviewScores.includes(bucket.value) ? 'text-[#004f32] font-semibold' : 'text-gray-700'}`}>
                      {bucket.label}
                    </span>
                    <span className="text-gray-400 text-[13px]">{reviewScoreCounts[bucket.value]}</span>
                  </div>
                </label>
              );
            })}
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
