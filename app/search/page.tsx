import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { getDictionary } from "@/lib/i18n";

// Mock Data
const SEARCH_RESULTS = [
  {
    id: "hanoi-daewoo",
    name: "Hanoi Daewoo Hotel",
    type: "HOTEL",
    rating: 4.5,
    reviews: 2451,
    location: "Hanoi, Vietnam",
    image: "/images/ha_long.png", // reusing existing mock images
    snippet: '"...Great location, beautiful swimming pool. The breakfast buffet has a wide variety of both Vietnamese and Western options..."',
  },
  {
    id: "lotte-hanoi",
    name: "Lotte Hotel Hanoi",
    type: "HOTEL",
    rating: 5.0,
    reviews: 3102,
    location: "Ba Dinh, Hanoi, Vietnam",
    image: "/images/stella.png",
    snippet: '"...Exceptional service and view from the top floors. The staff was incredibly attentive to all our needs during our stay..."',
  },
  {
    id: "aprricot",
    name: "Apricot Hotel",
    type: "HOTEL",
    rating: 4.5,
    reviews: 1843,
    location: "Hoan Kiem, Hanoi, Vietnam",
    image: "/images/haian.png",
    snippet: '"...Located right next to Hoan Kiem Lake, the rooftop bar offers a spectacular view of the city center at night..."',
  },
];

function ResultRating({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((bubble) => {
        const isFull = score >= bubble;
        const isHalf = score >= bubble - 0.5 && score < bubble;

        if (isFull) {
          return (
            <svg key={bubble} width="14" height="14" viewBox="0 0 16 16" fill="#00aa6c" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="8" />
            </svg>
          );
        } else if (isHalf) {
          return (
            <svg key={bubble} width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id={`half-${bubble}`}>
                  <rect x="0" y="0" width="8" height="16" />
                </clipPath>
              </defs>
              <circle cx="8" cy="8" r="7.5" fill="none" stroke="#00aa6c" strokeWidth="1" />
              <circle cx="8" cy="8" r="8" fill="#00aa6c" clipPath={`url(#half-${bubble})`} />
            </svg>
          );
        } else {
          return (
            <svg key={bubble} width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#00aa6c" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7.5" />
            </svg>
          );
        }
      })}
    </div>
  );
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const searchQuery = typeof resolvedParams.q === 'string' && resolvedParams.q.trim() !== '' ? resolvedParams.q : "ha noi";
  const dict = await getDictionary();

  return (
    <div className="flex flex-col flex-1 bg-[#f9f9f9] min-h-screen">
      {/* Search Bar Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center">
          <form action="/search" method="GET" className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              className="w-full h-12 border-2 border-gray-300 rounded-full pl-12 pr-4 text-[16px] font-medium focus:border-black focus:outline-none transition-colors shadow-sm"
            />
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex items-start gap-8">
        {/* Left Sidebar - Filters for Hotels */}
        <div className="hidden md:block w-[280px] shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6">{dict.searchPage.filterResults}</h2>

            <div className="flex flex-col gap-6">
              {/* Hotel Class Filter */}
              <div>
                <h3 className="font-bold text-[15px] mb-3">{dict.searchPage.hotelClass}</h3>
                <div className="flex flex-col gap-3">
                  {[5, 4, 3, 2].map(star => (
                    <label key={star} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 border-gray-300 rounded text-black focus:ring-black accent-black" />
                      <div className="flex gap-0.5 text-yellow-400">
                        {Array(star).fill(0).map((_, i) => (
                          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Price Filter */}
              <div>
                <h3 className="font-bold text-[15px] mb-3">{dict.searchPage.pricePerNight}</h3>
                <div className="flex flex-col gap-3">
                  {["$0 - $50", "$50 - $100", "$100 - $200", "$200+"].map(price => (
                    <label key={price} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 border-gray-300 rounded text-black focus:ring-black accent-black" />
                      <span className="text-[15px] text-gray-700 group-hover:text-black">{price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Search Results */}
        <div className="flex-1 w-full min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-[26px] md:text-[30px] font-extrabold text-[#004f32] tracking-tight">
              {dict.searchPage.topResults} "{searchQuery}"
            </h1>
          </div>

          <div className="flex flex-col gap-4">
            {SEARCH_RESULTS.map((result) => (
              <Link href={`/hotel/${result.id}`} key={result.id} className="group">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row min-h-[220px]">

                  {/* Image Area */}
                  <div className="w-full sm:w-[280px] h-[200px] sm:h-auto relative shrink-0">
                    <Image
                      src={result.image}
                      alt={result.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content Area */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
                    <div className="border border-gray-300 text-gray-700 text-[11px] font-bold px-2 py-0.5 rounded w-fit mb-2 tracking-wide uppercase">
                      {result.type}
                    </div>

                    <h2 className="text-[20px] font-bold text-gray-900 group-hover:underline decoration-2 underline-offset-2 mb-1 leading-normal">
                      {result.name}
                    </h2>

                    <div className="flex items-center flex-wrap gap-1.5 mb-1 text-[13px] text-gray-700">
                      <span className="font-bold text-[14px]">{Number.isInteger(result.rating) ? result.rating.toFixed(1) : result.rating}</span>
                      <ResultRating score={result.rating} />
                      <span className="underline decoration-gray-400 hover:text-black hover:decoration-black cursor-pointer ml-1">
                        ({result.reviews.toLocaleString()} {dict.home.reviews})
                      </span>
                    </div>

                    <div className="text-[14px] text-gray-500 mb-2">
                      {result.location}
                    </div>

                    <div className="text-[14px] text-gray-600 mb-4">
                      {result.reviews.toLocaleString()} {dict.searchPage.reviewsOpinions}
                    </div>

                    <p className="text-[14px] text-gray-800 italic line-clamp-2 mt-auto">
                      {result.snippet}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
