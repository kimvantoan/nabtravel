import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function HotelBreadcrumb() {
  const breadcrumbs = [
    { label: "Châu Á", href: "#" },
    { label: "Việt Nam", href: "#" },
    { label: "Đà Nẵng", href: "#" },
    { label: "Ngu Hanh Son", href: "#" },
    { label: "Khách sạn tại Ngu Hanh Son", href: "#" },
  ];

  const current = "PĀMA Boutique Hotel";

  return (
    <nav className="flex flex-wrap items-center text-[13px] text-gray-600 gap-1.5 py-4 w-full" aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <Link href={item.href} className="hover:underline text-gray-600 hover:text-black transition-colors">
            {item.label}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" strokeWidth={2} />
        </div>
      ))}
      <span className="text-black font-medium">{current}</span>
    </nav>
  );
}
