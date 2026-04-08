"use client";

import Image from "next/image";
import { Share, Pencil, Heart, Phone, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { useState, useCallback, useEffect } from "react";
import { fetchMorePhotosAction } from "@/app/hotel/[slug]/actions";
import { useParams } from "next/navigation";
import { useFavorites } from "@/hooks/use-favorites";

function RatingStars() {
  return (
    <div className="flex gap-1 mx-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill="#FFB800" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

const DEFAULT_PHOTOS = [
  "/images/hotel_main.png",
  "/images/hotel_tourist.png",
  "/images/hotel_suite.png",
  "/images/hotel_dining.png"
];

export function HotelGallery({
  name,
  rating,
  reviewsCount,
  photos = [],
  address,
  locationId,
  langQuery,
  isBookingPhotos,
  phone
}: {
  name?: string;
  rating?: number;
  reviewsCount?: number;
  photos?: string[];
  address?: string;
  locationId?: string;
  langQuery?: string;
  isBookingPhotos?: boolean;
  phone?: string;
}) {
  const { dict, locale } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;
  const { toggleFavorite, isFavorite, isClient } = useFavorites();
  const isLiked = isClient ? isFavorite(slug, 'hotel') : false;

  // Gallery Pagination States
  const [activePhotos, setActivePhotos] = useState<string[]>(photos?.length > 0 ? photos : DEFAULT_PHOTOS);
  const [offset, setOffset] = useState<number>(10); // Standard API returns 10 initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasEnded, setHasEnded] = useState(isBookingPhotos ?? false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const scrollToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMorePhotos = useCallback(async () => {
    if (!locationId || isLoadingMore || hasEnded) return;
    setIsLoadingMore(true);
    const newPhotos = await fetchMorePhotosAction(locationId, 10, offset, langQuery || "en_US");

    // Filter out duplicates just in case
    const uniqueNew = newPhotos.filter((p: string) => !activePhotos.includes(p));

    if (uniqueNew.length > 0) {
      setActivePhotos(prev => [...prev, ...uniqueNew]);
      setOffset(prev => prev + 10);
    }

    // Stop fetching if API returned less than requested limit (meaning we hit the end)
    if (newPhotos.length < 10) {
      setHasEnded(true);
    }
    setIsLoadingMore(false);
  }, [locationId, offset, langQuery, isLoadingMore, hasEnded, activePhotos]);

  // Mobile Swipe Handler
  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtEnd = target.scrollLeft + target.clientWidth >= target.scrollWidth - 20;
    if (isAtEnd) {
      loadMorePhotos();
    }
  };

  // Keyboard navigation for Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, currentPhotoIndex, activePhotos.length]);

  // Modal Controls
  const openModal = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden"; // lock background scroll
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const handlePrev = () => {
    if (currentPhotoIndex > 0) setCurrentPhotoIndex(prev => prev - 1);
  };

  const handleNext = async () => {
    if (currentPhotoIndex < activePhotos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);

      // Lookahead: Pre-fetch if we're near the end of the loaded array (e.g. 2 photos left)
      if (currentPhotoIndex === activePhotos.length - 3) {
        loadMorePhotos();
      }
    } else {
      // Reached the end of the array, force fetch and wait
      await loadMorePhotos();
      if (!hasEnded && activePhotos.length > currentPhotoIndex + 1) {
        setCurrentPhotoIndex(prev => prev + 1);
      }
    }
  };

  // Safe slice for the basic 4 grid desktop view
  const displayPhotos = activePhotos.length >= 4 ? activePhotos : [...activePhotos, ...DEFAULT_PHOTOS].slice(0, 4);

  return (
    <div className="w-full pb-8">
      {/* Hotel Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        {/* Title and Ratings */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl md:text-[34px] font-bold text-[#004f32] tracking-tight">
            {name || "Khách sạn Tự chọn"}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <span className="font-bold text-base">{rating || "4,9"}</span>
            <RatingStars />
            <button onClick={scrollToReviews} className="hover:underline text-gray-700 underline-offset-2">
              ({reviewsCount || 40} {dict.hotelGallery?.reviews || "đánh giá"})
            </button>
            <span className="text-gray-400 mx-1">•</span>
            <span className="text-gray-700 line-clamp-1 max-w-[300px]" title={address}>
              {address}
            </span>
          </div>

          {phone && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mt-1">
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:underline shrink-0">
              <Phone className="w-4 h-4" />
              {phone}
            </a>
          </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-4 text-sm font-semibold text-gray-900">
            <button className="flex items-center gap-1.5 hover:text-green-800 transition-colors">
              <Share className="w-4 h-4" strokeWidth={2} />
              {dict.hotelGallery?.share || "Chia sẻ"}
            </button>
            <button onClick={scrollToReviews} className="flex items-center gap-1.5 hover:text-green-800 transition-colors">
              <Pencil className="w-4 h-4" strokeWidth={2} />
              {dict.hotelDetail?.writeReview || "Đánh giá"}
            </button>
            <button 
              onClick={() => {
                toggleFavorite({
                  id: slug,
                  type: 'hotel',
                  title: name || "Khách sạn",
                  image: displayPhotos[0] || "",
                  url: `/hotel/${slug}`
                });
              }}
              className={`flex items-center gap-1.5 transition-colors ${isLiked ? "text-red-500" : "hover:text-green-800"}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} strokeWidth={isLiked ? 0 : 2} />
              {isLiked ? (locale === 'vi' ? 'Đã lưu' : 'Saved') : (dict.hotelGallery?.save || "Lưu")}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE GALLERY: Swipeable Horizontal Slider (Hidden on Desktop) */}
      <div
        className="flex md:hidden overflow-x-auto snap-x snap-mandatory pb-2 gap-2 scrollbar-hide relative group"
        onScroll={handleMobileScroll}
      >
        {activePhotos.map((photoUrl, idx) => (
          <div key={`${photoUrl}-${idx}`} className="relative w-[90vw] shrink-0 h-[280px] snap-center rounded-xl overflow-hidden shadow-sm">
            <Image
              src={photoUrl}
              alt={`Mobile Photo ${idx + 1}`}
              fill
              unoptimized={photoUrl ? (photoUrl.includes('127.0.0.1') || photoUrl.includes('localhost')) : false}
              className="object-cover"
              sizes="(max-width: 768px) 90vw"
              priority={idx === 0}
            />
            {/* Mobile Photo Counter Overlay */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold tracking-wider">
              {idx + 1} / {activePhotos.length}{!hasEnded && '+'}
            </div>
          </div>
        ))}

        {/* Loading Spinner for Infinite Scroll trigger on Mobile */}
        {isLoadingMore && (
          <div className="relative w-[50vw] shrink-0 h-[280px] snap-center rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#004f32] animate-spin" />
          </div>
        )}
      </div>

      {/* DESKTOP GALLERY: Masonry Grid (Hidden on Mobile) */}
      <div className="hidden md:flex flex-row gap-1 h-[460px] rounded-xl overflow-hidden bg-gray-100">
        {/* Main large image */}
        <div
          className="relative w-2/3 h-full cursor-pointer group"
          onClick={() => openModal(0)}
        >
          <Image
            src={displayPhotos[0]}
            alt={`${name} Main Photo`}
            fill
            unoptimized={displayPhotos[0] ? (displayPhotos[0].includes('127.0.0.1') || displayPhotos[0].includes('localhost')) : false}
            className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            sizes="(max-width: 1200px) 66vw, 800px"
            priority
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Right side 3 small images */}
        <div className="w-1/3 flex flex-col gap-1 h-full relative">
          <div className="relative w-full h-1/3 cursor-pointer group overflow-hidden" onClick={() => openModal(1)}>
            <Image src={displayPhotos[1]} alt="Gallery 1" fill unoptimized={displayPhotos[1] ? (displayPhotos[1].includes('127.0.0.1') || displayPhotos[1].includes('localhost')) : false} className="object-cover transition-transform duration-500 hover:scale-105" sizes="33vw" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="relative w-full h-1/3 cursor-pointer group overflow-hidden" onClick={() => openModal(2)}>
            <Image src={displayPhotos[2]} alt="Gallery 2" fill unoptimized={displayPhotos[2] ? (displayPhotos[2].includes('127.0.0.1') || displayPhotos[2].includes('localhost')) : false} className="object-cover transition-transform duration-500 hover:scale-105" sizes="33vw" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="relative w-full h-1/3 cursor-pointer group overflow-hidden" onClick={() => openModal(3)}>
            <Image src={displayPhotos[3]} alt="Gallery 3" fill unoptimized={displayPhotos[3] ? (displayPhotos[3].includes('127.0.0.1') || displayPhotos[3].includes('localhost')) : false} className="object-cover transition-transform duration-500 hover:scale-105" sizes="33vw" />

            {/* Dark gradient overlay for "View All" button */}
            <div className="absolute inset-0 bg-gray-900/40 group-hover:bg-gray-900/60 transition-colors flex items-center justify-center backdrop-blur-[2px]">
              <div className="text-white font-bold text-lg tracking-wide border-2 border-white/80 px-4 py-2 rounded-lg flex items-center gap-2">
                Hiển thị tất cả ảnh
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP MODAL LIGHTBOX */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center backdrop-blur-md">
          {/* Top Bar Navigation */}
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-50 pointer-events-none">
            <span className="text-white/80 font-medium tracking-widest text-sm bg-black/50 px-4 py-1.5 rounded-full pointer-events-auto select-none">
              {currentPhotoIndex + 1} / {activePhotos.length} {!hasEnded && "(Loading...)"}
            </span>
            <button
              onClick={closeModal}
              className="pointer-events-auto p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors group"
            >
              <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Left Button */}
          <button
            onClick={handlePrev}
            disabled={currentPhotoIndex === 0}
            className={`absolute left-4 lg:left-8 p-3 lg:p-4 rounded-full bg-white/10 text-white transition-all z-50
              ${currentPhotoIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20 hover:scale-110'}`}
          >
            <ChevronLeft className="w-8 h-8 lg:w-10 lg:h-10" strokeWidth={1.5} />
          </button>

          {/* Centered Image */}
          <div className="relative w-full max-w-7xl h-full max-h-[85vh] flex items-center justify-center px-24">
            <div className="relative w-full h-full">
              <Image
                src={activePhotos[currentPhotoIndex] || DEFAULT_PHOTOS[0]}
                alt={`Full Gallery Photo ${currentPhotoIndex + 1}`}
                fill
                unoptimized={(activePhotos[currentPhotoIndex] || DEFAULT_PHOTOS[0]).includes('127.0.0.1') || (activePhotos[currentPhotoIndex] || DEFAULT_PHOTOS[0]).includes('localhost')}
                className={`object-contain transition-opacity duration-300 ${isLoadingMore && currentPhotoIndex === activePhotos.length - 1 ? 'opacity-50' : 'opacity-100'}`}
                quality={100}
                priority
              />
              {isLoadingMore && currentPhotoIndex === activePhotos.length - 1 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/80 px-6 py-4 rounded-2xl flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <span className="text-white font-medium text-sm">Đang tải chùm ảnh mới...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Button */}
          <button
            onClick={handleNext}
            disabled={hasEnded && currentPhotoIndex === activePhotos.length - 1}
            className={`absolute right-4 lg:right-8 p-3 lg:p-4 rounded-full bg-white/10 text-white transition-all z-50
              ${hasEnded && currentPhotoIndex === activePhotos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20 hover:scale-110'}`}
          >
            <ChevronRight className="w-8 h-8 lg:w-10 lg:h-10" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
