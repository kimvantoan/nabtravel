export default function HotelLoading() {
  return (
    <div className="flex flex-col flex-1 bg-white min-h-screen pb-16 animate-pulse">
      <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 pt-6">
        {/* Gallery Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <div className="h-10 w-64 md:w-96 bg-gray-300 rounded-lg"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mt-1"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <div className="flex gap-4">
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 w-48 bg-gray-300 rounded-full mt-2"></div>
          </div>
        </div>

        {/* Gallery Images Skeleton */}
        <div className="flex flex-col md:flex-row gap-1 h-auto md:h-[460px] rounded-xl overflow-hidden mb-8">
          <div className="relative w-full md:w-2/3 h-[300px] md:h-full bg-gray-200"></div>
          <div className="w-full md:w-1/3 flex flex-col gap-1 h-[400px] md:h-full">
            <div className="w-full h-1/3 bg-gray-300"></div>
            <div className="w-full h-1/3 bg-gray-200"></div>
            <div className="w-full h-1/3 bg-gray-300"></div>
          </div>
        </div>

        {/* Pricing Skeleton */}
        <div className="w-full border border-gray-100 rounded-2xl bg-gray-50 p-6 mb-8 h-[200px]">
          <div className="h-6 w-48 bg-gray-300 rounded mb-6"></div>
          <div className="flex gap-4">
            <div className="h-12 w-1/3 bg-gray-200 rounded-full"></div>
            <div className="h-12 w-1/3 bg-gray-200 rounded-full"></div>
            <div className="h-12 w-1/3 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Amenities Skeleton */}
        <div className="flex flex-col md:flex-row gap-12 py-10 border-t border-gray-200">
           <div className="w-full md:w-1/3 flex flex-col gap-4">
             <div className="h-6 w-32 bg-gray-300 rounded mb-2"></div>
             <div className="h-16 w-32 bg-gray-200 rounded mb-4"></div>
             {[...Array(6)].map((_, i) => (
                <div key={i} className="h-3 w-full bg-gray-200 rounded"></div>
             ))}
           </div>
           <div className="w-full md:w-2/3 flex flex-col gap-10">
             <div>
               <div className="h-6 w-48 bg-gray-300 rounded mb-6"></div>
               <div className="grid grid-cols-2 gap-4">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className="h-5 w-3/4 bg-gray-200 rounded"></div>
                 ))}
               </div>
             </div>
             <div>
               <div className="h-6 w-48 bg-gray-300 rounded mb-6"></div>
               <div className="grid grid-cols-2 gap-4">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className="h-5 w-3/4 bg-gray-200 rounded"></div>
                 ))}
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
