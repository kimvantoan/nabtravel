import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.seo?.hotelsTitle,
    description: dict.seo?.hotelsDescription,
    openGraph: {
      title: `${dict.seo?.hotelsTitle} | NabTravel`,
      description: dict.seo?.hotelsDescription,
      url: "https://nabtravel.com/hotels",
    }
  };
}

export default function HotelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
