"use client";

import { useLanguage } from "@/app/providers";
import { HotelFilters } from "@/components/hotel-filters";
import { HotelGridCard, HotelGridData } from "@/components/hotel-grid-card";
import { ChevronDown, SlidersHorizontal, Search } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { format, addDays } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop"
];

const SORT_OPTIONS = [
  { id: "recommended", labelKey: "recommended" },
  { id: "priceLowToHigh", labelKey: "priceLowToHigh" },
  { id: "priceHighToLow", labelKey: "priceHighToLow" },
  { id: "topReviewed", labelKey: "topReviewed" },
];

function SkeletonHotelGridCard() {
  return (
    <div className="bg-white rounded-[16px] md:rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full min-h-[380px] animate-pulse">
      <div className="relative w-full aspect-[4/3] bg-gray-200 shrink-0"></div>
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div className="flex flex-col gap-3">
          <div className="h-5 bg-gray-200 rounded-md w-full"></div>
          <div className="h-5 bg-gray-200 rounded-md w-2/3"></div>
          <div className="flex gap-2">
            <div className="w-10 h-4 bg-gray-200 rounded"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-end">
          <div className="h-3 bg-gray-200 rounded-md w-20"></div>
          <div className="h-6 bg-gray-200 rounded-md w-24"></div>
        </div>
      </div>
    </div>
  );
}

const VIETNAM_DESTINATIONS = [
  "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Nha Trang", 
  "Phú Quốc", "Vũng Tàu", "Hội An", "Sapa", "Quy Nhơn", 
  "Phan Thiết", "Cần Thơ", "Huế", "Hạ Long", "Ninh Bình",
  "Đồng Hới", "Tuy Hòa", "Thanh Hóa", "Vinh", "Buôn Ma Thuột"
];

export function HotelsClientView({ initialHotels, initialSearchQuery = "" }: { initialHotels: HotelGridData[], initialSearchQuery?: string }) {
  const { dict, locale } = useLanguage();
  const hp = dict.hotelsPage as any;
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  // States
  const [sortOption, setSortOption] = useState("recommended");
  const [heroIndex, setHeroIndex] = useState(0);
  const parsedSearchQuery = useMemo(() => {
    if (!initialSearchQuery) return "";
    const createSlug = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    
    // Reverse lookup from existing data
    const destMatch = VIETNAM_DESTINATIONS.find(d => createSlug(d) === initialSearchQuery);
    if (destMatch) return destMatch;
    
    const hotelMatch = initialHotels.find(h => createSlug(h.name) === initialSearchQuery);
    if (hotelMatch) return hotelMatch.name;

    return initialSearchQuery.replace(/-/g, " ");
  }, [initialSearchQuery, initialHotels]);

  const [searchQuery, setSearchQuery] = useState(parsedSearchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

    // createSlug method removed in favor of URL parameter encoding
  
  // Hydrate currentPage safely without branching SSR/Client rendering logic
  useEffect(() => {
    const saved = sessionStorage.getItem('nabtravel_currentPage');
    if (saved) {
      setCurrentPage(parseInt(saved, 10));
    }
  }, []);
  const ITEMS_PER_PAGE = 30;

  const loaderRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedPriceBuckets, setSelectedPriceBuckets] = useState<string[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedReviewScores, setSelectedReviewScores] = useState<number[]>([]);
  
  // Date & Guest Picker State
  const dateLocale = locale === "vi" ? vi : enUS;
  
  // Initialize with exactly +8/+9 days to match backend and details page defaults
  const defaultDateFrom = addDays(new Date(), 8);
  const defaultDateTo = addDays(new Date(), 9);
  // Delay date initialization to Client-Side only to avoid SSR Hydration Mismatch (Timezone Differences)
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const [bulkPricesMap, setBulkPricesMap] = useState<Record<string, number>>({});
  const [isFetchingBulk, setIsFetchingBulk] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setDate({
      from: addDays(new Date(), 8),
      to: addDays(new Date(), 9)
    });
  }, []);

  const checkinStr = date?.from ? format(date.from, "yyyy-MM-dd") : undefined;
  const checkoutStr = date?.to ? format(date.to, "yyyy-MM-dd") : undefined;
  const defaultCheckin = format(defaultDateFrom, "yyyy-MM-dd");
  const defaultCheckout = format(defaultDateTo, "yyyy-MM-dd");
  
  // Optimization: If dates are strictly the +8/9 default, pass undefined so LiveListPrice can securely fetch from DB cache instead of RapidAPI
  const isDefaultDate = checkinStr === defaultCheckin && checkoutStr === defaultCheckout;
  const passedCheckin = isDefaultDate ? undefined : checkinStr;
  const passedCheckout = isDefaultDate ? undefined : checkoutStr;

  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sync pagination to session storage for Back-button scroll restoration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nabtravel_currentPage', currentPage.toString());
    }
  }, [currentPage]);

  // Autocomplete Suggestions Engine (Local Fuzzy Search - 0 API Requests)
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() && !isClient) return [];
    
    // Extract real city occurrences from DB for accurate smart suggestions
    const cityCounts: Record<string, number> = {};
    initialHotels.forEach(h => {
       if (h.location) {
          cityCounts[h.location] = (cityCounts[h.location] || 0) + 1;
       }
    });
    // Sort cities by hotel count descending
    const dbCities = Object.keys(cityCounts).sort((a, b) => cityCounts[b] - cityCounts[a]);
    
    // Merge DB cities with predefined list to guarantee all DB cities are searchable
    const allCities = Array.from(new Set([...dbCities, ...VIETNAM_DESTINATIONS]));

    // Default popular suggestions if empty string (Top 8 cities with most hotels)
    if (!searchQuery.trim()) {
      return allCities.slice(0, 8).map(city => ({ type: 'city', text: city }));
    }
    
    const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matches: {type: string, text: string}[] = [];
    
    // 1. Match Native Cities
    allCities.forEach(city => {
      if (city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)) {
        matches.push({ type: 'city', text: city });
      }
    });

    // 2. Match Native DB Hotels
    initialHotels.forEach(h => {
      if (h.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)) {
         if (matches.length < 15) matches.push({ type: 'hotel', text: h.name });
      }
    });

    // Extract neighborhoods
    const hoods = Array.from(new Set(initialHotels.map(h => h.neighborhood).filter(Boolean)));
    hoods.forEach(hood => {
      if (hood && hood.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)) {
        if (!matches.find(m => m.text === hood)) matches.push({ type: 'city', text: hood });
      }
    });
    
    return matches.slice(0, 8);
  }, [searchQuery, isClient, initialHotels]);

  // Đã gỡ bỏ BULK METASEARCH ENGINE tại Frontend vì giá đã được Server-side Cron Job cập nhật sẵn cực mượt vào DB.

  // Filter Algorithm
  const filteredHotels = initialHotels.filter(hotel => {
    // 1. Search Query (Đã loại bỏ lọc local theo Text, tránh nhảy màn hình ngay khi gõ. Chỉ tìm bằng nút Submit)
    
    // 2. Property Type
    if (selectedPropertyTypes.length > 0) {
      const hp = dict.hotelsPage as any;
      const type = hotel.propertyType || (hp?.otherType ?? "Other");
      if (!selectedPropertyTypes.includes(type)) return false;
    }

    // 3. Price Filter (Buckets)
    if (selectedPriceBuckets.length > 0) {
      let matchesPrice = false;
      const p = hotel.price;
      if (selectedPriceBuckets.includes('under1M') && p < 1000000) matchesPrice = true;
      if (selectedPriceBuckets.includes('1Mto2M') && p >= 1000000 && p < 2000000) matchesPrice = true;
      if (selectedPriceBuckets.includes('2Mto3_5M') && p >= 2000000 && p < 3500000) matchesPrice = true;
      if (selectedPriceBuckets.includes('over3_5M') && p >= 3500000) matchesPrice = true;
      
      if (!matchesPrice) return false;
    }

    // 4. Neighborhood
    if (selectedNeighborhoods.length > 0) {
      const hp = dict.hotelsPage as any;
      const hood = hotel.neighborhood || (hp?.commonArea ?? "Khu vực phổ biến");
      if (!selectedNeighborhoods.includes(hood)) return false;
    }

    // 5. Stars Rating
    if (selectedStars.length > 0) {
      const hStars = hotel.stars || 3;
      if (!selectedStars.includes(hStars)) return false;
    }

    // 6. Review Score Rating (>= minRequired)
    if (selectedReviewScores.length > 0) {
      const minRequired = Math.min(...selectedReviewScores);
      const hRating = hotel.rating || 0;
      if (hRating < minRequired) return false;
    }

    return true;
  });

  // Sort Algorithm
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortOption === 'priceLowToHigh') return a.price - b.price;
    if (sortOption === 'priceHighToLow') return b.price - a.price;
    if (sortOption === 'topReviewed') return b.reviews - a.reviews;
    // 'recommended' - sort by rating combined with reviews (mock algorithm)
    return (b.rating * b.reviews) - (a.rating * a.reviews);
  });

  // Pagination
  const totalPages = Math.ceil(sortedHotels.length / ITEMS_PER_PAGE);
  const paginatedHotels = sortedHotels.slice(0, currentPage * ITEMS_PER_PAGE);

  // Infinite scroll observer removed in favor of manual Load More button

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50/50 pb-20">

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 mt-6 md:mt-10 lg:mt-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar - Filters */}
          <div className="hidden lg:block w-[260px] xl:w-[320px] shrink-0 sticky top-28 h-fit">
            <HotelFilters
              initialHotels={initialHotels}
              selectedPropertyTypes={selectedPropertyTypes}
              setSelectedPropertyTypes={(v: string[]) => { setSelectedPropertyTypes(v); setCurrentPage(1); }}
              selectedPriceBuckets={selectedPriceBuckets}
              setSelectedPriceBuckets={(v: string[]) => { setSelectedPriceBuckets(v); setCurrentPage(1); }}
              selectedNeighborhoods={selectedNeighborhoods}
              setSelectedNeighborhoods={(v: string[]) => { setSelectedNeighborhoods(v); setCurrentPage(1); }}
              selectedStars={selectedStars}
              setSelectedStars={(v: number[]) => { setSelectedStars(v); setCurrentPage(1); }}
              selectedReviewScores={selectedReviewScores}
              setSelectedReviewScores={(v: number[]) => { setSelectedReviewScores(v); setCurrentPage(1); }}
            />
          </div>

          {/* Right Content - Grid */}
          <div className="flex-1 min-w-0">

            {/* Unified Search Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  const createSlug = (str: string) => {
                    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
                  };
                  window.location.href = `/hotels?search=${createSlug(searchQuery.trim())}`;
                } else {
                  window.location.href = `/hotels`;
                }
              }}
              className="flex flex-col md:flex-row gap-2.5 mb-8 relative z-50 bg-white p-2 md:p-3 rounded-2xl md:rounded-full shadow-lg border border-gray-200"
            >
              {/* Destination Input */}
              <label className="flex items-center flex-1 md:w-1/3 bg-transparent rounded-full px-4 md:px-5 py-2 hover:bg-gray-50 focus-within:bg-gray-50 transition-colors cursor-text relative">
                <Search className="w-5 h-5 text-gray-500 shrink-0 mr-2 md:mr-3" strokeWidth={2} />
                <div className="flex flex-col w-full cursor-text min-w-0">
                  <span className="text-[12px] xl:text-[13px] text-gray-600 font-medium block md:hidden xl:block">{dict.searchHero?.whereTo || "Vị trí"}</span>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onFocus={() => setShowSuggestions(true)}
                    // Delay blur so click events on suggestions register before unmounting
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                      setShowSuggestions(true);
                    }}
                    placeholder="Thành phố hoặc Khách sạn..."
                    className="w-full bg-transparent outline-none text-[15px] font-bold text-gray-900 placeholder:text-gray-400 cursor-text"
                    autoComplete="off"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                   <div className="absolute top-[110%] left-0 min-w-full md:w-[400px] lg:w-[440px] bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                     {suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={(e) => {
                            // Prevent focus loss to ensure onClick fires smoothly
                            e.preventDefault(); 
                          }}
                          onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             setSearchQuery(s.text);
                             setShowSuggestions(false);
                          }}
                          className="w-full text-left px-5 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors group"
                        >
                           <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#004f32] transition-colors">
                             {s.type === 'city' 
                                ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500 group-hover:text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500 group-hover:text-white"><path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 16a5 5 0 0 0-6 0"/><path d="M16 11h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M8 7h.01"/><rect x="4" y="2" width="16" height="20" rx="2"/></svg>
                             }
                           </div>
                           <span className="text-[15px] font-bold text-gray-800 line-clamp-1 group-hover:text-[#004f32]">{s.text}</span>
                        </button>
                     ))}
                   </div>
                )}
              </label>

              {/* Vertical Divider */}
              <div className="hidden md:block w-px h-10 bg-gray-300 my-auto" />

              {/* Date Pickers */}
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <div className="flex md:flex-1 cursor-pointer bg-transparent rounded-full hover:bg-gray-50 transition-colors">
                    <div className="flex-1 flex gap-3 items-center px-5 py-2 relative">
                      <CalendarIcon className="w-5 h-5 text-gray-500 shrink-0" strokeWidth={2} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] xl:text-[13px] text-gray-600 font-medium block md:hidden xl:block">{dict.hotelDetail?.checkIn || "Ngày nhận"} - {dict.hotelDetail?.checkOut || "Ngày trả"}</span>
                        <span className="text-[14px] xl:text-[15px] font-bold text-black mt-0.5 whitespace-nowrap truncate">
                          {isClient && date?.from ? `${format(date.from, "MMM d", { locale: dateLocale })} - ${date?.to ? format(date.to, "MMM d", { locale: dateLocale }) : ''}` : "Chọn ngày"}
                        </span>
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from || new Date()}
                    selected={date}
                    onSelect={(newDate) => { setDate(newDate); setCurrentPage(1); }}
                    numberOfMonths={2}
                    locale={dateLocale}
                    showOutsideDays={false}
                    disabled={(d) => d < new Date(new Date().setHours(0,0,0,0)) || d > addDays(new Date(), 365)}
                  />
                </PopoverContent>
              </Popover>

              {/* Vertical Divider */}
              <div className="hidden md:block w-px h-10 bg-gray-300 my-auto" />

              {/* Guests */}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex md:w-auto lg:flex-1 xl:w-[220px] cursor-pointer bg-transparent rounded-full px-3 md:px-5 py-2 hover:bg-gray-50 transition-colors items-center gap-2 md:gap-3">
                    <Users className="w-5 h-5 text-gray-500 shrink-0" strokeWidth={2} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] xl:text-[13px] text-gray-600 font-medium block md:hidden xl:block">{dict.hotelDetail?.roomsGuests || "Khách"}</span>
                      <span className="text-[14px] xl:text-[15px] font-bold text-black mt-0.5 whitespace-nowrap truncate">
                        {rooms} {locale === "vi" ? "P" : "Rm"}, {adults} {locale === "vi" ? "Khách" : "Guests"}
                      </span>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 rounded-xl shadow-lg border-gray-200" align="end">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[15px]">{locale === "vi" ? "Số phòng" : "Rooms"}</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => { setRooms(Math.max(1, rooms - 1)); setCurrentPage(1); }} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30" disabled={rooms <= 1}>-</button>
                        <span className="font-medium w-4 text-center">{rooms}</span>
                        <button type="button" onClick={() => { setRooms(Math.min(10, rooms + 1)); setCurrentPage(1); }} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30" disabled={rooms >= 10}>+</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[15px]">{locale === "vi" ? "Người lớn" : "Adults"}</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => { setAdults(Math.max(1, adults - 1)); setCurrentPage(1); }} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30" disabled={adults <= 1}>-</button>
                        <span className="font-medium w-4 text-center">{adults}</span>
                        <button type="button" onClick={() => { setAdults(Math.min(20, adults + 1)); setCurrentPage(1); }} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30" disabled={adults >= 20}>+</button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="bg-[#004f32] text-white font-extrabold text-[15px] md:text-[16px] px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-[#003d27] transition-all shadow-md shrink-0 flex items-center justify-center mt-2 md:mt-0"
              >
                {hp?.searchBtn ?? "Tìm kiếm"}
              </button>
            </form>

            {/* Sort Bar */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 relative z-30 gap-4">
              <span className="font-bold text-[16px] text-gray-900 order-2 md:order-1 text-gray-600 md:text-gray-900 text-sm md:text-[16px]">
                {filteredHotels.length} {hp?.suitableHotels ?? dict.searchHero?.hotels ?? "properties found"}
              </span>

              <div className="flex items-center gap-2 justify-start md:justify-end w-full md:w-auto order-1 md:order-2">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="flex lg:hidden items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-xl text-gray-900 hover:bg-gray-50 transition-colors shrink-0"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-xl px-4 h-10 font-bold text-[14px] shadow-sm hover:bg-gray-50 transition-colors shrink-0 whitespace-nowrap"
                  >
                    <span className="hidden md:inline">{dict.hotelsPage?.sortBy || "Sắp xếp theo"}:</span>
                    <span>{dict.hotelsPage?.[sortOption as keyof typeof dict.hotelsPage] || "Đề xuất"}</span>
                    <ChevronDown className={`w-4 h-4 ml-0.5 text-gray-500 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isSortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsSortOpen(false)}
                      />
                      <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSortOption(opt.id);
                              setIsSortOpen(false);
                              setCurrentPage(1); // Reset page on sort sort
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-gray-50 ${sortOption === opt.id ? "text-green-700 bg-green-50/50" : "text-gray-700"}`}
                          >
                            {dict.hotelsPage?.[opt.labelKey as keyof typeof dict.hotelsPage] || opt.labelKey}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Grid */}
            {paginatedHotels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{hp?.noResults ?? "No hotels found"}</h3>
                <p className="text-gray-500 mb-6 max-w-sm">{hp?.noResultsHint ?? "Try adjusting your filters."}</p>
                <button
                  onClick={() => {
                    setSelectedPropertyTypes([]);
                    setSelectedPriceBuckets([]);
                    setSelectedNeighborhoods([]);
                    setSelectedStars([]);
                    setSelectedReviewScores([]);
                    setSearchQuery("");
                  }}
                  className="px-6 py-2.5 bg-[#004f32] text-white rounded-full font-bold hover:bg-[#003d27] transition-colors"
                >
                  {hp?.clearAllFilters ?? "Clear all filters"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
                {paginatedHotels.map((hotel) => {
                  return (
                    <HotelGridCard 
                       key={hotel.id} 
                       hotel={hotel} 
                       checkin={passedCheckin} 
                       checkout={passedCheckout} 
                       adults={adults} 
                       rooms={rooms}
                    />
                  );
                })}
              </div>
            )}

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="mt-10 mb-12 flex justify-center w-full">
                 <button 
                   onClick={() => setCurrentPage(prev => prev + 1)}
                   className="bg-white border-2 border-[#004f32] text-[#004f32] hover:bg-[#004f32] hover:text-white font-bold text-[16px] px-10 py-3.5 rounded-full transition-all shadow-sm"
                 >
                   {locale === 'vi' ? 'Xem thêm' : 'View more'}
                 </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col lg:hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0">
            <h3 className="font-extrabold text-gray-900 text-[17px]">
              {hp?.filterTitle ?? "Filters"}
            </h3>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto w-full">
            <HotelFilters
              initialHotels={initialHotels}
              selectedPropertyTypes={selectedPropertyTypes}
              setSelectedPropertyTypes={(v: string[]) => { setSelectedPropertyTypes(v); setCurrentPage(1); }}
              selectedPriceBuckets={selectedPriceBuckets}
              setSelectedPriceBuckets={(v: string[]) => { setSelectedPriceBuckets(v); setCurrentPage(1); }}
              selectedNeighborhoods={selectedNeighborhoods}
              setSelectedNeighborhoods={(v: string[]) => { setSelectedNeighborhoods(v); setCurrentPage(1); }}
              selectedStars={selectedStars}
              setSelectedStars={(v: number[]) => { setSelectedStars(v); setCurrentPage(1); }}
              selectedReviewScores={selectedReviewScores}
              setSelectedReviewScores={(v: number[]) => { setSelectedReviewScores(v); setCurrentPage(1); }}
            />
          </div>
          <div className="p-4 border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0">
            <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-[#004f32] text-white font-extrabold text-[15px] py-4 rounded-xl shadow-sm hover:bg-[#003d27] transition-colors">
              {hp?.showResults ?? "Show results"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
