"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, MapPin, ChevronsUpDown, Check, CalendarIcon } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from "@/components/ui/command";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";

export function TourInquireClient({ tourId }: { tourId: string }) {
   const router = useRouter();
   const { dict, locale } = useLanguage();
   const [tour, setTour] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(true);

   // Form states
   const [adults, setAdults] = useState("2");
   const [children, setChildren] = useState("0");
   const [infants, setInfants] = useState("0");
   const [accommodations, setAccommodations] = useState("");
   const [country, setCountry] = useState("");
   const [openCountry, setOpenCountry] = useState(false);
   const [arrivalDate, setArrivalDate] = useState<Date>();

   const [gender, setGender] = useState("Mr");
   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [phoneNumber, setPhoneNumber] = useState("");
   const [city, setCity] = useState("");
   const [socialMedia, setSocialMedia] = useState("");
   const [specialRequirements, setSpecialRequirements] = useState("");

   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitMessage, setSubmitMessage] = useState<{ type: "error" | "success", text: string } | null>(null);
   const [errors, setErrors] = useState<any>({});

   const handleSubmit = async () => {
      let checkErrors: any = {};
      if (!adults) checkErrors.adults = true;
      if (!children) checkErrors.children = true;
      if (!infants) checkErrors.infants = true;
      if (!fullName) checkErrors.fullName = true;
      if (!email) checkErrors.email = true;
      if (!phoneNumber) checkErrors.phoneNumber = true;
      if (!arrivalDate) checkErrors.arrivalDate = true;
      if (!accommodations) checkErrors.accommodations = true;
      if (!country) checkErrors.country = true;

      setErrors(checkErrors);

      if (Object.keys(checkErrors).length > 0) {
         setSubmitMessage({ type: "error", text: dict.tourInquire.errorFillRequired });
         return;
      }

      setIsSubmitting(true);
      setSubmitMessage(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      try {
         const res = await fetch(`${backendUrl}/api/tour-inquiries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               tour_id: tour.id,
               adults: parseInt(adults),
               children: parseInt(children),
               infants: parseInt(infants),
               arrival_date: format(arrivalDate!, "yyyy-MM-dd"),
               accommodations,
               gender,
               full_name: fullName,
               email,
               phone_number: phoneNumber,
               country,
               city,
               social_media: socialMedia,
               special_requirements: specialRequirements
            })
         });

         if (!res.ok) {
            const json = await res.json();
            throw new Error(json.message || "Failed to submit inquiry.");
         }

         router.push("/thank-you");

      } catch (err: any) {
         setSubmitMessage({ type: "error", text: err.message || dict.tourInquire.errorSubmit });
      } finally {
         setIsSubmitting(false);
      }
   };


   useEffect(() => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      fetch(`${backendUrl}/api/tours/${tourId}`)
         .then(res => res.json())
         .then(data => {
            setTour(data);
            if (data.prices && data.prices.length > 0) {
               setAccommodations(data.prices[0].tier);
            } else {
               setAccommodations("Superior (3* Hotels)");
            }
            setIsLoading(false);
         })
         .catch(err => { console.error(err); setIsLoading(false); });
   }, [tourId]);

   if (isLoading) {
      return (
         <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#10a36e] border-t-transparent rounded-full animate-spin"></div>
         </div>
      );
   }

   if (!tour) return <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-4">Tour not found</div>;

   const name = typeof tour.name === "object" ? tour.name[locale as keyof typeof tour.name] || tour.name.en : tour.name;
   const ratingText = tour.rating >= 9 ? (locale === 'vi' ? 'Tuyệt vời' : 'Excellent') : (locale === 'vi' ? 'Rất tốt' : 'Very Good');
   const photoUrl = tour.photoUrl || "https://nabtravel.com/images/tours-banner.jpg";

   const accommodationsOptions = tour.prices?.length > 0
      ? tour.prices.map((p: any) => p.tier)
      : ["Superior (3* Hotels)", "First Class (4* Hotels)", "Deluxe (5* hotels)"];

   return (
      <div className="min-h-screen bg-[#f7f8fa] pb-24 font-sans text-gray-800">
         <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10">

            {/* Top Stepper */}
            <div className="flex justify-end gap-2 items-center mb-8 text-[13px] font-medium text-gray-400">
               <div className="flex items-center gap-1.5 opacity-60">
                  <span className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center">
                     <CheckCircle2 className="w-[14px] h-[14px] text-white" />
                  </span>
                  View tour
               </div>
               <span className="w-8 h-[1px] bg-gray-300 mx-2"></span>
               <div className="flex items-center gap-1.5 text-[#10a36e]">
                  <span className="w-5 h-5 rounded-full bg-[#10a36e] text-white flex items-center justify-center text-[11px] font-bold">2</span>
                  Inquiring
               </div>
            </div>

            <h1 className="text-[26px] font-bold text-[#333] mb-6">{dict.tourInquire.title}</h1>

            {/* Tour Info Block */}
            <div className="bg-white p-4 rounded-[12px] shadow-sm mb-6 flex flex-col md:flex-row gap-5 items-start">
               <div className="relative w-full md:w-[240px] aspect-[16/10] md:aspect-[3/2] shrink-0 rounded-lg overflow-hidden">
                  <Image src={photoUrl} alt={name} fill className="object-cover" unoptimized />
               </div>
               <div className="flex flex-col py-1">
                  <h2 className="text-[17px] md:text-[19px] leading-tight font-bold text-[#333] mb-3">{name}</h2>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-[#10a36e] text-white px-1.5 py-0.5 rounded text-[12px] font-bold shadow-sm">{tour.rating}</span>
                     <span className="text-[#10a36e] font-semibold text-[13px]">{ratingText}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-gray-600 mt-2">
                     <MapPin className="w-4 h-4 shrink-0 mt-[2px]" />
                     <span className="text-[13px] leading-relaxed">{tour.locations_applied || tour.destinations?.join(" - ")}</span>
                  </div>
               </div>
            </div>

            {/* Form Container */}
            <div className="flex flex-col gap-6">

               {/* Section 1: Travel Information */}
               <div className="bg-white p-6 md:p-8 rounded-[12px] shadow-sm border border-gray-100">
                  <h3 className="text-[17px] font-bold text-[#333] mb-6 border-b border-gray-100 pb-4">{dict.tourInquire.travelInfo}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-end">
                     <div className="flex flex-col justify-end h-full">
                        <label className="block text-[13px] font-semibold text-gray-800 mb-2 whitespace-nowrap">{dict.tourInquire.adults} <span className="text-red-500">*</span></label>
                        <Select value={adults} onValueChange={(val) => { setAdults(val); if (errors.adults) setErrors({ ...errors, adults: false }); }}>
                           <SelectTrigger className={cn("w-full !h-[42px] bg-white focus:ring-[#10a36e]", errors.adults ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500" : "border-gray-300")}>
                              <SelectValue placeholder={dict.tourInquire.adults} />
                           </SelectTrigger>
                           <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <SelectItem key={`${n}-adult`} value={n.toString()}>{n}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="flex flex-col justify-end h-full">
                        <label className="block text-[13px] font-semibold text-gray-800 mb-2 whitespace-nowrap">{dict.tourInquire.children} <span className="text-[11px] text-gray-500 font-normal">(5-10)</span> <span className="text-red-500">*</span></label>
                        <Select value={children} onValueChange={(val) => { setChildren(val); if (errors.children) setErrors({ ...errors, children: false }); }}>
                           <SelectTrigger className={cn("w-full !h-[42px] bg-white focus:ring-[#10a36e]", errors.children ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500" : "border-gray-300")}>
                              <SelectValue placeholder={dict.tourInquire.children} />
                           </SelectTrigger>
                           <SelectContent>
                              {["0", "1", "2", "3", "4", "5"].map(n => <SelectItem key={`${n}-child`} value={n}>{n}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="flex flex-col justify-end h-full">
                        <label className="block text-[13px] font-semibold text-gray-800 mb-2 whitespace-nowrap">{dict.tourInquire.infants} <span className="text-[11px] text-gray-500 font-normal">(0-4)</span> <span className="text-red-500">*</span></label>
                        <Select value={infants} onValueChange={(val) => { setInfants(val); if (errors.infants) setErrors({ ...errors, infants: false }); }}>
                           <SelectTrigger className={cn("w-full !h-[42px] bg-white focus:ring-[#10a36e]", errors.infants ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500" : "border-gray-300")}>
                              <SelectValue placeholder={dict.tourInquire.infants} />
                           </SelectTrigger>
                           <SelectContent>
                              {["0", "1", "2", "3", "4", "5"].map(n => <SelectItem key={`${n}-infant`} value={n}>{n}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  <div className="mb-6 w-full md:w-1/2">
                     <label className="block text-[13px] font-semibold text-gray-800 mb-2">{dict.tourInquire.dateOfArrival} <span className="text-red-500">*</span></label>
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button
                              variant={"outline"}
                              className={cn(
                                 "w-full h-[42px] justify-start text-left font-normal border-gray-300 hover:bg-gray-50 focus:ring-[#10a36e]",
                                 !arrivalDate && "text-gray-500",
                                 errors.arrivalDate && "border-red-500 ring-1 ring-red-500 focus:ring-red-500"
                              )}
                           >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {arrivalDate ? format(arrivalDate, "dd/MM/yyyy") : <span>dd/mm/yyyy</span>}
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                              mode="single"
                              selected={arrivalDate}
                              onSelect={setArrivalDate}
                              initialFocus
                              disabled={(date) => {
                                 const today = new Date();
                                 today.setHours(0, 0, 0, 0);
                                 return date <= today;
                              }}
                           />
                        </PopoverContent>
                     </Popover>
                  </div>

                  <div>
                     <label className="block text-[13px] font-semibold text-gray-800 mb-3">{dict.tourInquire.accommodations} <span className="text-red-500">*</span></label>
                     <div className="flex flex-wrap gap-3">
                        {accommodationsOptions.map((acc: string) => (
                           <Button
                              key={acc}
                              type="button"
                              variant="outline"
                              onClick={() => setAccommodations(acc)}
                              className={`h-10 text-[13px] transition-colors rounded-lg px-5 ${accommodations === acc ? 'bg-[#f0faf5] border-[#10a36e] text-[#10a36e] shadow-sm hover:text-[#10a36e] hover:bg-[#e4fcfa]' : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                                 }`}
                           >
                              {acc}
                           </Button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Section 2: Contact Information */}
               <div className="bg-white p-6 md:p-8 rounded-[12px] shadow-sm border border-gray-100">
                  <h3 className="text-[17px] font-bold text-[#333] mb-6 border-b border-gray-100 pb-4">{dict.tourInquire.contactInfo}</h3>

                  <div className="flex flex-col gap-5 mt-6">
                     {/* Row 1: Gender & Full Name */}
                     <div className="flex flex-col md:flex-row gap-5">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 md:w-1/2">
                           <label className="md:w-28 text-[13px] font-semibold text-gray-800 shrink-0">{dict.tourInquire.gender}:</label>
                           <div className="w-full md:w-[120px]">
                              <Select value={gender} onValueChange={setGender}>
                                 <SelectTrigger className="!h-[42px] border-gray-300 focus:ring-[#10a36e] bg-white">
                                    <SelectValue placeholder={dict.tourInquire.gender} />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="Mr">Mr</SelectItem>
                                    <SelectItem value="Mrs">Mrs</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 md:w-1/2">
                           <label className="md:w-28 text-[13px] font-semibold text-gray-800 shrink-0">{dict.tourInquire.fullName} <span className="text-red-500">*</span></label>
                           <div className="w-full md:flex-1">
                              <Input type="text" value={fullName} onChange={e => { setFullName(e.target.value); if (errors.fullName) setErrors({ ...errors, fullName: false }) }} placeholder={dict.tourInquire.enterName} className={cn("h-[42px] bg-white text-[14px]", errors.fullName ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500" : "border-gray-300 focus-visible:ring-[#10a36e]")} />
                           </div>
                        </div>
                     </div>

                     {/* Row 2: Email & Phone Number */}
                     <div className="flex flex-col md:flex-row gap-5">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 md:w-1/2">
                           <label className="md:w-28 text-[13px] font-semibold text-gray-800 shrink-0">{dict.tourInquire.email} <span className="text-red-500">*</span></label>
                           <div className="w-full md:flex-1">
                              <Input type="email" value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: false }) }} placeholder={dict.tourInquire.enterEmail} className={cn("h-[42px] bg-white text-[14px]", errors.email ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500" : "border-gray-300 focus-visible:ring-[#10a36e]")} />
                           </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 md:w-1/2">
                           <label className="md:w-28 text-[13px] font-semibold text-gray-800 shrink-0">{dict.tourInquire.phoneNumber} <span className="text-red-500">*</span></label>
                           <div className="w-full md:flex-1">
                              <Input type="tel" value={phoneNumber} onChange={e => { setPhoneNumber(e.target.value); if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: false }) }} placeholder={dict.tourInquire.enterPhone} className={cn("h-[42px] bg-white text-[14px]", errors.phoneNumber ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500" : "border-gray-300 focus-visible:ring-[#10a36e]")} />
                           </div>
                        </div>
                     </div>

                     {/* Row 3: Country & City */}
                     <div className="flex flex-col md:flex-row gap-5">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 md:w-1/2">
                           <label className="md:w-28 text-[13px] font-semibold text-gray-800 shrink-0">{dict.tourInquire.country} <span className="text-red-500">*</span></label>
                           <div className="w-full md:flex-1">
                              <Popover open={openCountry} onOpenChange={setOpenCountry}>
                                 <PopoverTrigger asChild>
                                    <Button
                                       variant="outline"
                                       role="combobox"
                                       aria-expanded={openCountry}
                                       className={cn("w-full h-[42px] justify-between font-normal bg-white hover:bg-gray-50 focus:ring-[#10a36e] text-gray-700", errors.country ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500" : "border-gray-300")}
                                    >
                                       {country ? country : dict.tourInquire.selectCountry}
                                       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-full p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                                    <Command>
                                       <CommandInput placeholder={dict.tourInquire.searchCountry} className="h-9" />
                                       <CommandList className="max-h-[220px] overflow-y-auto">
                                          <CommandEmpty>{dict.tourInquire.noCountry}</CommandEmpty>
                                          <CommandGroup>
                                             {COUNTRIES.map((c) => (
                                                <CommandItem
                                                   key={c}
                                                   value={c}
                                                   onSelect={(currentValue) => {
                                                      setCountry(currentValue === country ? "" : currentValue)
                                                      setOpenCountry(false)
                                                   }}
                                                >
                                                   <Check
                                                      className={cn(
                                                         "mr-2 h-4 w-4",
                                                         country === c ? "opacity-100" : "opacity-0"
                                                      )}
                                                   />
                                                   {c}
                                                </CommandItem>
                                             ))}
                                          </CommandGroup>
                                       </CommandList>
                                    </Command>
                                 </PopoverContent>
                              </Popover>
                           </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 md:w-1/2">
                           <label className="md:w-28 text-[13px] font-semibold text-gray-800 shrink-0">{dict.tourInquire.city}:</label>
                           <div className="w-full md:flex-1">
                              <Input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder={dict.tourInquire.selectCity} className="h-[42px] border-gray-300 focus-visible:ring-[#10a36e] bg-white text-[14px]" />
                           </div>
                        </div>
                     </div>

                     {/* Row 4: Social Media */}
                     <div className="flex flex-col md:flex-row gap-5">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 md:w-1/2">
                           <div className="md:w-28 flex flex-col shrink-0">
                              <label className="text-[13px] font-semibold text-gray-800">{dict.tourInquire.socialMedia}:</label>
                              <span className="text-[11px] text-gray-500 font-normal">{dict.tourInquire.socialMediaHint}</span>
                           </div>
                           <div className="w-full md:flex-1">
                              <Input type="text" value={socialMedia} onChange={e => setSocialMedia(e.target.value)} placeholder={dict.tourInquire.socialMediaPlaceholder} className="h-[42px] border-gray-300 focus-visible:ring-[#10a36e] bg-white text-[14px]" />
                           </div>
                        </div>
                        <div className="hidden md:block md:w-1/2"></div>
                     </div>

                  </div>
               </div>

               {/* Section 3: Other Requirements */}
               <div className="bg-white p-6 md:p-8 rounded-[12px] shadow-sm border border-gray-100">
                  <h3 className="text-[17px] font-bold text-[#333] mb-4">{dict.tourInquire.specialRequirement}</h3>
                  <Textarea
                     rows={5}
                     value={specialRequirements}
                     onChange={e => setSpecialRequirements(e.target.value)}
                     placeholder={dict.tourInquire.specialRequirementPlaceholder}
                     className="w-full border-gray-200 rounded-lg p-4 bg-[#f9fafb] text-[14px] focus-visible:border-[#10a36e] focus-visible:bg-white focus-visible:ring-0 transition-colors resize-y leading-relaxed"
                  />
               </div>
            </div>

            <div className="mt-8 mb-4 max-w-2xl mx-auto text-center flex flex-col items-center">
               {submitMessage && (
                  <div className={`mb-6 p-4 rounded-lg text-[14px] font-semibold flex items-center gap-2 ${submitMessage.type === 'success' ? 'bg-[#f0faf5] text-[#10a36e] border border-[#10a36e]' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                     {submitMessage.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                     {submitMessage.text}
                  </div>
               )}
               <p className="text-[13px] text-gray-600 mb-8 font-medium bg-red-50 py-2.5 px-5 rounded-lg inline-flex items-center gap-2">
                  <span className="text-red-500 font-bold">(*)</span> {dict.tourInquire.spamNotice}
               </p>

               <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="bg-[#10a36e] hover:bg-[#0d8055] text-white px-12 h-14 rounded-full font-bold text-[16px] shadow-lg hover:shadow-xl transition-all min-w-[240px]">
                  {isSubmitting ? dict.tourInquire.submitting : dict.tourInquire.inquireNow}
               </Button>
            </div>

         </div>
      </div>
   );
}

