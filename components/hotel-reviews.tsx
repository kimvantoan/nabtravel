"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Pencil, ThumbsUp, Star } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { useSession, signIn } from "next-auth/react";

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
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = score >= star;
        return (
          <svg key={star} width="18" height="18" viewBox="0 0 24 24" fill={isFull ? "#FFB800" : "#E5E7EB"} xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
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

export function HotelReviews({ reviews, slug }: { reviews?: ReviewData[], slug?: string }) {
  const { dict, locale } = useLanguage();
  const { data: session } = useSession();
  const [visibleCount, setVisibleCount] = useState(5);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // States for writing review
  const [isWriting, setIsWriting] = useState(false);
  const [writeRating, setWriteRating] = useState(5);
  const [writeContent, setWriteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState<ReviewData[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (slug) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotels/${slug}/reviews`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mapped = data.map((r: any) => ({
              id: `local_${r.id}`,
              user: { name: r.user_name, avatar: "", location: "Vietnam", contributions: 0, helpfulVotes: 0 },
              dateWritten: "Recent",
              rating: r.rating,
              title: "",
              text: r.content,
              dateOfStay: "Recent",
              tripType: "",
              helpfulCount: 0,
              timestamp: new Date(r.created_at).getTime()
            }));
            setLocalReviews(mapped);
          }
        }).catch(console.error);
    }
  }, [slug]);

  const baseReviews = [...localReviews, ...(reviews?.length ? reviews : [])];

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
        <button
          onClick={() => {
            if (!session) {
              signIn("google");
            } else {
              setIsWriting(!isWriting);
            }
          }}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-bold transition-colors w-fit">
          <Pencil className="w-4 h-4" />
          {mounted && session ? (isWriting ? (locale === 'vi' ? 'Hủy' : 'Cancel') : dict.hotelDetail.writeReview) : (locale === 'vi' ? 'Đăng nhập Google để Viết' : 'Login Google to Write')}
        </button>
      </div>

      {/* Review Form Area */}
      {isWriting && session && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 mt-4">
          <div className="flex items-center gap-4 mb-4">
            <img src={session.user?.image || ""} alt="" className="w-12 h-12 rounded-full border border-gray-300" />
            <div>
              <div className="font-bold text-[16px]">{session.user?.name}</div>
              <div className="text-[14px] text-gray-500">{session.user?.email}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="font-bold text-[14px] mb-2">{locale === 'vi' ? 'Bạn chấm điểm thế nào?' : 'How do you rate?'}</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setWriteRating(star)}>
                  <Star className={`w-8 h-8 ${writeRating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} hover:scale-110 transition-transform`} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="w-full h-32 p-4 border border-gray-300 rounded-xl outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 mb-4 text-[15px]"
            placeholder={locale === 'vi' ? 'Chia sẻ cảm nhận của bạn về kỳ nghỉ...' : 'Share your thoughts about your stay...'}
            value={writeContent}
            onChange={e => setWriteContent(e.target.value)}
          ></textarea>

          <button
            disabled={isSubmitting || writeContent.length < 5}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotels/${slug}/reviews`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_name: session.user?.name,
                    user_email: session.user?.email,
                    user_avatar: session.user?.image,
                    rating: writeRating,
                    content: writeContent
                  })
                });
                if (res.ok) {
                  const data = await res.json();
                  if (data.review) {
                    setLocalReviews(prev => [{
                      id: `local_${Date.now()}`,
                      user: { name: session.user?.name || "User", avatar: session.user?.image || "", location: "Vietnam", contributions: 0, helpfulVotes: 0 },
                      dateWritten: "Recent",
                      rating: writeRating,
                      title: "",
                      text: writeContent,
                      dateOfStay: "Recent",
                      tripType: "",
                      helpfulCount: 0,
                      timestamp: Date.now()
                    }, ...prev]);
                    setWriteContent("");
                    setIsWriting(false);
                  }
                }
              } catch (e) { }
              setIsSubmitting(false);
            }}
            className="bg-[#00aa6c] text-white font-bold px-8 py-3 rounded-full hover:bg-[#008f5a] transition-colors disabled:opacity-50">
            {isSubmitting ? '...' : (locale === 'vi' ? 'Đăng Bình Luận' : 'Post Review')}
          </button>
        </div>
      )}

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={review.user?.avatar === '/images/tourist.png' ? `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name || 'User')}&background=random` : (review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name || 'User')}&background=random`)}
                  alt={review.user.name || 'User'}
                  className="w-11 h-11 rounded-full border border-gray-100 object-cover shrink-0 shadow-sm"
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name || 'User')}&background=random`; }}
                />
                <div className="flex flex-col justify-center">
                  <div className="text-[15px] font-bold text-gray-900 leading-tight">
                    {review.user.name}
                  </div>
                  <div className="font-medium text-gray-500 text-[13px] mt-0.5">
                    {locale === 'vi' ? "Đã đánh giá" : "Reviewed"} {review.dateWritten === 'Recent' ? (locale === 'vi' ? 'gần đây' : 'recently') : review.dateWritten}
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
