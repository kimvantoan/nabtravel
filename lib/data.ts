import { cache } from 'react';
import { MOCK_ARTICLES } from './mock-articles';
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
  // ⏳ Simulating DB latency or External API Call
  // await new Promise(resolve => setTimeout(resolve, 50));
  
  return MOCK_ARTICLES;
});

// 2. Cached Article Detail Fetcher
export const getCachedArticleBySlug = cache(async (slug: string): Promise<ArticleData | null> => {
  const article = MOCK_ARTICLES.find(a => a.slug === slug);
  return article || null;
});
