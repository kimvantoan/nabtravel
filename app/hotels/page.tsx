import { HotelsClientView } from "@/components/hotels-client-view";
import { getDictionary } from "@/lib/i18n";
import { HotelGridData } from "@/components/hotel-grid-card";

// Mock Data
const MOCK_HOTELS: HotelGridData[] = [
  {
    id: "1",
    slug: "hilton-da-nang",
    name: "Hilton Da Nang",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
    location: "Sơn Trà, Đà Nẵng",
    rating: 4.8,
    reviews: 2450,
    reviewWord: "excellent",
    price: 2500000,
    badges: ["Khách yêu thích"]
  },
  {
    id: "2",
    slug: "intercontinental-danang",
    name: "InterContinental Danang Sun Peninsula Resort",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
    location: "Bán đảo Sơn Trà, Đà Nẵng",
    rating: 4.9,
    reviews: 3100,
    reviewWord: "excellent",
    price: 12500000,
    badges: ["Sang trọng", "Đề xuất"]
  },
  {
    id: "3",
    slug: "muong-thanh-luxury",
    name: "Mường Thanh Luxury Đà Nẵng",
    image: "https://images.unsplash.com/photo-1542314831-c6a4d27486c8?q=80&w=2070&auto=format&fit=crop",
    location: "Biển Mỹ Khê, Đà Nẵng",
    rating: 4.5,
    reviews: 1800,
    reviewWord: "veryGood",
    price: 1800000,
    originalPrice: 2200000
  },
  {
    id: "4",
    slug: "rosamia-da-nang",
    name: "Rosamia Da Nang Hotel",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop",
    location: "Biển Mỹ Khê, Đà Nẵng",
    rating: 4.6,
    reviews: 1240,
    reviewWord: "veryGood",
    price: 1450000,
  },
  {
    id: "5",
    slug: "vinpearl-resort",
    name: "Vinpearl Resort & Spa Nam Hội An",
    image: "https://images.unsplash.com/photo-1618773928120-2c15c3ceb3de?q=80&w=2070&auto=format&fit=crop",
    location: "Quảng Nam",
    rating: 4.7,
    reviews: 5400,
    reviewWord: "excellent",
    price: 4500000,
    originalPrice: 5200000,
    badges: ["Khuyến mãi"]
  },
  {
    id: "6",
    slug: "novotel-han-river",
    name: "Novotel Danang Premier Han River",
    image: "https://plus.unsplash.com/premium_photo-1661962804515-cc48cb1edb85?q=80&w=2070&auto=format&fit=crop",
    location: "Sông Hàn, Đà Nẵng",
    rating: 4.6,
    reviews: 2900,
    reviewWord: "veryGood",
    price: 2100000,
  },
  {
    id: "7",
    slug: "furama-resort",
    name: "Furama Resort Danang",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop",
    location: "Ngũ Hành Sơn, Đà Nẵng",
    rating: 4.8,
    reviews: 3800,
    reviewWord: "excellent",
    price: 3800000,
  },
  {
    id: "8",
    slug: "sala-danang",
    name: "Sala Danang Beach Hotel",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2072&auto=format&fit=crop",
    location: "Biển Mỹ Khê, Đà Nẵng",
    rating: 4.5,
    reviews: 950,
    reviewWord: "veryGood",
    price: 1100000,
    originalPrice: 1500000
  },
  {
    id: "9",
    slug: "golden-bay",
    name: "Danang Golden Bay",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
    location: "Sơn Trà, Đà Nẵng",
    rating: 4.6,
    reviews: 4100,
    reviewWord: "veryGood",
    price: 1950000,
    badges: ["Bán chạy"]
  }
];

export default async function HotelsPage() {
  const dict = await getDictionary();

  // In a real app, you would fetch data here using a cached React function
  // e.g., const hotels = await getCachedHotels();
  const hotels = MOCK_HOTELS;

  return <HotelsClientView initialHotels={hotels} />;
}
