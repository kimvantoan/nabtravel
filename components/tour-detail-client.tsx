"use client";

import { useLanguage } from "@/app/providers";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
   MapPin,
   Clock,
   CheckCircle2,
   ChevronDown,
   ChevronUp,
   ChevronLeft,
   ChevronRight,
   Flag,
   Utensils,
   Car,
   BedDouble,
   Footprints,
   Play,
   Camera,
   Heart,
   Calendar,
   Users,
   Compass,
   Tag,
   Smile,
   ShieldCheck,
   CreditCard,
   RefreshCcw,
   Plane,
   ShipWheel
} from "lucide-react";

export function TourDetailClient({ tourId }: { tourId: string }) {
   const { dict, locale } = useLanguage();
   const [activeTab, setActiveTab] = useState("itinerary");
   const scrollRef = useRef<HTMLDivElement>(null);
   const [currentImageIndex, setCurrentImageIndex] = useState(0);

   const [tour, setTour] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
      fetch(`${backendUrl}/api/tours/${tourId}`)
         .then(res => res.json())
         .then(data => {
            setTour(data);
            setIsLoading(false);
         })
         .catch(err => {
            console.error(err);
            setIsLoading(false);
         });
   }, [tourId]);

   if (isLoading) {
      return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#00aa6c] border-t-transparent rounded-full animate-spin"></div></div>;
   }

   if (!tour) {
      return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Tour not found.</div>;
   }

   const name = typeof tour.name === 'object' ? (tour.name[locale] || tour.name.en) : tour.name;
   const places = Array.isArray(tour.destinations) ? tour.destinations.join(' - ') : tour.locations_applied;
   const photos = tour.gallery && tour.gallery.length > 0 ? tour.gallery : [tour.photoUrl];

   const itineraryDays = tour.itinerary ? tour.itinerary.map((item: any, idx: number, arr: any[]) => ({
      id: idx + 1,
      title: `${item.title}`,
      content: item.description || item.content,
      type: idx === 0 ? "start" : (idx === arr.length - 1 ? "end" : "middle")
   })) : [];

   const scrollToIndex = (index: number) => {
      if (scrollRef.current) {
         scrollRef.current.scrollTo({
            left: index * scrollRef.current.clientWidth,
            behavior: "smooth"
         });
         setCurrentImageIndex(index);
      }
   };

   const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const index = Math.round(el.scrollLeft / el.clientWidth);
      if (index !== currentImageIndex) {
         setCurrentImageIndex(index);
      }
   };

   const formatCurrency = (value: number) => {
      if (!value) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", {
         style: "currency",
         currency: "VND",
         maximumFractionDigits: 0
      }).format(value);
   };

   const tabs = [
      { id: "itinerary", label: dict.tourDetail.itinerary },
      { id: "inclusion", label: dict.tourDetail.inclusion },
      { id: "price", label: dict.tourDetail.price },
      { id: "reviews", label: dict.tourDetail.reviews },
      { id: "qanda", label: dict.tourDetail.qanda },
   ];

   return (
      <div className="flex flex-col flex-1 items-center justify-start bg-white w-full pb-24">
         <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 pt-4">

            {/* Top Title & Pricing Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
               <div className="flex-1">
                  <h1 className="text-2xl md:text-[32px] font-bold text-[#333] leading-tight mb-3">
                     {name}
                  </h1>
                  <div className="flex items-center gap-2">
                     <div className="bg-[#10a36e] text-white px-2 py-0.5 rounded text-[14px] font-bold shadow-sm">{tour.rating}</div>
                     <span className="text-[#10a36e] font-semibold text-[15px]">{tour.rating >= 9 ? 'Excellent' : 'Very Good'}</span>
                     <span className="text-gray-500 text-[14px]">- {tour.totalReviews} {dict.tourDetail.reviews}</span>
                  </div>
               </div>
               <div className="flex flex-row md:flex-col items-end gap-2 md:gap-1 mt-2 md:mt-0">
                  <div className="text-gray-500 text-[14px] flex items-center gap-1">
                     {dict.tourDetail.from} <span className="line-through">{formatCurrency(tour.originalPriceVND)}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                     <span className="text-black font-extrabold text-[32px] leading-none tracking-tight">{formatCurrency(tour.priceVND)}</span>
                     <span className="text-gray-500 text-[14px]">{dict.tourDetail.pax}</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-6">

               {/* Main Content (Left) */}
               <div className="flex-1 min-w-0">

                  {/* Huge Gallery Player */}
                  <div className="relative w-full aspect-[16/10] bg-gray-200 rounded-2xl overflow-hidden group mb-8">
                     <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
                     >
                        {photos.map((photo: string, index: number) => (
                           <div key={index} className="relative w-full h-full shrink-0 snap-center">
                              <Image src={photo} alt={`${name}`} fill sizes="70vw" className="object-cover" unoptimized />
                           </div>
                        ))}
                     </div>

                     {/* Navigation Arrows */}
                     {photos.length > 1 && (
                        <>
                           <button
                              onClick={() => scrollToIndex(Math.max(currentImageIndex - 1, 0))}
                              className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-gray-800 transition-all ${currentImageIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100 hover:bg-white pointer-events-auto'}`}
                           >
                              <ChevronLeft className="w-6 h-6" />
                           </button>
                           <button
                              onClick={() => scrollToIndex(Math.min(currentImageIndex + 1, photos.length - 1))}
                              className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-gray-800 transition-all ${currentImageIndex === photos.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100 hover:bg-white pointer-events-auto'}`}
                           >
                              <ChevronRight className="w-6 h-6" />
                           </button>
                        </>
                     )}

                     {/* Pagination Dots */}
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                        {photos.length > 1 && photos.map((_: string, i: number) => (
                           <button
                              key={i}
                              onClick={() => scrollToIndex(i)}
                              className={`h-2 rounded-full transition-all ${currentImageIndex === i ? 'bg-white w-4' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                           />
                        ))}
                     </div>



                     <div className="absolute bottom-4 right-4 bg-gray-900/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-[14px] font-semibold">
                        {currentImageIndex + 1} / {photos.length} <Camera className="w-4 h-4" />
                     </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 flex overflow-x-auto no-scrollbar mb-6">
                     {tabs.map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`whitespace-nowrap px-6 py-4 text-[16px] font-semibold transition-colors relative ${activeTab === tab.id ? 'text-[#10a36e]' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                           {tab.label}
                           {activeTab === tab.id && (
                              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#10a36e]"></div>
                           )}
                        </button>
                     ))}
                  </div>                  {/* Tabs Content */}
                  {activeTab === 'itinerary' && itineraryDays.length > 0 && (
                     <div className="py-6">
                        <h3 className="text-2xl font-bold text-[#333] mb-6">{dict.tourDetail.detailedItinerary}</h3>
                        <div className="relative pl-3">
                           <div className="absolute top-4 bottom-4 left-[1.1rem] w-[1.5px] border-l-[2px] border-dashed border-gray-200"></div>
                           {itineraryDays.map((day: any, idx: number) => (
                              <AccordionDay key={idx} day={day} defaultOpen={idx === 0} />
                           ))}
                        </div>
                     </div>
                  )}
                  {activeTab === 'inclusion' && (
                     <div className="py-6 flex flex-col gap-8">
                        <div className="flex-1">
                           <h4 className="font-bold text-[18px] text-[#333] mb-4 flex items-center gap-2">
                              <CheckCircle2 className="w-6 h-6 text-[#10a36e]" /> {dict.tourDetail.inclusionsTitle}
                           </h4>
                           <ul className="flex flex-col gap-3">
                              {tour.inclusions ? tour.inclusions.map((inc: string, i: number) => (
                                 <li key={i} className="flex items-start gap-2 text-[14px] text-gray-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#10a36e] shrink-0 mt-2"></div>
                                    <span className="leading-relaxed">{inc}</span>
                                 </li>
                              )) : <span className="text-gray-500">{dict.tourDetail.noData}</span>}
                           </ul>
                        </div>
                     </div>
                  )}
                  {activeTab === 'price' && (
                     <div className="py-6">
                        <h3 className="text-[20px] font-bold text-[#333] mb-6">{dict.tourDetail.tourPrice}</h3>
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                           {/* Table Header */}
                           <div className="bg-[#f5f5f5] px-6 py-4 flex justify-between items-center border-b border-gray-200">
                              <div className="font-semibold text-[#333] text-[16px]">01 Jan 2026 - 30 Apr 2027</div>
                              <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">{dict.tourDetail.privateTour}</div>
                           </div>
                           
                           {/* Rows */}
                           <div className="flex flex-col">
                              {tour.prices && tour.prices.length > 0 ? tour.prices.map((p: any, idx: number) => (
                                 <div key={idx} className="px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 border-b border-gray-100 hover:bg-gray-50 transition-colors flex-wrap">
                                    <div className="text-[15px] text-[#444] leading-relaxed flex-1 w-full md:w-auto">{p.tier}</div>
                                    <div className="flex items-center justify-end w-full md:w-auto shrink-0 mt-1 md:mt-0">
                                       <span className="text-[18px] font-bold text-[#b12222] text-right">{p.price}</span>
                                    </div>
                                 </div>
                              )) : (
                                 <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div className="text-[15px] text-[#444]">Standard (3* hotels)</div>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[15px] text-gray-400 line-through decoration-1">{formatCurrency(tour.originalPriceVND)}</span>
                                       <span className="text-[15px] text-gray-500 font-medium">US</span>
                                       <span className="text-[18px] font-bold text-[#b12222]">{formatCurrency(tour.priceVND)}</span>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
                  {activeTab === 'qanda' && tour.faqs && (
                     <div className="py-6">
                        <h4 className="font-bold text-[24px] text-[#333] mb-6">{dict.tourDetail.faqsTitle}</h4>
                        <div className="flex flex-col gap-4">
                           {tour.faqs.map((faq: any, idx: number) => (
                              <AccordionFAQ key={idx} faq={faq} defaultOpen={idx === 0} />
                           ))}
                        </div>
                     </div>
                  )}
               </div>

               {/* Sidebar Booking Card (Right) */}
               <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">

                  {/* Info Box */}
                  <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6 mb-2 text-[15px]">
                     <ul className="flex flex-col gap-4 text-[#333]">
                        <li className="flex items-start gap-3">
                           <Clock className="w-5 h-5 shrink-0 mt-0.5 text-gray-700" strokeWidth={1.5} />
                           <div className="leading-relaxed"><span className="font-bold">{dict.tourDetail.duration}</span> <span className="text-gray-700 ml-1">{tour.duration_text || ((tour.itinerary ? tour.itinerary.length : 1) + (locale === 'vi' ? ' ngày' : ' days'))}</span></div>
                        </li>
                        <li className="flex items-start gap-3">
                           <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-gray-700" strokeWidth={1.5} />
                           <div className="leading-relaxed"><span className="font-bold">{dict.tourDetail.places}</span> <span className="text-gray-700 ml-1">{places}</span></div>
                        </li>
                        <li className="flex items-start gap-3">
                           <Utensils className="w-5 h-5 shrink-0 mt-0.5 text-gray-700" strokeWidth={1.5} />
                           <div className="leading-relaxed"><span className="font-bold">{dict.tourDetail.meals}</span> <span className="text-gray-700 ml-1">{tour.meals_summary}</span></div>
                        </li>
                        <li className="flex items-start gap-3">
                           <Users className="w-5 h-5 shrink-0 mt-0.5 text-gray-700" strokeWidth={1.5} />
                           <div className="leading-relaxed"><span className="font-bold">{dict.tourDetail.groupSize}</span> <span className="text-gray-700 ml-1">{tour.group_size}</span></div>
                        </li>
                        <li className="flex items-start gap-3">
                           <ShipWheel className="w-5 h-5 shrink-0 mt-0.5 text-gray-700" strokeWidth={1.5} />
                           <div className="leading-relaxed"><span className="font-bold">{dict.tourDetail.operatedBy}</span> <span className="text-gray-700 ml-1">{tour.operator}</span></div>
                        </li>
                     </ul>

                     <hr className="my-5 border-gray-100" />

                     <div className="text-[#10a36e] font-semibold flex items-center gap-2 mb-4">
                        <Tag className="w-[14px] h-[14px]" /> {dict.tourDetail.summerDeals}
                     </div>

                     <div className="flex items-center gap-2 text-gray-600 mb-4 pb-2 text-[13px]">
                        <CheckCircle2 className="w-4 h-4 text-[#10a36e]" />
                        <span>{dict.tourDetail.freeQuote}</span>
                     </div>

                     <div className="flex gap-4">
                        <button className="w-12 h-12 bg-white border border-[#10a36e] text-[#10a36e] rounded-full flex items-center justify-center shrink-0 hover:bg-[#f0faf5] transition-colors">
                           <Heart className="w-5 h-5" />
                        </button>
                        <button className="flex-1 bg-[#10a36e] text-white py-3 rounded-lg font-bold text-[16px] shadow-sm hover:opacity-90 transition-opacity">
                           {dict.tourDetail.getQuote}
                        </button>
                     </div>
                  </div>

                  {/* Policies Box */}
                  <div className="border border-gray-200 rounded-xl bg-slate-50 p-6 flex flex-col gap-6">
                     <div className="flex items-center gap-4 text-[#333] font-bold text-[15px]">
                        <CreditCard className="w-7 h-7 text-[#10a36e] shrink-0" strokeWidth={1.5} />
                        {dict.tourDetail.deposit}
                     </div>
                     <div className="flex items-center gap-4 text-[#333] font-bold text-[15px]">
                        <ShieldCheck className="w-7 h-7 text-[#10a36e] shrink-0" strokeWidth={1.5} />
                        {dict.tourDetail.bookingHold}
                     </div>
                     <div className="flex items-center gap-4 text-[#333] font-bold text-[15px]">
                        <RefreshCcw className="w-7 h-7 text-[#10a36e] shrink-0" strokeWidth={1.5} />
                        {dict.tourDetail.bookingChanges}
                     </div>
                  </div>

               </div>
            </div>

         </div>
      </div>
   );
}

// Keeping the original AccordionDay for the Itinerary logic
function AccordionDay({ day, defaultOpen = false }: { day: any; defaultOpen?: boolean }) {
   const { dict } = useLanguage();
   const [isOpen, setIsOpen] = useState(defaultOpen);

   let IconComponent = <div className="w-3 h-3 rounded-full bg-gray-300"></div>;
   if (day.type === "start") {
      IconComponent = <div className="w-8 h-8 rounded-full bg-[#10a36e] flex items-center justify-center -ml-[11px] ring-4 ring-white relative z-10"><MapPin className="w-4 h-4 text-white" fill="currentColor" /></div>;
   } else if (day.type === "end") {
      IconComponent = <div className="w-8 h-8 rounded-full bg-[#10a36e] flex items-center justify-center -ml-[11px] ring-4 ring-white relative z-10"><Flag className="w-4 h-4 text-white" fill="currentColor" /></div>;
   } else {
      IconComponent = <div className="w-[14px] h-[14px] rounded-full bg-[#10a36e]/40 ring-[3px] ring-white relative z-10 ml-0.5 mt-1.5 focus-visible:outline-none"></div>;
   }

   return (
      <div className="relative mb-0 bg-transparent group">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left py-4 flex items-start outline-none"
         >
            <div className="w-8 shrink-0 flex justify-center">{IconComponent}</div>
            <div className={`flex-1 font-bold text-[16px] pl-3 flex justify-between items-center transition-colors ${day.type === 'start' ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'} ${isOpen ? '!text-[#10a36e]' : ''}`}>
               <span>{day.title}</span>
               {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
            </div>
         </button>

         <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
               <div className="pl-14 pr-4">
                  {day.description || day.content ? (
                     <div className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-wrap">
                        {day.description || day.content}
                     </div>
                  ) : (
                     <p className="text-gray-500 italic">{dict.tourDetail.noDetails}</p>
                  )}
                  {day.image && (
                     <div className="mt-4 relative w-full h-[250px] md:h-[400px] rounded-xl overflow-hidden shadow-sm">
                        <Image src={day.image} alt={day.title} fill className="object-cover" unoptimized />
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

function AccordionFAQ({ faq, defaultOpen = false }: { faq: any, defaultOpen?: boolean }) {
   const [isOpen, setIsOpen] = useState(defaultOpen);

   return (
      <div className="bg-white rounded-xl border border-gray-200 hover:border-[#10a36e]/30 overflow-hidden transition-colors shadow-sm">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left font-bold text-[16px] text-gray-900 p-5 flex justify-between items-center cursor-pointer"
         >
            <span className={`transition-colors duration-300 pr-4 ${isOpen ? 'text-[#10a36e]' : 'text-gray-900'}`}>{faq.question}</span>
            <div className={`transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
               <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${isOpen ? 'text-[#10a36e]' : 'text-gray-400'}`} />
            </div>
         </button>
         <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
               <div className="px-5 pb-5 pt-1 text-gray-600 text-[15px] leading-relaxed whitespace-pre-wrap border-t border-gray-100">
                  {faq.answer}
               </div>
            </div>
         </div>
      </div>
   );
}
