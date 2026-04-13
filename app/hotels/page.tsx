import { HotelsClientView } from "@/components/hotels-client-view";
import { getDictionary, getLocale } from "@/lib/i18n";
import { HotelGridData } from "@/components/hotel-grid-card";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await searchParams;
  const locale = await getLocale();
  let search = (typeof params.search === 'string' ? params.search : undefined) || (typeof params.q === 'string' ? params.q : undefined);

  let title = locale === 'vi' ? "Khách sạn & Resort Việt Nam | NabTravel" : "Vietnam Hotels & Resorts | NabTravel";
  let description = locale === 'vi' 
    ? "Tìm khách sạn và khu nghỉ dưỡng tốt nhất tại Việt Nam. Tham khảo, so sánh giá cả và đặt phòng an toàn với NabTravel." 
    : "Find the best hotels and resorts in Vietnam. Compare prices, read reviews, and book securely with NabTravel.";

  const viSlugMap: Record<string, { title: string, desc: string }> = {
    'ha-noi': { title: 'Khách sạn Hà Nội', desc: 'Tìm kiếm và đặt phòng khách sạn tại Hà Nội với giá tốt nhất, gần hồ Hoàn Kiếm và các điểm tham quan nổi tiếng.' },
    'da-nang': { title: 'Khách sạn & Resort Đà Nẵng', desc: 'Lựa chọn khách sạn, resort ven biển Đà Nẵng tuyệt đẹp. Tiện nghi 5 sao, view biển và cầu Rồng.' },
    'nha-trang': { title: 'Khách sạn ven biển Nha Trang', desc: 'Đặt phòng khách sạn Nha Trang nhìn ra biển, vị trí trung tâm, nghỉ dưỡng đẳng cấp.' },
    'da-lat': { title: 'Khách sạn lãng mạn Đà Lạt', desc: 'Tìm khách sạn, homestay có view đẹp, gần chợ đêm và các đồi thông lãng mạn tại Đà Lạt.' },
    'sa-pa': { title: 'Khách sạn view Fansipan Sa Pa', desc: 'Nghỉ dưỡng tại Sa Pa với không gian nhà kính ngắm ruộng bậc thang và cáp treo mây núi.' },
    'hoi-an': { title: 'Resort & Khách sạn Phố cổ Hội An', desc: 'Trải nghiệm sự yên bình tại Hotel và Resort Hội An, kiến trúc cổ điển xen lẫn hiện đại.' },
    'phu-quoc': { title: 'Resort 5 Sao Phú Quốc', desc: 'Lựa chọn hàng ngàn resort và khách sạn tại Đảo Ngọc Phú Quốc với bãi biển riêng và tiện ích sang trọng.' },
    'ho-chi-minh': { title: 'Khách sạn TP. Hồ Chí Minh', desc: 'Khám phá các khách sạn tiêu chuẩn quốc tế tại trung tâm Quận 1, Sài Gòn sôi động.' }
  };
  
  const enSlugMap: Record<string, { title: string, desc: string }> = {
    'ha-noi': { title: 'Hanoi Hotels', desc: 'Find and book the best hotels in Hanoi near Hoan Kiem Lake and popular tourist attractions.' },
    'da-nang': { title: 'Da Nang Hotels & Resorts', desc: 'Discover beautiful beachfront hotels and resorts in Da Nang with 5-star amenities.' },
    'nha-trang': { title: 'Nha Trang Beach Hotels', desc: 'Book centrally located beachfront hotels in Nha Trang for a premium vacation.' },
    'da-lat': { title: 'Romantic Da Lat Hotels', desc: 'Find hotels and homestays with scenic pine hill views near the night market in Da Lat.' },
    'sa-pa': { title: 'Sa Pa Hotels with Views', desc: 'Stay in Sa Pa with breathtaking views of terraced fields and Mount Fansipan.' },
    'hoi-an': { title: 'Hoi An Ancient Town Resorts', desc: 'Experience tranquility at Hoi An hotels and resorts, blending classic and modern architecture.' },
    'phu-quoc': { title: 'Phu Quoc 5-Star Resorts', desc: 'Choose from thousands of resorts and hotels in Phu Quoc Pearl Island with private beaches.' },
    'ho-chi-minh': { title: 'Ho Chi Minh City Hotels', desc: 'Discover international standard hotels in the vibrant District 1 of Ho Chi Minh City.' }
  };

  const slugMap = locale === 'vi' ? viSlugMap : enSlugMap;

  let cleanSearch = search;
  if (search && slugMap[search.toLowerCase()]) {
    title = `${slugMap[search.toLowerCase()].title} - NabTravel`;
    description = slugMap[search.toLowerCase()].desc;
    cleanSearch = search.toLowerCase();
  } else if (search) {
    const formattedSearch = search.replace(/-/g, ' ').replace(/(^\w)|(\s+\w)/g, letter => letter.toUpperCase());
    title = locale === 'vi' 
      ? `Tìm kiếm Khách sạn: ${formattedSearch} - NabTravel` 
      : `${formattedSearch} Hotels - NabTravel`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://nabtravel.com/hotels${cleanSearch ? `?search=${cleanSearch}` : ''}`,
      siteName: "NabTravel",
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://nabtravel.com/hotels${cleanSearch ? `?search=${cleanSearch}` : ''}`
    }
  };
}

async function fetchVietnamHotels(searchQuery?: string): Promise<HotelGridData[]> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
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

  // Remove default search lock to show all locations
  const finalSearch = search?.trim() || undefined;

  const hotels = await fetchVietnamHotels(finalSearch);

  return <HotelsClientView initialHotels={hotels} initialSearchQuery={finalSearch || ""} />;
}
