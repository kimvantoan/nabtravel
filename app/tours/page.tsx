import { ToursClientView } from "@/components/tours-client-view";
import { getDictionary } from "@/lib/i18n";
import fs from "fs";
import path from "path";

async function fetchVietnamTours(searchQuery?: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    const url = new URL(`${backendUrl}/api/tours`);
    url.searchParams.set('limit', '12');
    url.searchParams.set('skip', '0');
    if (searchQuery) {
      // Map basic slugs to correct Vietnamese keywords if necessary, or just rely on UI search parsing
      const displaySearch = searchQuery.replace(/-/g, ' '); 
      url.searchParams.set('q', displaySearch);
    }
    
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 } // cache for 1 minute
    });
    
    if (res.ok) {
      const data = await res.json();
      return { tours: data.tours || [], total: data.total || 0 };
    }
  } catch (error) {
    console.error("Error loading tours from API", error);
  }
  return { tours: [], total: 0 };
}


export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const dict = await getDictionary();
  const params = await searchParams;
  let search = (typeof params.search === 'string' ? params.search : undefined) || (typeof params.q === 'string' ? params.q : undefined);

  const { tours, total } = await fetchVietnamTours(search);

  // Fallback normalize UI Search box
  let displaySearch = search || "";
  if (search) {
    const slugMap: Record<string, string> = {
      'ha-noi': 'Hà Nội',
      'da-nang': 'Đà Nẵng',
      'nha-trang': 'Nha Trang',
      'da-lat': 'Đà Lạt',
      'sa-pa': 'Sa Pa',
      'hoi-an': 'Hội An',
      'phu-quoc': 'Phú Quốc',
      'ho-chi-minh': 'Hồ Chí Minh'
    };
    if (slugMap[search.toLowerCase()]) {
      displaySearch = slugMap[search.toLowerCase()];
    }
  }

  return <ToursClientView initialTours={tours} initialTotal={total} initialSearchQuery={displaySearch} />;
}
