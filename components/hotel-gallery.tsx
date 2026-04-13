"use client";

import Image from "next/image";
import { Share, Pencil, Heart, Phone, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { useState, useCallback, useEffect } from "react";
import { fetchMorePhotosAction } from "@/app/hotel/[slug]/actions";
import { useParams } from "next/navigation";
import { useFavorites } from "@/hooks/use-favorites";

import { RatingBadge } from "@/components/ui/rating-badge";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadedModalImages, setLoadedModalImages] = useState<Record<number, boolean>>({});
  const [desktopInlineIndex, setDesktopInlineIndex] = useState(0);

  const scrollToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('open-review-form'));
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

  const handleDesktopInlineNext = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (desktopInlineIndex < activePhotos.length - 1) {
      setDesktopInlineIndex(prev => prev + 1);
      if (desktopInlineIndex === activePhotos.length - 3) {
        loadMorePhotos();
      }
    } else {
      await loadMorePhotos();
      if (!hasEnded && activePhotos.length > desktopInlineIndex + 1) {
        setDesktopInlineIndex(prev => prev + 1);
      }
    }
  };

  // Safe slice for the basic view
  const displayPhotos = activePhotos.length > 0 ? activePhotos : DEFAULT_PHOTOS;

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
            <RatingBadge score={rating || 8.5} reviewsCount={reviewsCount} />
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
          <div key={`${photoUrl}-${idx}`} className="relative w-[85vw] shrink-0 h-[280px] snap-center rounded-xl overflow-hidden shadow-sm">
            <Image
              src={photoUrl}
              alt={`Mobile Photo ${idx + 1}`}
              fill
              unoptimized={photoUrl ? (photoUrl.includes('127.0.0.1') || photoUrl.includes('localhost')) : false}
              className="object-cover"
              sizes="(max-width: 768px) 85vw"
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

      {/* DESKTOP GALLERY: Single Image with Hover Slider (Hidden on Mobile) */}
      <div className="hidden md:block relative w-full lg:w-[85%] max-w-6xl mx-auto h-[460px] rounded-xl overflow-hidden bg-gray-100 group cursor-pointer" onClick={() => openModal(desktopInlineIndex)}>
        <Image
          src={displayPhotos[desktopInlineIndex] || DEFAULT_PHOTOS[0]}
          alt={`${name} Main Photo`}
          fill
          unoptimized={(displayPhotos[desktopInlineIndex] || DEFAULT_PHOTOS[0]).includes('127.0.0.1') || (displayPhotos[desktopInlineIndex] || DEFAULT_PHOTOS[0]).includes('localhost')}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Navigation Buttons appear on hover */}
        <button 
           onClick={(e) => { e.stopPropagation(); setDesktopInlineIndex(prev => Math.max(0, prev - 1)); }}
           className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:scale-110 duration-200 ${desktopInlineIndex === 0 ? 'hidden' : ''}`}
        >
          <ChevronLeft className="w-6 h-6 mr-0.5" />
        </button>

        <button 
           onClick={handleDesktopInlineNext}
           className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:scale-110 duration-200 ${hasEnded && desktopInlineIndex === activePhotos.length - 1 ? 'hidden' : ''}`}
        >
          <ChevronRight className="w-6 h-6 ml-0.5" />
        </button>

        {/* View All Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); openModal(0); }}
          className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-gray-900 font-bold px-4 py-2.5 rounded-lg shadow-md text-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-105 z-10"
        >
          Hiển thị tất cả ảnh
        </button>
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
                onLoad={() => setLoadedModalImages(prev => ({...prev, [currentPhotoIndex]: true}))}
              />
              {!loadedModalImages[currentPhotoIndex] && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/50 px-5 py-4 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                </div>
              )}
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
