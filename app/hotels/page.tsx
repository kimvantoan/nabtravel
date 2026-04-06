import { HotelsClientView } from "@/components/hotels-client-view";
import { getDictionary } from "@/lib/i18n";
import { HotelGridData } from "@/components/hotel-grid-card";

async function fetchVietnamHotels(searchQuery?: string): Promise<HotelGridData[]> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${backendUrl}/api/hotels`, {
      next: { revalidate: 60 } // Cache 60 seconds
    });
    
    if (!response.ok) {
      console.error('Failed to fetch hotels from backend');
      return [];
    }

    const hotels = await response.json();
    
    // Nếu có searchQuery thì filter ở đây sơ bộ
    if (searchQuery) {
        // Tối ưu hóa so khớp: bỏ dấu tiếng việt, thay ký tự không phải chữ số thành rỗng
        const normalizeStr = (str: string) => {
           if (!str) return "";
           return str.normalize("NFD")
                     .replace(/[\u0300-\u036f]/g, "") // Xoá dấu
                     .replace(/[^a-zA-Z0-9]/g, "") // Xoá cách, -, kí tự đặc biệt
                     .toLowerCase();
        };
        const safeQuery = normalizeStr(searchQuery);
        return hotels.filter((h: any) => 
            normalizeStr(h.name).includes(safeQuery) ||
            normalizeStr(h.location).includes(safeQuery)
        );
    }
    
    return hotels;

  } catch (error) {
    console.error("Error fetching hotels", error);
    return [];
  }
}

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const dict = await getDictionary();
  const params = await searchParams;
  let search = (typeof params.search === 'string' ? params.search : undefined) || (typeof params.q === 'string' ? params.q : undefined);

  if (!search || search.trim() === '') {
    search = 'Phú Quốc';
  }

  const hotels = await fetchVietnamHotels(search);

  // Map slug back to readable name for display in the Search Input
  let displaySearch = search;
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
    } else {
      // Fallback: capitalize first letter of each word
      displaySearch = search.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  }

  return <HotelsClientView initialHotels={hotels} initialSearchQuery={displaySearch} />;
}
