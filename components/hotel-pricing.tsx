"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Users, Check, Loader2, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useLanguage } from "@/app/providers";

export function HotelPricing({ price, hotelId, hotelName }: { price?: string, hotelId?: string | null, hotelName?: string }) {
  const { dict, locale } = useLanguage();
  const dateLocale = locale === "vi" ? vi : enUS;

  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), 8),
    to: addDays(new Date(), 9),
  });

  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [realTimePrice, setRealTimePrice] = useState<string | null>(null);
  const [bookingUrl, setBookingUrl] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isLoadingAgoda, setIsLoadingAgoda] = useState(false);
  const [agodaPrice, setAgodaPrice] = useState<string | null>(null);
  const [agodaUrl, setAgodaUrl] = useState<string | null>(null);
  const [agodaErrorStatus, setAgodaErrorStatus] = useState<string | null>(null);

  const [hasBreakfast, setHasBreakfast] = useState<boolean>(false);
  const [cancellationText, setCancellationText] = useState<string | null>(null);
  const [isFreeCancellable, setIsFreeCancellable] = useState<boolean>(false);
  const [extraBenefits, setExtraBenefits] = useState<{
    has_lunch?: boolean;
    has_dinner?: boolean;
    all_inclusive?: boolean;
    free_parking?: boolean;
    no_prepayment?: boolean;
    max_occupancy?: number | null;
  } | null>(null);

  // Fetch real-time price when dependencies change
  useEffect(() => {
    if (!hotelId || !date?.from || !date?.to) return;

    // Setup debounce so it doesn't spam the API while selecting dates
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setErrorStatus(null);

      const arr = format(date.from!, "yyyy-MM-dd");
      const dep = format(date.to!, "yyyy-MM-dd");

      try {
        const queryParams = new URLSearchParams({
          hotel_id: hotelId || "",
          arrival_date: arr,
          departure_date: dep,
          adults: adults.toString(),
          room_qty: rooms.toString(),
          hotel_name: hotelName || "",
          lang: locale === "vi" ? "vi" : "en-us"
        });

        const bookingReq = fetch(`/api/hotel-price?${queryParams.toString()}`).catch(() => null);

        setIsLoadingAgoda(true);
        setAgodaErrorStatus(null);
        const agodaReq = fetch(`/api/hotel-price-agoda?hotel_name=${encodeURIComponent(hotelName || "")}&arrival_date=${arr}&departure_date=${dep}&adults=${adults}&rooms=${rooms}&lang=${locale}`).catch(() => null);

        const [res, agodaRes] = await Promise.all([bookingReq, agodaReq]);

        let bookingPriceTotal = 0;
        let bookingData = null;
        if (res && res.ok) {
          bookingData = await res.json();
          // Format based on currency
          const formatter = new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency: bookingData.currency || 'VND',
            maximumFractionDigits: 0
          });

          bookingPriceTotal = bookingData.total_price || bookingData.price_per_night || 0;

          setRealTimePrice(formatter.format(bookingPriceTotal));
          setBookingUrl(bookingData.url);
          setHasBreakfast(!!bookingData.has_breakfast);
          setCancellationText(bookingData.cancellation_text);
          setIsFreeCancellable(!!bookingData.is_free_cancellable);
          setExtraBenefits(bookingData.extra_benefits || {
            has_lunch: bookingData.has_lunch,
            has_dinner: bookingData.has_dinner,
            all_inclusive: bookingData.all_inclusive,
            free_parking: bookingData.free_parking,
            no_prepayment: bookingData.no_prepayment,
            max_occupancy: bookingData.max_occupancy
          });
        } else {
          setRealTimePrice(null);
          setErrorStatus(locale === "vi" ? "Đã hết phòng cho ngày này" : "Sold out for these dates");
          setHasBreakfast(false);
          setCancellationText(null);
          setIsFreeCancellable(false);
          setExtraBenefits(null);
        }
        setIsLoading(false);

        if (agodaRes) {
          try {
            const data = await agodaRes.json();

            if (agodaRes.ok) {
              const formatter = new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', {
                style: 'currency',
                currency: data.currency || 'VND',
                maximumFractionDigits: 0
              });
              setAgodaPrice(formatter.format(data.total_price || data.price_per_night));
              setAgodaUrl(data.url);
            } else {
              setAgodaPrice(null);
              setAgodaErrorStatus(locale === "vi" ? "Đã hết phòng trên nền tảng" : "Sold out on this platform");
            }
          } catch (e) {
            setAgodaPrice(null);
            setAgodaErrorStatus("Error parsing data");
          }
        }
        setIsLoadingAgoda(false);

      } catch (err) {
        setRealTimePrice(null);
        setErrorStatus(locale === "vi" ? "Không thể tải giá Booking" : "Could not load Booking price");
        setAgodaPrice(null);
        setAgodaErrorStatus(locale === "vi" ? "Không thể tải giá Agoda" : "Could not load Agoda price");
        setIsLoading(false);
        setIsLoadingAgoda(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [hotelId, date, adults, rooms, locale]);

  // Fallback price logic if api hasn't returned yet and error hasn't happened
  const displayPrice = realTimePrice ? realTimePrice : (price ? price : "---");

  return (
    <div className="w-full border border-gray-200 rounded-2xl shadow-sm bg-white p-6 my-8">
      <h2 className="text-[22px] font-extrabold text-black mb-6 tracking-tight">
        {dict.hotelDetail.viewPrices || "Xem giá cho ngày du lịch của bạn"}
      </h2>

      {/* Date & Guest Pickers */}
      <div className="flex flex-col lg:flex-row gap-3 border-b border-gray-200 pb-6 mb-2">

        {/* Check-in / Check-out Group */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="cursor-pointer flex flex-1 rounded-full border border-gray-400 overflow-hidden text-left bg-white hover:border-gray-600 transition-colors">
              <div className="flex-1 flex gap-3 items-center px-4 py-2 hover:bg-gray-50 border-r border-gray-400">
                <CalendarIcon className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
                <div className="text-left">
                  <div className="text-[13px] text-gray-600 font-medium">{dict.hotelDetail.checkIn || "Nhận phòng"}</div>
                  <div className="text-[15px] font-bold text-black mt-0.5 whitespace-nowrap">
                    {date?.from ? format(date.from, "E, d MMM", { locale: dateLocale }) : dict.hotelDetail.selectDate}
                  </div>
                </div>
              </div>
              <div className="flex-1 flex gap-3 items-center px-4 py-2 hover:bg-gray-50">
                <CalendarIcon className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
                <div className="text-left">
                  <div className="text-[13px] text-gray-600 font-medium">{dict.hotelDetail.checkOut || "Trả phòng"}</div>
                  <div className="text-[15px] font-bold text-black mt-0.5 whitespace-nowrap">
                    {date?.to ? format(date.to, "E, d MMM", { locale: dateLocale }) : dict.hotelDetail.selectDate}
                  </div>
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={dateLocale}
              showOutsideDays={false}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 365)}
            />
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="lg:w-1/3 flex gap-3 items-center rounded-full border border-gray-400 px-4 py-2 bg-white hover:border-gray-600 hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <div className="text-[13px] text-gray-600 font-medium">{dict.hotelDetail.roomsGuests || "Phòng/Khách"}</div>
                <div className="text-[15px] font-bold text-black mt-0.5 whitespace-nowrap">
                  {rooms} {locale === "vi" ? "phòng" : "room"}, {adults} {locale === "vi" ? "khách" : "guests"}
                </div>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 rounded-xl shadow-lg border-gray-200" align="end">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[15px]">{locale === "vi" ? "Số phòng" : "Rooms"}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30" disabled={rooms <= 1}>-</button>
                  <span className="font-medium w-4 text-center">{rooms}</span>
                  <button onClick={() => setRooms(Math.min(10, rooms + 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30" disabled={rooms >= 10}>+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[15px]">{locale === "vi" ? "Người lớn" : "Adults"}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30" disabled={adults <= 1}>-</button>
                  <span className="font-medium w-4 text-center">{adults}</span>
                  <button onClick={() => setAdults(Math.min(20, adults + 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30" disabled={adults >= 20}>+</button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Pricing List */}
      <div className="flex flex-col">

        {/* Booking.com Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 gap-4 relative">
          <div className="w-full md:w-1/4">
            <div className="flex items-center gap-2">
              <img src="https://www.google.com/s2/favicons?domain=booking.com&sz=128" alt="Booking.com" className="w-8 h-8 object-contain" />
              <span className="text-[#003B95] font-extrabold text-[22px] tracking-tight">Booking.com</span>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-2 min-h-[48px]">
            {isFreeCancellable || cancellationText ? (
              <div className="flex items-start gap-2 text-[15px] text-gray-700">
                <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isFreeCancellable ? 'text-[#00aa6c]' : 'text-gray-400'}`} strokeWidth={2} />
                <span className={isFreeCancellable ? 'text-[#00aa6c] font-medium' : ''}>
                  {cancellationText || (dict.hotelDetail.freeCancellation || "Hủy miễn phí")}
                </span>
              </div>
            ) : null}
            {extraBenefits?.no_prepayment ? (
              <div className="flex items-start gap-2 text-[15px] text-[#00aa6c] font-medium">
                <Check className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                <span>{dict.hotelDetail.noPrepayment}</span>
              </div>
            ) : null}
            {hasBreakfast ? (
              <div className="flex items-start gap-2 text-[15px] text-[#00aa6c] font-medium">
                <Check className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                <span>{dict.hotelDetail.breakfastIncluded || "Bao gồm bữa sáng"}</span>
              </div>
            ) : null}
            {extraBenefits?.has_lunch ? (
              <div className="flex items-start gap-2 text-[15px] text-[#00aa6c] font-medium">
                <Check className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                <span>{dict.hotelDetail.lunchIncluded}</span>
              </div>
            ) : null}
            {extraBenefits?.has_dinner ? (
              <div className="flex items-start gap-2 text-[15px] text-[#00aa6c] font-medium">
                <Check className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                <span>{dict.hotelDetail.dinnerIncluded}</span>
              </div>
            ) : null}
            {extraBenefits?.all_inclusive ? (
              <div className="flex items-start gap-2 text-[15px] text-[#00aa6c] font-medium">
                <Check className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                <span>{dict.hotelDetail.allInclusive}</span>
              </div>
            ) : null}
            {extraBenefits?.free_parking ? (
              <div className="flex items-start gap-2 text-[15px] text-[#00aa6c] font-medium">
                <Check className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                <span>{dict.hotelDetail.freeParking}</span>
              </div>
            ) : null}
          </div>

          <div className="w-full md:w-1/4 flex flex-row md:flex-col items-center justify-between gap-3 shrink-0 md:items-end">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{locale === "vi" ? "Đang cập nhật giá..." : "Fetching live price..."}</span>
              </div>
            ) : errorStatus ? (
              <div className="flex gap-2 items-center text-red-500 font-medium">
                <Info className="w-4 h-4" />
                <span>{errorStatus}</span>
              </div>
            ) : (
              <span className="text-[24px] font-extrabold text-black tracking-tight">{displayPrice}</span>
            )}

            <button
              onClick={() => bookingUrl ? window.open(bookingUrl, '_blank') : null}
              disabled={isLoading || !!errorStatus}
              className="bg-[#003B95] hover:bg-[#0052cc] disabled:bg-gray-200 disabled:text-gray-500 text-white font-bold px-8 py-3 rounded-full shadow-sm text-[15px] transition-colors"
            >
              {dict.hotelDetail.viewDeal || "Xem ưu đãi"}
            </button>
          </div>
        </div>

        {/* Separator */}
        <hr className="border-gray-100 my-2" />

        {/* Agoda Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 gap-4 relative">
          <div className="w-full md:w-1/4">
            <div className="flex items-center gap-2">
              <img src="https://www.google.com/s2/favicons?domain=agoda.com&sz=128" alt="Agoda" className="w-8 h-8 object-contain" />
              <span className="text-black font-bold text-[22px] tracking-tight">agoda</span>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-2 min-h-[10px]">
            {/* Note: Agoda API does not provide all the extra benefits nicely parsed right now, so this is mostly clear */}
            {agodaPrice && (
              <div className="flex items-start gap-2 text-[15px] text-[#00aa6c] font-medium">
                <Check className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                <span>{(dict.hotelDetail as any).priceGuarantee}</span>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/4 flex flex-row md:flex-col items-center justify-between gap-3 shrink-0 md:items-end">
            {isLoadingAgoda ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{locale === "vi" ? "Đang cập nhật giá..." : "Fetching live price..."}</span>
              </div>
            ) : agodaErrorStatus ? (
              <div className="flex gap-2 items-center text-red-500 font-medium">
                <Info className="w-4 h-4" />
                <span>{agodaErrorStatus}</span>
              </div>
            ) : (
              <span className="text-[24px] font-extrabold text-black tracking-tight">{agodaPrice || "---"}</span>
            )}

            <button
              onClick={() => agodaUrl ? window.open(agodaUrl, '_blank') : null}
              disabled={isLoadingAgoda || !!agodaErrorStatus}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-500 text-white font-bold px-8 py-3 rounded-full shadow-sm text-[15px] transition-colors"
            >
              {dict.hotelDetail.viewDeal || "Xem ưu đãi"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-100 pt-6">
        <p className="text-[12px] text-gray-500 leading-relaxed max-w-5xl">
          {dict.hotelDetail.priceDisclaimer || "Giá hiển thị là giá tổng cộng cuối cùng đã bao gồm thuế cho toàn bộ thời gian lưu trú và số lượng khách được chọn, cập nhật trong thời gian thực trên mạng lưới của NabTravel."}
        </p>
      </div>
    </div>
  );
}
