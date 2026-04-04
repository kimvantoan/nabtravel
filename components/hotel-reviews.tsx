"use client";

import { useState } from "react";
import { ChevronDown, Pencil, ThumbsUp } from "lucide-react";
import { useLanguage } from "@/app/providers";

function ExpandableText({ text, showMoreText, showLessText }: { text: string, showMoreText: string, showLessText: string }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 250;

  if (!text || text.length <= maxLength) {
    return <p className="text-[15px] text-gray-800 leading-relaxed mb-6 whitespace-pre-line">{text}</p>;
  }

  const displayText = expanded ? text : text.slice(0, maxLength) + "...";

  return (
    <div className="mb-6">
      <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[#00aa6c] font-bold text-[14px] mt-1 hover:underline focus:outline-none"
      >
        {expanded ? showLessText : showMoreText}
      </button>
    </div>
  );
}

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

export interface ReviewData {
  id: string | number;
  user: {
    name: string;
    avatar: string;
    location: string;
    contributions: number;
    helpfulVotes: number;
  };
  dateWritten: string;
  rating: number;
  title: string;
  text: string;
  dateOfStay: string;
  tripType: string;
  helpfulCount: number;
  timestamp?: number;
}

export function HotelReviews({ reviews }: { reviews?: ReviewData[] }) {
  const { dict, locale } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(5);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const baseReviews = reviews?.length ? reviews : [];

  const sortedReviews = [...baseReviews].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    // Newest
    const dateA = a.timestamp !== undefined ? a.timestamp : (a.dateWritten && a.dateWritten !== "Recent" ? new Date(a.dateWritten).getTime() : 0);
    const dateB = b.timestamp !== undefined ? b.timestamp : (b.dateWritten && b.dateWritten !== "Recent" ? new Date(b.dateWritten).getTime() : 0);
    return (dateB || 0) - (dateA || 0);
  });

  const currentReviews = sortedReviews.slice(0, visibleCount);
  const hasMore = visibleCount < sortedReviews.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  // Close dropdowns when clicking outside (simple approach for now)
  const closeDropdowns = () => {
    setShowSortDropdown(false);
  };

  const showMoreText = locale === 'vi' ? "Xem thêm" : "Show more";
  const showLessText = locale === 'vi' ? "Ẩn bớt" : "Show less";

  return (
    <div id="reviews" className="w-full mt-10 border-t border-gray-200 py-10 px-4" onClick={() => { if (showSortDropdown) closeDropdowns() }}>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-[24px] font-extrabold text-black tracking-tight">
          {dict.hotelDetail.allReviews} ({sortedReviews.length})
        </h2>
        <button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-bold transition-colors w-fit">
          <Pencil className="w-4 h-4" />
          {dict.hotelDetail.writeReview}
        </button>
      </div>

      {/* Filters and search removed */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setShowSortDropdown(!showSortDropdown); }}
            className="flex items-center gap-2 border border-gray-400 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors text-[14px]">
            {sortBy === 'newest' ? (locale === 'vi' ? "Mới nhất" : "Newest") : sortBy === 'highest' ? (locale === 'vi' ? "Đánh giá cao nhất" : "Highest Rating") : (locale === 'vi' ? "Đánh giá thấp nhất" : "Lowest Rating")}
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {showSortDropdown && (
            <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-48 overflow-hidden">
              <button onClick={() => { setSortBy("newest"); setShowSortDropdown(false); setVisibleCount(5); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-[14px]">{locale === 'vi' ? "Mới nhất" : "Newest"}</button>
              <button onClick={() => { setSortBy("highest"); setShowSortDropdown(false); setVisibleCount(5); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-[14px] border-t border-gray-100">{locale === 'vi' ? "Đánh giá cao nhất" : "Highest Rating"}</button>
              <button onClick={() => { setSortBy("lowest"); setShowSortDropdown(false); setVisibleCount(5); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-[14px] border-t border-gray-100">{locale === 'vi' ? "Đánh giá thấp nhất" : "Lowest Rating"}</button>
            </div>
          )}
        </div>
      </div>

      {/* Review List */}
      <div className="flex flex-col gap-6">
        {currentReviews.map((review) => (
          <div key={review.id} className="w-full border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* User Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Avatar removed as requested */}
                <div className="flex flex-col">
                  <div className="text-[15px] font-bold text-gray-900 leading-tight">
                    {review.user.name} <span className="font-normal text-gray-500 text-[14px]">{locale === 'vi' ? "đã viết đánh giá" : "wrote a review"} {review.dateWritten === 'Recent' && locale === 'vi' ? 'Gần đây' : review.dateWritten}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Review Content */}
            <div className="mt-4 mb-3">
              <ReviewRating score={review.rating} />
              <h3 className="text-[16px] font-bold text-black mt-2 leading-tight">
                {review.title}
              </h3>
            </div>

            <ExpandableText text={review.text} showMoreText={showMoreText} showLessText={showLessText} />

            <div className="flex flex-col gap-1 text-[13px] text-gray-600 mb-6">
              <div>
                <span className="font-bold text-gray-900">{locale === 'vi' ? "Ngày lưu trú" : "Date of stay"}:</span> {review.dateOfStay === 'Recent' && locale === 'vi' ? 'Gần đây' : review.dateOfStay}
              </div>
              {/* Trip type removed as requested */}
            </div>

            {review.helpfulCount > 0 && (
              <div className="flex justify-end mt-2">
                <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors font-medium text-[13px] text-gray-800 border border-transparent hover:border-gray-200">
                  <ThumbsUp className="w-4 h-4" />
                  {review.helpfulCount}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="border-2 border-black bg-white hover:bg-gray-50 text-black px-8 py-3 rounded-full font-bold transition-colors w-fit"
          >
            {locale === 'vi' ? "Xem thêm bình luận" : "Show more comments"}
          </button>
        </div>
      )}
    </div>
  );
}
