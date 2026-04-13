"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, FileText, MessageSquareQuote, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/app/providers";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { dict } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (status === "unauthenticated" || (session && (session.user as any)?.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [session, status, router, pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading" || !session || (session.user as any)?.role !== "admin") {
    return <div className="h-screen flex items-center justify-center">{dict.admin.loading}</div>;
  }

  const navItems = [
    { name: dict.admin.dashboardMenu, href: "/admin", icon: LayoutDashboard },
    { name: dict.admin.articlesMenu, href: "/admin/articles", icon: FileText },
    { name: dict.admin.inquiriesMenu, href: "/admin/inquiries", icon: MessageSquareQuote },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{dict.admin.panelTitle}</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-[#10a36e] text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
             <LogOut className="w-5 h-5" />
             <span className="font-medium">{dict.admin.logoutMenu}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
}
