import type { Metadata } from "next";
import { Outfit, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LanguageProvider } from "./providers";
import { getDictionary, getLocale } from "@/lib/i18n";

const outfit = Outfit({
  variable: "--font-sans-custom",
  subsets: ["latin"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: "--font-sans-custom",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: {
      template: "%s | NabTravel",
      default: dict.seo?.homeTitle || "NabTravel",
    },
    description: dict.seo?.defaultDescription || "NabTravel",
    openGraph: {
      title: dict.seo?.homeTitle,
      description: dict.seo?.defaultDescription,
      url: "https://nabtravel.vn",
      siteName: "NabTravel",
      images: [
        {
          url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop",
          width: 1200,
          height: 630,
          alt: "NabTravel"
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = await getDictionary();
  const locale = await getLocale();
  const fontClass = locale === 'vi' ? beVietnamPro.variable : outfit.variable;

  return (
    <html
      lang={locale}
      className={`${fontClass} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider dict={dict} locale={locale}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
