"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Users, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useLanguage } from "@/app/providers";

export function HotelPricing() {
  const { dict, locale } = useLanguage();
  const dateLocale = locale === "vi" ? vi : enUS;
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });

  return (
    <div className="w-full border border-gray-200 rounded-2xl shadow-sm bg-white p-6 my-8">
      <h2 className="text-[22px] font-extrabold text-black mb-6 tracking-tight">
        {dict.hotelDetail.viewPrices}
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
                  <div className="text-[13px] text-gray-600 font-medium">{dict.hotelDetail.checkIn}</div>
                  <div className="text-[15px] font-bold text-black mt-0.5">
                    {date?.from ? format(date.from, "E, d MMM", { locale: dateLocale }) : dict.hotelDetail.selectDate}
                  </div>
                </div>
              </div>
              <div className="flex-1 flex gap-3 items-center px-4 py-2 hover:bg-gray-50">
                <CalendarIcon className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
                <div className="text-left">
                  <div className="text-[13px] text-gray-600 font-medium">{dict.hotelDetail.checkOut}</div>
                  <div className="text-[15px] font-bold text-black mt-0.5">
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
            />
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <button className="lg:w-1/3 flex gap-3 items-center rounded-full border border-gray-400 px-4 py-2 bg-white hover:border-gray-600 hover:bg-gray-50 transition-colors">
          <Users className="w-5 h-5 text-gray-600 shrink-0" strokeWidth={1.5} />
          <div className="text-left">
            <div className="text-[13px] text-gray-600 font-medium">{dict.hotelDetail.roomsGuests}</div>
            <div className="text-[15px] font-bold text-black mt-0.5">{locale === "vi" ? "1 phòng, 2 khách" : "1 room, 2 guests"}</div>
          </div>
        </button>
      </div>

      {/* Pricing List */}
      <div className="flex flex-col">
        
        {/* Booking.com Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 border-b border-gray-200 gap-4">
          <div className="w-full md:w-1/4">
            <div className="text-[#003580] font-bold text-lg">Booking.com</div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <div className="flex items-start gap-2 text-[15px] text-gray-700">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" strokeWidth={2} />
              <span>{dict.hotelDetail.freeCancellation} {locale === "vi" ? "đến T2, 6 Thg 4" : "until Mon, Apr 6"}</span>
            </div>
            <div className="flex items-start gap-2 text-[15px] text-gray-700">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" strokeWidth={2} />
              <span>{dict.hotelDetail.breakfastIncluded}</span>
            </div>
          </div>
          <div className="w-full md:w-1/4 flex flex-row md:flex-col items-center justify-between gap-3 shrink-0 md:items-end">
            <span className="text-[22px] font-extrabold text-black">912,895 ₫</span>
            <button className="bg-[#34e065] hover:bg-[#2bbb52] text-black font-bold px-6 py-2.5 rounded-full shadow-sm text-[15px] transition-colors">
              {dict.hotelDetail.viewDeal}
            </button>
          </div>
        </div>

        {/* Agoda Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 border-b border-gray-200 gap-4">
          <div className="w-full md:w-1/4 flex items-center gap-1">
            <span className="text-gray-500 font-bold text-lg tracking-tight">agoda</span>
            <div className="flex gap-0.5 ml-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <div className="flex items-start gap-2 text-[15px] text-gray-700">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" strokeWidth={2} />
              <span>{dict.hotelDetail.freeCancellation} {locale === "vi" ? "đến T3, 7 Thg 4" : "until Tue, Apr 7"}</span>
            </div>
            <div className="flex items-start gap-2 text-[15px] text-gray-700">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" strokeWidth={2} />
              <span>{dict.hotelDetail.breakfastIncluded}</span>
            </div>
            <div className="flex items-start gap-2 text-[15px] text-gray-700">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" strokeWidth={2} />
              <span>{dict.hotelDetail.quickBooking}</span>
            </div>
          </div>
          <div className="w-full md:w-1/4 flex flex-row md:flex-col items-center justify-between gap-3 shrink-0 md:items-end">
            <span className="text-[22px] font-extrabold text-black">814,715 ₫</span>
            <button className="bg-white hover:bg-gray-100 border border-black text-black font-bold px-6 py-2.5 rounded-full transition-colors text-[15px]">
              {dict.hotelDetail.viewDeal}
            </button>
          </div>
        </div>

        {/* Trip.com Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 gap-4">
          <div className="w-full md:w-1/4">
            <div className="text-[#3264ff] font-bold text-lg">Trip.com</div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <div className="flex items-start gap-2 text-[15px] text-gray-700">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" strokeWidth={2} />
              <span>{dict.hotelDetail.freeCancellation} {locale === "vi" ? "đến T4, 8 Thg 4" : "until Wed, Apr 8"}</span>
            </div>
            <div className="flex items-start gap-2 text-[15px] text-gray-700">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" strokeWidth={2} />
              <span>{dict.hotelDetail.breakfastIncluded}</span>
            </div>
            <div className="flex items-start gap-2 text-[15px] text-gray-700">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" strokeWidth={2} />
              <span>{dict.hotelDetail.earnCoins}</span>
            </div>
          </div>
          <div className="w-full md:w-1/4 flex flex-row md:flex-col items-center justify-between gap-3 shrink-0 md:items-end">
            <span className="text-[22px] font-extrabold text-black">1,312,880 ₫</span>
            <button className="bg-white hover:bg-gray-100 border border-black text-black font-bold px-6 py-2.5 rounded-full transition-colors text-[15px]">
              {dict.hotelDetail.viewDeal}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[11px] text-gray-500 leading-relaxed max-w-5xl">
          {dict.hotelDetail.priceDisclaimer}
        </p>
      </div>
    </div>
  );
}
