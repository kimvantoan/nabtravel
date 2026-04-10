"use client";

import { useLanguage } from "@/app/providers";

interface RatingBadgeProps {
  score: number | string | undefined;
  reviewsCount?: number | string;
  className?: string;
  showLabel?: boolean;
}

export function RatingBadge({ score, reviewsCount, className = "", showLabel = true }: RatingBadgeProps) {
  const { locale } = useLanguage();

  const numScore = typeof score === 'string' ? parseFloat(score.replace(',', '.')) : score;
  const safeScore = !isNaN(numScore as number) ? numScore as number : 0;
  if (!safeScore) return null;

  // Format the score nicely (e.g. 8 => 8.0, 8.5 => 8.5)
  // NabTravel uses `,` instead of `.` for Vietnamese localized score usually, but let's standardise according to locale
  const displayScore = locale === 'vi' 
    ? safeScore.toFixed(1).replace('.', ',')
    : safeScore.toFixed(1);

  let label = "";
  if (locale === 'vi') {
    if (safeScore >= 9.0) label = "Tuyệt hảo";
    else if (safeScore >= 8.0) label = "Rất tốt";
    else if (safeScore >= 7.0) label = "Tốt";
    else label = "Đáng giá";
  } else {
    if (safeScore >= 9.0) label = "Exceptional";
    else if (safeScore >= 8.0) label = "Very Good";
    else if (safeScore >= 7.0) label = "Good";
    else label = "Review score";
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-[#004f32] text-white font-bold text-[15px] px-2.5 py-1 rounded-[6px] shadow-sm flex items-center justify-center min-w-[34px]">
        {displayScore}
      </div>
      {(showLabel || reviewsCount) && (
        <div className="flex flex-col">
          {showLabel && <span className="text-[14px] font-bold text-[#004f32] leading-none mb-0.5">{label}</span>}
          {reviewsCount && (
            <span className="text-[12px] text-gray-500 leading-none">
              {reviewsCount} {locale === 'vi' ? 'đánh giá' : 'reviews'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
