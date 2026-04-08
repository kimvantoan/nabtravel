"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Users, Check, Loader2, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useLanguage } from "@/app/providers";
import Image from "next/image";

export function HotelPricing({ price, hotelId, hotelName, agodaPrice, agodaUrl }: { price?: string, hotelId?: string | null, hotelName?: string, agodaPrice?: number, agodaUrl?: string }) {
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

  useEffect(() => {
    // Không dùng RapidAPI để tiết kiệm chi phí, giả lập dựa trên giá tĩnh DB truyền vào
    if (price && !isNaN(Number(price))) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        const diffDays = Math.max(1, Math.round((date?.to?.getTime()! - date?.from?.getTime()!) / (1000 * 60 * 60 * 24)));
        const finalPrice = Number(price) * diffDays * rooms;
        const formatter = new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0
        });
        setRealTimePrice(formatter.format(finalPrice));
        setHasBreakfast(true);
        setIsFreeCancellable(true);
        setBookingUrl(`https://www.booking.com/searchresults.vi.html?ss=${encodeURIComponent(hotelName || "")}`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [price, hotelName, date, rooms, locale]);

  const diffDays = Math.max(1, Math.round((date?.to?.getTime()! - date?.from?.getTime()!) / (1000 * 60 * 60 * 24)) || 1);

  // Fallback price logic if api hasn't returned yet and error hasn't happened
  const displayPrice = realTimePrice ? realTimePrice : (price ? new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(price) * diffDays * rooms) : "---");

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
      <div className="flex flex-col border-t border-gray-200">

        {/* Booking.com Row */}
        <div className="flex flex-col md:flex-row items-center justify-between py-4 md:py-6 gap-4 border-b border-gray-200">

          {/* Logo */}
          <div className="w-full md:w-1/2 flex items-center">
            <Image
              src="/images/Booking_Com_v2_384x164_Blue.png"
              alt="Booking.com"
              width={140}
              height={40}
              className="h-6 md:h-8 w-auto object-contain"
            />
          </div>

          {/* Price & Action */}
          <div className="w-full md:w-1/4 flex items-center justify-between md:justify-end gap-6 shrink-0">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <span className="text-[20px] md:text-[24px] font-extrabold text-[#003c20] tracking-tight">{displayPrice}</span>
            )}

            <button
              onClick={() => bookingUrl ? window.open(bookingUrl, '_blank') : null}
              disabled={isLoading || !!errorStatus}
              className="min-w-[120px] bg-white hover:bg-gray-50 text-[#003c20] border-2 border-[#003c20] font-bold px-6 py-2.5 rounded-full text-[15px] transition-colors"
            >
              {dict.hotelDetail.viewDeal || "View deal"}
            </button>
          </div>
        </div>

        {/* Agoda Row */}
        {agodaUrl && (
          <div className="flex flex-col md:flex-row items-center justify-between py-4 md:py-6 gap-4 border-b border-gray-200">

            {/* Logo */}
            <div className="w-full md:w-1/2 flex items-center">
              <Image
                src="/images/Agoda.png"
                alt="Agoda"
                width={100}
                height={40}
                className="h-7 md:h-9 w-auto object-contain"
              />
            </div>

            {/* Price & Action */}
            <div className="w-full md:w-1/4 flex items-center justify-between md:justify-end gap-6 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[20px] md:text-[24px] font-extrabold text-[#003c20] tracking-tight leading-none">
                  {agodaPrice ? new Intl.NumberFormat(locale === "vi" ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(agodaPrice * diffDays * rooms) : "---"}
                </span>
              </div>

              <button
                onClick={() => window.open(agodaUrl, '_blank')}
                className="min-w-[120px] bg-white hover:bg-gray-50 text-[#003c20] border-2 border-[#003c20] font-bold px-6 py-2.5 rounded-full text-[15px] transition-colors"
              >
                {dict.hotelDetail.viewDeal || "View deal"}
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="mt-8 border-t border-gray-100 pt-6">
        <p className="text-[12px] text-gray-500 leading-relaxed max-w-5xl">
          {dict.hotelDetail.priceDisclaimer || "Giá hiển thị là giá tổng cộng cuối cùng đã bao gồm thuế cho toàn bộ thời gian lưu trú và số lượng khách được chọn, cập nhật trong thời gian thực trên mạng lưới của NabTravel."}
        </p>
      </div>
    </div>
  );
}
