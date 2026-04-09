"use client";

import { useLanguage } from "@/app/providers";
import { TourListCard, TourItemData } from "@/components/tour-list-card";
import { ChevronDown, SlidersHorizontal, Search, MapPin, Clock, X, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const destDict: Record<string, string> = {
  "Hanoi": "Hà Nội",
  "Halong Bay": "Hạ Long",
  "Da Nang": "Đà Nẵng",
  "Ho Chi Minh City": "Hồ Chí Minh",
  "Hue": "Huế",
  "Nha Trang": "Nha Trang",
  "Sapa": "Sa Pa",
  "Mekong Delta": "Đồng bằng sông Cửu Long",
  "Ninh Binh": "Ninh Bình",
  "Hoi An": "Hội An",
  "Phu Quoc": "Phú Quốc",
  "Cu Chi Tunnels": "Địa Đạo Củ Chi",
  "Mai Chau": "Mai Châu",
  "Can Tho": "Cần Thơ",
};

const SORT_OPTIONS = [
  { id: "recommended", labelKey: "recommended" },
  { id: "priceLowToHigh", labelKey: "priceLowToHigh" },
  { id: "priceHighToLow", labelKey: "priceHighToLow" },
  { id: "topReviewed", labelKey: "topReviewed" },
];

function SkeletonTourCard() {
  return (
    <div className="flex flex-col md:flex-row bg-white rounded-xl md:rounded-[18px] lg:rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex-1 animate-pulse">
      {/* Photo Section Skeleton */}
      <div className="relative w-full md:w-[260px] lg:w-[280px] shrink-0 aspect-[4/3] bg-gray-200">
      </div>

      {/* Content Section Skeleton */}
      <div className="flex flex-col flex-1 p-3 md:p-5 lg:p-6 w-full">
        {/* Title area */}
        <div className="flex-1 pr-0 lg:pr-4">
          <div className="h-5 md:h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>
          <div className="h-5 md:h-6 bg-gray-200 rounded-md w-2/4"></div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-4">
            <div className="w-10 h-5 bg-gray-200 rounded-md"></div>
            <div className="w-16 h-4 bg-gray-200 rounded-md"></div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mt-4">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-5 md:mt-8 pt-4 border-t border-gray-50 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
          <div className="w-full md:w-1/2 flex flex-col gap-2">
             <div className="h-3 bg-gray-200 rounded-md w-3/4"></div>
             <div className="h-3 bg-gray-200 rounded-md w-2/3"></div>
          </div>
          <div className="w-full md:w-28 h-10 bg-gray-200 rounded-md md:self-end mt-2 md:mt-0"></div>
        </div>
      </div>
    </div>
  );
}

export function ToursClientView({ initialTours, initialTotal = 0, initialSearchQuery = "" }: { initialTours: TourItemData[], initialTotal?: number, initialSearchQuery?: string }) {
  const { dict, locale } = useLanguage();
  const hp = dict.hotelsPage as any; // Reusing translations from hotels page where applicable

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState("recommended");
  const [tours, setTours] = useState<TourItemData[]>(initialTours);
  const [total, setTotal] = useState(initialTotal);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [duration, setDuration] = useState("");
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [showMoreDest, setShowMoreDest] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTours.length >= 18);
  const [aggregates, setAggregates] = useState({
    price: { under_5: 0, "5_10": 0, "10_20": 0, "20_40": 0, "40_70": 0, over_70: 0 },
    destinations: [] as string[]
  });
  const LIMIT = 18;

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          // If intersecting and not already loading, fetch the next set of tours
          fetchTours(tours.length, false);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, tours.length]);

  const fetchTours = async (skip: number, reset: boolean = false, currentSort: string = sortOption) => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
      const url = new URL(`${backendUrl}/api/tours`);
      url.searchParams.set('limit', LIMIT.toString());
      url.searchParams.set('skip', skip.toString());
      url.searchParams.set('sort', currentSort);
      if (searchQuery.trim()) {
        url.searchParams.set('q', searchQuery.trim());
      }
      if (duration && duration !== 'all') {
        url.searchParams.set('duration', duration);
      }
      if (priceRanges.length > 0) {
        url.searchParams.set('price_ranges', priceRanges.join(','));
      }
      if (selectedDestinations.length > 0) {
        url.searchParams.set('destinations', selectedDestinations.join(','));
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (reset) {
          setTours(data.tours);
        } else {
          setTours(prev => [...prev, ...data.tours]);
        }
        setHasMore(data.hasMore);
        setTotal(data.total);
        if (data.aggregates) {
          setAggregates(data.aggregates);
        }
      }
    } catch (e) {
      console.error("Fetch API Error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTours(0, true, sortOption);
  };

  useEffect(() => {
    fetchTours(0, true, sortOption);
  }, [priceRanges, duration, selectedDestinations]);

  const displayedDestinations = showMoreDest ? aggregates.destinations : aggregates.destinations.slice(0, 8);
  const categories = [
    { name: locale === 'vi' ? 'Tiết kiệm / Đạp xe' : 'Bicycles / Budget', count: 45 },
    { name: locale === 'vi' ? 'Nghỉ dưỡng biển' : 'Beach Vacation', count: 28 },
    { name: locale === 'vi' ? 'Gia đình' : 'Family Vacation', count: 56 },
    { name: locale === 'vi' ? 'Khám phá / Mạo hiểm' : 'Adventure / Trekking', count: 12 }
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50/50 pb-20">
      <div className="container mx-auto px-4 md:px-8 mt-6 md:mt-10 lg:mt-12">

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Static Mock Sidebar */}
          <div className="hidden lg:block w-[300px] xl:w-[320px] shrink-0 sticky top-28 h-fit">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-extrabold text-[18px] mb-6 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                {locale === 'vi' ? "Bộ lọc tìm kiếm" : "Search Filters"}
              </h3>

              <div className="mb-8 font-sans">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight mb-1">
                  {locale === 'vi' ? 'ĐIỂM ĐẾN' : 'DESTINATION'}
                </span>
                <div className="flex flex-col gap-3.5 mt-4">
                  {displayedDestinations.map((d, i) => {
                    const displayStr = locale === 'vi' ? (destDict[d] || d) : d;
                    return (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-[15px] h-[15px] rounded-sm accent-[#004f32] cursor-pointer outline-none border-gray-300 border text-[#004f32]"
                          checked={selectedDestinations.includes(d)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDestinations(prev => [...prev, d]);
                            else setSelectedDestinations(prev => prev.filter(item => item !== d));
                          }}
                        />
                        <span className="text-[14px] text-[#00517f] transition-colors">{displayStr}</span>
                      </label>
                    )
                  })}

                  {aggregates.destinations.length > 8 && (
                    <button
                      onClick={() => setShowMoreDest(!showMoreDest)}
                      className="flex items-center gap-1.5 text-[#004f32] text-[14px] font-medium mt-2 hover:text-[#003d27] transition-colors w-fit focus:outline-none"
                    >
                      {showMoreDest ? <ChevronUp className="w-[15px] h-[15px]" strokeWidth={2} /> : <ChevronDown className="w-[15px] h-[15px]" strokeWidth={2} />}
                      {showMoreDest ? (locale === 'vi' ? 'Thu gọn' : 'Show less') : (locale === 'vi' ? 'Xem thêm' : 'Show more')}
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-8 font-sans">
                <span className="font-bold text-[14px] mb-4 block text-[#778086] uppercase tracking-wide">
                  {locale === 'vi' ? 'GIÁ MỖI KHÁCH' : 'PRICE PER PAX'}
                </span>
                <div className="flex flex-col gap-3.5">
                  {[
                    { id: "under_5", vi: "Dưới 5 Triệu", en: "Under 5m VND" },
                    { id: "5_10", vi: "5 Triệu - 10 Triệu", en: "5m - 10m VND" },
                    { id: "10_20", vi: "10 Triệu - 20 Triệu", en: "10m - 20m VND" },
                    { id: "20_40", vi: "20 Triệu - 40 Triệu", en: "20m - 40m VND" },
                    { id: "40_70", vi: "40 Triệu - 70 Triệu", en: "40m - 70m VND" },
                    { id: "over_70", vi: "Trên 70 Triệu", en: "Over 70m VND" },
                  ].map((c) => (
                    <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-[15px] h-[15px] rounded-sm accent-[#004f32] cursor-pointer outline-none border-gray-300 border text-[#004f32]"
                        checked={priceRanges.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) setPriceRanges(prev => [...prev, c.id]);
                          else setPriceRanges(prev => prev.filter(id => id !== c.id));
                        }}
                      />
                      <span className="text-[14px] text-[#00517f] transition-colors">{locale === 'vi' ? c.vi : c.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">

            {/* Inlined Search Bar */}
            <div className="bg-white rounded-[40px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 py-2.5 pl-6 pr-2.5 w-full z-40 relative mb-8">
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col lg:flex-row items-center w-full"
              >
                {/* Destination */}
                <div className="flex items-center w-full lg:flex-1 lg:pr-6 py-1 border-b lg:border-b-0 lg:border-r border-gray-200">
                  <Search className="text-gray-400 w-[18px] h-[18px] mr-3 shrink-0" strokeWidth={2} />
                  <div className="flex flex-col flex-1">
                    <span className="text-[12px] font-medium text-gray-500 mb-0.5">{locale === 'vi' ? 'Bạn muốn đi đâu?' : 'Where to?'}</span>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent outline-none w-full text-[14px] font-bold text-gray-900 placeholder:text-gray-900 border-none p-0 focus:ring-0 leading-tight"
                      placeholder={locale === 'vi' ? 'Điểm đến...' : 'Destination...'}
                    />
                  </div>
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Duration */}
                <div
                  className="relative flex items-center w-full lg:w-[220px] xl:w-[250px] lg:px-6 py-1 border-b lg:border-b-0 border-gray-200 cursor-pointer"
                  onClick={() => setDurationOpen(!durationOpen)}
                >
                  <Clock className="text-gray-400 w-[18px] h-[18px] mr-3 shrink-0" strokeWidth={2} />
                  <div className="flex flex-col flex-1">
                    <span className="text-[12px] font-medium text-gray-500 mb-0.5">{locale === 'vi' ? 'Thời lượng' : 'Duration'}</span>
                    <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 leading-tight">
                      <span>
                        {duration === "1-3" ? (locale === 'vi' ? '1 - 3 Ngày' : '1 - 3 Days') :
                          duration === "4-7" ? (locale === 'vi' ? '4 - 7 Ngày' : '4 - 7 Days') :
                            duration === "8+" ? (locale === 'vi' ? 'Hơn 8 Ngày' : '8+ Days') :
                              (locale === 'vi' ? 'Tất cả' : 'All')}
                      </span>
                    </div>
                  </div>

                  {durationOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDurationOpen(false)} />
                      <div className="absolute top-full left-0 mt-3 w-52 bg-white border border-gray-200 shadow-xl rounded-[10px] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                        {[
                          { val: "", labelVi: "Tất cả", labelEn: "All" },
                          { val: "1-3", labelVi: "1 - 3 Ngày", labelEn: "1 - 3 Days" },
                          { val: "4-7", labelVi: "4 - 7 Ngày", labelEn: "4 - 7 Days" },
                          { val: "8+", labelVi: "Hơn 8 Ngày", labelEn: "8+ Days" },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => { setDuration(opt.val); setDurationOpen(false); }}
                            className={`w-[95%] mx-auto block text-left px-4 py-2 my-0.5 rounded-md text-[13px] font-medium transition-colors focus:outline-none ${duration === opt.val ? "text-[#106244] bg-[#f2f8f5]" : "text-gray-600 hover:text-[#106244] hover:bg-[#f2f8f5]"}`}
                          >
                            {locale === 'vi' ? opt.labelVi : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Search Button */}
                <div className="w-full lg:w-auto shrink-0 flex lg:justify-end lg:ml-2">
                  <button type="submit" className="w-full lg:w-auto px-7 py-2.5 bg-[#106244] text-white rounded-full font-bold text-[14px] hover:bg-[#0c4e35] transition-colors flex items-center justify-center whitespace-nowrap shadow-sm min-h-[44px]">
                    {locale === 'vi' ? "Tìm kiếm" : "Search"}
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 relative z-30 gap-4">
              <span className="font-bold text-[16px] text-gray-900 order-2 md:order-1 text-gray-500 md:text-gray-900 text-sm md:text-[16px]">
                {locale === 'vi' ? `Hiển thị ${tours.length} / ${total} Tour` : `Showing ${tours.length} of ${total} Tours`}
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
                    <span className="hidden md:inline">{dict.hotelsPage?.sortBy || "Sắp xếp"}:</span>
                    <span className="text-[#004f32]">{dict.hotelsPage?.[sortOption as keyof typeof dict.hotelsPage] || "Thịnh hành"}</span>
                    <ChevronDown className={`w-4 h-4 ml-0.5 text-[#004f32] transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isSortOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                      <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-[10px] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSortOption(opt.id);
                              setIsSortOpen(false);
                              fetchTours(0, true, opt.id);
                            }}
                            className={`w-[95%] mx-auto block text-left px-4 py-2.5 my-0.5 rounded-md text-[14px] font-semibold transition-colors focus:outline-none ${sortOption === opt.id ? "text-[#004f32] bg-[#f2f8f5]" : "text-gray-600 hover:text-[#004f32] hover:bg-[#f2f8f5]"}`}
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

            {/* List Array - Grid on Mobile (2 items), Flex column on Desktop (1 item per row) */}
            {loading && tours.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6 w-full">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonTourCard key={i} />
                ))}
              </div>
            ) : tours.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-4">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="font-bold text-gray-900 text-[18px]">{locale === 'vi' ? "Không tìm thấy kết quả" : "No tours found"}</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6 w-full opacity-100 transition-opacity duration-300" style={{ opacity: loading ? 0.6 : 1 }}>
                {tours.map((tour) => (
                  <TourListCard key={tour.id} tour={tour} />
                ))}
              </div>
            )}

            {/* Pagination Infinite Loader */}
            {hasMore ? (
              <div ref={loaderRef} className="mt-8 pb-20 w-full relative">
                 {loading && (
                   <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6 w-full">
                     {[1, 2, 3].map((i) => (
                       <SkeletonTourCard key={`skeleton-more-${i}`} />
                     ))}
                   </div>
                 )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileFilterOpen(false)} />

          {/* Sheet from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#004f32]" />
                <h3 className="font-bold text-[17px]">{locale === 'vi' ? 'Bộ lọc' : 'Filters'}</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

              {/* Destinations */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
                  {locale === 'vi' ? 'ĐIỂM ĐẾN' : 'DESTINATION'}
                </span>
                <div className="flex flex-col gap-3">
                  {(showMoreDest ? aggregates.destinations : aggregates.destinations.slice(0, 8)).map((d, i) => {
                    const displayStr = locale === 'vi' ? (destDict[d] || d) : d;
                    return (
                      <label key={i} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded-sm accent-[#004f32] cursor-pointer border-gray-300"
                          checked={selectedDestinations.includes(d)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDestinations(prev => [...prev, d]);
                            else setSelectedDestinations(prev => prev.filter(item => item !== d));
                          }}
                        />
                        <span className="text-[14px] text-gray-700">{displayStr}</span>
                      </label>
                    );
                  })}
                  {aggregates.destinations.length > 8 && (
                    <button
                      onClick={() => setShowMoreDest(!showMoreDest)}
                      className="flex items-center gap-1.5 text-[#004f32] text-[14px] font-medium mt-1 focus:outline-none"
                    >
                      {showMoreDest ? <ChevronUp className="w-4 h-4" strokeWidth={2} /> : <ChevronDown className="w-4 h-4" strokeWidth={2} />}
                      {showMoreDest ? (locale === 'vi' ? 'Thu gọn' : 'Show less') : (locale === 'vi' ? 'Xem thêm' : 'Show more')}
                    </button>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Price Ranges */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
                  {locale === 'vi' ? 'GIÁ MỖI KHÁCH' : 'PRICE PER PAX'}
                </span>
                <div className="flex flex-col gap-3">
                  {[
                    { id: "under_5", vi: "Dưới 5 Triệu", en: "Under 5m VND" },
                    { id: "5_10", vi: "5 Triệu - 10 Triệu", en: "5m - 10m VND" },
                    { id: "10_20", vi: "10 Triệu - 20 Triệu", en: "10m - 20m VND" },
                    { id: "20_40", vi: "20 Triệu - 40 Triệu", en: "20m - 40m VND" },
                    { id: "40_70", vi: "40 Triệu - 70 Triệu", en: "40m - 70m VND" },
                    { id: "over_70", vi: "Trên 70 Triệu", en: "Over 70m VND" },
                  ].map((c) => (
                    <label key={c.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded-sm accent-[#004f32] cursor-pointer border-gray-300"
                        checked={priceRanges.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) setPriceRanges(prev => [...prev, c.id]);
                          else setPriceRanges(prev => prev.filter(id => id !== c.id));
                        }}
                      />
                      <span className="text-[14px] text-gray-700">{locale === 'vi' ? c.vi : c.en}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear all */}
              {(selectedDestinations.length > 0 || priceRanges.length > 0) && (
                <button
                  onClick={() => { setSelectedDestinations([]); setPriceRanges([]); }}
                  className="text-[13px] text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
                >
                  {locale === 'vi' ? 'Xóa tất cả bộ lọc' : 'Clear all filters'}
                </button>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-[#004f32] hover:bg-[#003d27] transition-colors py-3.5 text-white font-bold rounded-xl text-[15px]"
              >
                {locale === 'vi'
                  ? `Xem ${total} kết quả`
                  : `Show ${total} results`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
