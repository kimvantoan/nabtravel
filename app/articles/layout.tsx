import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.seo?.articlesTitle,
    description: dict.seo?.articlesDescription,
    openGraph: {
      title: `${dict.seo?.articlesTitle} | NabTravel`,
      description: dict.seo?.articlesDescription,
      url: "https://nabtravel.com/articles",
    }
  };
}

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
