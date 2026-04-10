import { cache } from 'react';
import { ArticleData } from "@/components/article-card";

/**
 * Data Fetching Layer with Data Caching (ISR Pattern)
 * 
 * In Next.js App Router, since cookies() opts routes into SSR, we can't use SSG.
 * However, we can achieve "SSG-like" speeds by wrapping direct Database or internal API 
 * queries with React's `cache()`, or Next.js `unstable_cache`. 
 * This deduplicates identical queries across the React component tree during SSR.
 */

// 1. Cached Articles Fetcher
export const getCachedArticles = cache(async (): Promise<ArticleData[]> => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendUrl}/api/articles`, {
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error('Failed to fetch articles from backend');
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
});

// 2. Cached Article Detail Fetcher
export const getCachedArticleBySlug = cache(async (slug: string): Promise<ArticleData | null> => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendUrl}/api/articles/${slug}`, {
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error);
    return null;
  }
});
