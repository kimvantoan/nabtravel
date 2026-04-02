export function GallerySkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Title skeleton */}
      <div className="mb-4">
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
      {/* Photo grid skeleton */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-2xl overflow-hidden">
        <div className="col-span-2 row-span-2 bg-gray-200" />
        <div className="bg-gray-200" />
        <div className="bg-gray-200" />
        <div className="bg-gray-200" />
        <div className="bg-gray-200" />
      </div>
    </div>
  );
}

export function PricingSkeleton() {
  return (
    <div className="w-full border border-gray-200 rounded-2xl p-6 my-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
      <div className="flex gap-3 mb-6">
        <div className="flex-1 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1 h-12 bg-gray-200 rounded-full" />
        <div className="w-32 h-12 bg-gray-200 rounded-full" />
      </div>
      <div className="border-t pt-6 flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-40" />
        <div className="h-12 bg-gray-200 rounded-full w-44" />
      </div>
    </div>
  );
}

export function AmenitiesSkeleton() {
  return (
    <div className="w-full border border-gray-200 rounded-2xl p-6 my-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="w-full my-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SimilarHotelsSkeleton() {
  return (
    <div className="w-full my-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
            <div className="h-40 bg-gray-200" />
            <div className="p-3">
              <div className="h-4 bg-gray-200 rounded w-4/5 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
