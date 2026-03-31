"use client";

import { Search, SlidersHorizontal, ChevronDown, Pencil, MoreHorizontal, ThumbsUp, Info } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/app/providers";

const REVIEWS = [
  {
    id: 1,
    user: {
      name: "Chris T H",
      avatar: "/images/stargazing.png", // Using existing image as placeholder
      location: "Bournemouth, United Kingdom",
      contributions: 152,
      helpfulVotes: 79,
    },
    dateWritten: "Jun 2017",
    rating: 4,
    title: "High value hotel",
    text: "Spacious and clean room. The staff were very friendly, including the guard, doorman, receptionist, etc. The view was not good at all with no balcony or window to the sea view. But I still recommend this hotel because of the warm and comfortable atmosphere there.",
    dateOfStay: "June 2017",
    tripType: "Traveled with family",
    helpfulCount: 0,
  },
  {
    id: 2,
    user: {
      name: "Alexey P",
      avatar: "/images/art.png",
      location: "Krasnaya Polyana, Russia",
      contributions: 10,
      helpfulVotes: 15,
    },
    dateWritten: "Oct 2016",
    rating: 3,
    title: "Good but can be better",
    text: "The room isn't very clean. The window was dirty that affect view. No balcony in Delux room. The swimming is very small and actually under construction now. Staff isn't good in english. Breakfast menu is pretty poor. Almost impossible to find good places with european or russian food in this area.",
    dateOfStay: "October 2016",
    tripType: "Traveled as a couple",
    helpfulCount: 0,
  }
];

function ReviewRating({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5 items-center my-2">
      {[1, 2, 3, 4, 5].map((bubble) => {
        const isFull = score >= bubble;
        if (isFull) {
          return (
            <svg key={bubble} width="16" height="16" viewBox="0 0 16 16" fill="#00aa6c" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="8" />
            </svg>
          );
        } else {
          return (
            <svg key={bubble} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#00aa6c" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7.25" />
            </svg>
          );
        }
      })}
    </div>
  );
}

export function HotelReviews() {
  const { dict } = useLanguage();
  return (
    <div id="reviews" className="w-full mt-10 border-t border-gray-200 py-10 px-4">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-[24px] font-extrabold text-black tracking-tight">
          {dict.hotelDetail.allReviews} (32)
        </h2>
        <button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-bold transition-colors w-fit">
          <Pencil className="w-4 h-4" />
          {dict.hotelDetail.writeReview}
        </button>
      </div>

      <p className="text-[13px] text-gray-500 leading-relaxed max-w-5xl mb-8">
        {dict.hotelReviews?.disclaimer || "Reviews are the subjective opinion of Tripadvisor members and not of Tripadvisor LLC."} <a href="#" className="underline hover:text-black font-medium">{dict.hotelReviews?.transparency || "Review transparency"}</a>.
      </p>

      {/* Filters and search */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <button className="flex items-center gap-2 border border-black rounded-full px-4 py-2 hover:bg-gray-50 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-bold text-[14px]">{dict.hotelDetail.filters} (1)</span>
        </button>

        <button className="flex items-center gap-2 border border-gray-400 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors text-[14px]">
          {dict.hotelDetail.sortBy}
          <ChevronDown className="w-4 h-4 ml-1" />
        </button>
        
        <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />

        <div className="relative flex-1 min-w-[200px] max-w-sm ml-auto md:ml-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder={dict.hotelDetail.searchReviews} 
            className="w-full h-full border border-gray-400 rounded-full py-2.5 pl-11 pr-4 text-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Review List */}
      <div className="flex flex-col gap-6">
        {REVIEWS.map((review) => (
          <div key={review.id} className="w-full border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* User Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0 border border-gray-100">
                  <Image src={review.user.avatar} alt={review.user.name} fill className="object-cover" sizes="48px" />
                </div>
                <div className="flex flex-col">
                  <div className="text-[15px] font-bold text-gray-900 leading-tight">
                    {review.user.name} <span className="font-normal text-gray-500 text-[14px]">{dict.hotelReviews?.wroteReview || "wrote a review"} {review.dateWritten}</span>
                  </div>
                  <div className="text-[13px] text-gray-500 mt-1">
                    {review.user.location} • <span className="font-bold text-black">{review.user.contributions}</span> contributions • <span className="font-bold text-black">{review.user.helpfulVotes}</span> helpful votes
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Review Content */}
            <div className="mt-4 mb-3">
              <ReviewRating score={review.rating} />
              <h3 className="text-[16px] font-bold text-black mt-2 leading-tight">
                {review.title}
              </h3>
            </div>

            <p className="text-[15px] text-gray-800 leading-relaxed mb-6">
              {review.text}
            </p>

            <div className="flex flex-col gap-1 text-[13px] text-gray-600 mb-6">
              <div>
                <span className="font-bold text-gray-900">{dict.hotelReviews?.dateOfStay || "Date of stay"}:</span> {review.dateOfStay}
              </div>
              <div>
                <span className="font-bold text-gray-900">{dict.hotelReviews?.tripType || "Trip type"}:</span> {review.tripType}
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed max-w-4xl border-b border-gray-100 pb-6 mb-4">
              {dict.hotelReviews?.disclaimer || "This review is the subjective opinion of an individual traveler and not of Tripadvisor LLC."} <a href="#" className="underline hover:text-black font-medium">{dict.hotelReviews?.transparency || "Review transparency"}</a>.
            </p>

            <div className="flex justify-end mt-2">
              <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors font-medium text-[13px] text-gray-800 border border-transparent hover:border-gray-200">
                <ThumbsUp className="w-4 h-4" />
                {review.helpfulCount}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
