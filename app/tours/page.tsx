import { ToursClientView } from "@/components/tours-client-view";
import { getDictionary } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await searchParams;
  let search = (typeof params.search === 'string' ? params.search : undefined) || (typeof params.q === 'string' ? params.q : undefined);

  // Consider fetching current language dictionary here if multi-language SEO is strictly required
  let title = "Vietnam Tours & Travel Packages | NabTravel";
  let description = "Discover the best tours and activities in Vietnam. From Ha Long Bay cruises to Sapa trekking, book your perfect travel package with NabTravel.";

  const slugMap: Record<string, { title: string, desc: string }> = {
    'ha-noi': { title: 'Đặt Tour Du lịch Hà Nội', desc: 'Khám phá thủ đô Hà Nội ngàn năm văn hiến, trải nghiệm ẩm thực phố cổ và các tour trọn gói hấp dẫn từ NabTravel.' },
    'da-nang': { title: 'Tours Du lịch Đà Nẵng', desc: 'Tận hưởng chuyến đi tuyệt vời tại Đà Nẵng, Bà Nà Hills, Hội An với giá tốt nhất cùng NabTravel.' },
    'nha-trang': { title: 'Tours Du lịch Nha Trang', desc: 'Trải nghiệm lặn biển, khám phá các đảo tuyệt đẹp và vui chơi VinWonders tại Nha Trang.' },
    'da-lat': { title: 'Tours Du lịch Đà Lạt', desc: 'Hòa mình vào không khí lãng mạn, tham quan các đồi thông và danh thắng nổi tiếng tại Đà Lạt.' },
    'sa-pa': { title: 'Tours Khám phá Sa Pa', desc: 'Chinh phục đỉnh Fansipan, thăm bản làng người dân tộc thiểu số và chiêm ngưỡng ruộng bậc thang tuyệt mỹ.' },
    'hoi-an': { title: 'Tours Du lịch Hội An', desc: 'Khám phá Phố cổ Hội An, tham gia các lớp học nấu ăn, thả đèn hoa đăng và trải nghiệm Rừng dừa Bảy Mẫu.' },
    'phu-quoc': { title: 'Tours Du lịch Phú Quốc', desc: 'Kỳ nghỉ dưỡng trong mơ tại Đảo Ngọc Phú Quốc với các tour câu mực đêm, lặn ngắm san hô chuẩn 5 sao.' },
    'ho-chi-minh': { title: 'Tours Du lịch Hồ Chí Minh', desc: 'Thăm quan thành phố sôi động nhất Việt Nam, khám phá Địa đạo Củ Chi và miệt vườn miền Tây.' }
  };

  let cleanSearch = search;
  if (search && slugMap[search.toLowerCase()]) {
    title = `${slugMap[search.toLowerCase()].title} - NabTravel`;
    description = slugMap[search.toLowerCase()].desc;
    cleanSearch = search.toLowerCase();
  } else if (search) {
    title = `Tìm kiếm Tour: ${search} - NabTravel`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://nabtravel.com/tours${cleanSearch ? `?search=${cleanSearch}` : ''}`,
      siteName: "NabTravel",
      images: [{ url: "https://nabtravel.com/booking-placeholder.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://nabtravel.com/tours${cleanSearch ? `?search=${cleanSearch}` : ''}`
    }
  };
}

async function fetchVietnamTours(searchQuery?: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    const url = new URL(`${backendUrl}/api/tours`);
    url.searchParams.set('limit', '18');
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
