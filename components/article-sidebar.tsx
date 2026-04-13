"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function ArticleSidebar({ articles }: { articles: any[] }) {
  const [activeTab, setActiveTab] = useState<"trending" | "latest">("trending");

  // Just randomly split or shuffle articles for the two tabs to simulate varied content
  const trendingArticles = articles.slice(0, 5);
  const latestArticles = [...articles].reverse().slice(0, 5);

  const displayList = activeTab === "trending" ? trendingArticles : latestArticles;

  return (
    <div className="sticky top-24 w-full">
      <div className="flex items-center border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("trending")}
          className={`pb-3 px-1 text-[13px] font-bold tracking-wider uppercase transition-colors relative ${
            activeTab === "trending" ? "text-red-600" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Trending
          {activeTab === "trending" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("latest")}
          className={`pb-3 px-4 ml-2 text-[13px] font-bold tracking-wider uppercase transition-colors relative ${
            activeTab === "latest" ? "text-red-600" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Latest
          {activeTab === "latest" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600" />
          )}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {displayList.map((item, idx) => (
          <Link href={`/articles/${item.is_ai_generated === false ? item.id : item.slug}`} key={item.id} className="flex gap-4 group">
            <div className="relative w-[100px] h-[75px] shrink-0 rounded-md overflow-hidden bg-gray-100">
              <Image
                src={item.image || "/images/default-hotel.jpg"}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="100px"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="text-[14px] font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                {item.title}
              </h4>
               <span className="text-[11px] text-gray-400 mt-1 uppercase font-medium flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
               </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
