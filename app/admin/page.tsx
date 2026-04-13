"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquareQuote, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/providers";

export default function AdminDashboard() {
  const { dict } = useLanguage();
  const [stats, setStats] = useState<{ articles: number | null, inquiries: number | null }>({
    articles: null,
    inquiries: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${backendUrl}/api/admin/dashboard/stats`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{dict.admin.dashboardTitle}</h1>
        <p className="text-gray-500 mt-2">{dict.admin.dashboardDesc}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dict.admin.totalArticles}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.articles !== null ? stats.articles : <Loader2 className="w-5 h-5 animate-spin mt-1" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{dict.admin.managedAtArticles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dict.admin.totalInquiries}</CardTitle>
            <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.inquiries !== null ? stats.inquiries : <Loader2 className="w-5 h-5 animate-spin mt-1" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{dict.admin.managedAtInquiries}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
