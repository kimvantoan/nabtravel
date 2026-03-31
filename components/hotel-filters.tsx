"use client";

import { useState } from "react";
import { Filter, ChevronUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/app/providers";

export function HotelFilters() {
  const { dict, locale } = useLanguage();
  const [priceRange, setPriceRange] = useState(5000000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Accordion states
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(true);
  const [isClassOpen, setIsClassOpen] = useState(true);
  const [isStyleOpen, setIsStyleOpen] = useState(true);
  
  // Show more/less states
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);

  const handleClearFilters = () => {
    setPriceRange(20000000);
    setSelectedAmenities([]);
  };

  return (
    <div className="bg-white p-4 lg:p-5 lg:rounded-xl lg:border lg:border-gray-100 lg:shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-[#004f32] text-lg flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {dict.hotelsPage?.filters || "Bộ lọc"}
        </h3>
        <button 
          onClick={handleClearFilters}
          className="text-[13px] font-semibold text-gray-500 hover:text-black underline-offset-4 hover:underline transition-all"
        >
          {dict.hotelsPage?.clearAll || "Xóa bộ lọc"}
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 text-[15px] mb-3 truncate">{dict.hotelsPage?.priceRange || "Khoảng giá (Mỗi đêm)"}</h4>
        <input 
          type="range" 
          min="0" 
          max="20000000" 
          step="500000"
          value={priceRange} 
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-green-600 mb-2 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[13px] font-semibold text-gray-700">
          <span>0 ₫</span>
          <span>{priceRange.toLocaleString("vi-VN")} ₫+</span>
        </div>
      </div>

      <div className="h-px w-full bg-gray-100 mb-5" />

      {/* Amenities */}
      <div className="mb-2">
        <div 
          className="flex items-center justify-between cursor-pointer group mb-4"
          onClick={() => setIsAmenitiesOpen(!isAmenitiesOpen)}
        >
          <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-black transition-colors truncate">{dict.hotelsPage?.amenities || "Tiện nghi"}</h4>
          <ChevronUp className={`w-5 h-5 text-black transition-transform duration-200 ${!isAmenitiesOpen ? "rotate-180" : ""}`} strokeWidth={2} />
        </div>
        
        {isAmenitiesOpen && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
            {[
              dict.hotelsPage?.freeCancellation || "Hủy miễn phí", 
              dict.hotelsPage?.breakfastIncluded || "Bao gồm bữa sáng", 
              "Wifi miễn phí", 
              "Hồ bơi", 
              "Spa", 
              "Bãi đỗ xe",
            ].slice(0, showAllAmenities ? undefined : 4).map((amenity, idx) => (
              <label key={idx} className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedAmenities.includes(amenity)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedAmenities([...selectedAmenities, amenity]);
                    else setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
                  }}
                  className="w-[18px] h-[18px] rounded-[4px] border border-gray-300 text-green-600 focus:ring-green-600 accent-green-600 cursor-pointer shrink-0" 
                />
                <span className="text-[14px] text-gray-700 font-medium select-none group-hover:text-black transition-colors truncate">{amenity}</span>
              </label>
            ))}
            
            <button 
              onClick={() => setShowAllAmenities(!showAllAmenities)}
              className="flex items-center gap-1 font-bold text-black bg-transparent border-none mt-1 hover:underline transition-all text-[14px] w-fit"
            >
              {showAllAmenities ? (locale === 'vi' ? 'Rút gọn' : 'Show less') : (locale === 'vi' ? 'Xem thêm' : 'Show more')} 
              <ChevronUp className={`w-5 h-5 transition-transform ${!showAllAmenities ? "rotate-180" : ""}`} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      <div className="h-px w-full bg-gray-100 my-6" />

      {/* Hotel Class */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer group mb-4"
          onClick={() => setIsClassOpen(!isClassOpen)}
        >
          <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-black transition-colors">{dict.hotelsPage?.hotelClass || "Hotel class"}</h4>
          <ChevronUp className={`w-5 h-5 text-black transition-transform duration-200 ${!isClassOpen ? "rotate-180" : ""}`} strokeWidth={2} />
        </div>
        
        {isClassOpen && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
            {[
              dict.hotelsPage?.['5star'] || "5 Star",
              dict.hotelsPage?.['4star'] || "4 Star",
              dict.hotelsPage?.['3star'] || "3 Star"
            ].map((cls, idx) => (
              <label key={idx} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" className="w-[18px] h-[18px] rounded-[4px] border border-gray-300 text-green-600 focus:ring-green-600 accent-green-600 cursor-pointer shrink-0" />
                <span className="text-[14px] text-gray-700 font-medium select-none group-hover:text-black transition-colors">{cls}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="h-px w-full bg-gray-100 my-6" />

      {/* Style */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer group mb-4"
          onClick={() => setIsStyleOpen(!isStyleOpen)}
        >
          <h4 className="font-bold text-gray-900 text-[15px] group-hover:text-black transition-colors">{dict.hotelsPage?.style || "Style"}</h4>
          <ChevronUp className={`w-5 h-5 text-black transition-transform duration-200 ${!isStyleOpen ? "rotate-180" : ""}`} strokeWidth={2} />
        </div>
        
        {isStyleOpen && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
            {[
              dict.hotelsPage?.midRange || "Mid-range",
              dict.hotelsPage?.luxury || "Luxury",
              dict.hotelsPage?.familyFriendly || "Family-friendly",
              dict.hotelsPage?.business || "Business",
              dict.hotelsPage?.romantic || "Romantic",
              dict.hotelsPage?.modern || "Modern"
            ].slice(0, showAllStyles ? undefined : 4).map((style, idx) => (
              <label key={idx} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" className="w-[18px] h-[18px] rounded-[4px] border border-gray-300 text-green-600 focus:ring-green-600 accent-green-600 cursor-pointer shrink-0" />
                <span className="text-[14px] text-gray-700 font-medium select-none group-hover:text-black transition-colors">{style}</span>
              </label>
            ))}
            <button 
              onClick={() => setShowAllStyles(!showAllStyles)}
              className="flex items-center gap-1 font-bold text-black bg-transparent border-none mt-1 hover:underline transition-all text-[14px] w-fit"
            >
              {showAllStyles ? (locale === 'vi' ? 'Rút gọn' : 'Show less') : (locale === 'vi' ? 'Xem thêm' : 'Show more')} 
              <ChevronUp className={`w-5 h-5 transition-transform ${!showAllStyles ? "rotate-180" : ""}`} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
