"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

export type FavoriteType = 'hotel' | 'article';

export interface FavoriteItem {
  id: string; // The slug or target_id
  type: FavoriteType;
  title: string;
  image: string;
  url: string; // The link to navigate to
}

export function useFavorites() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Sync with DB
  useEffect(() => {
    setIsClient(true);
    const fetchFavorites = async () => {
      if (status !== "authenticated" || !session?.user?.email) {
        setFavorites([]);
        return;
      }
      try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/favorites?user_email=${encodeURIComponent(session.user.email)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Map DB to local format
          setFavorites(data.map((f: any) => ({
            id: f.target_id,
            type: f.type,
            title: f.title,
            image: f.image,
            url: f.url
          })));
        }
      } catch (e) {}
    };

    fetchFavorites();
    // React to manual force updates
    const handleUpdate = () => fetchFavorites();
    window.addEventListener('favorites-updated', handleUpdate);
    return () => window.removeEventListener('favorites-updated', handleUpdate);
  }, [session, status]);

  const toggleFavorite = async (item: FavoriteItem) => {
    if (status !== "authenticated" || !session?.user?.email) {
      signIn("google");
      return;
    }

    // Optimistic UI update
    setFavorites(prev => {
      const exists = prev.find(p => p.id === item.id && p.type === item.type);
      if (exists) {
        return prev.filter(p => !(p.id === item.id && p.type === item.type));
      } else {
        return [...prev, item];
      }
    });

    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/favorites/toggle`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: session.user.email,
          type: item.type,
          target_id: item.id,
          title: item.title,
          image: item.image,
          url: item.url
        })
      });
      // Optionally dispatch to sync other cards
      window.dispatchEvent(new Event('favorites-updated'));
    } catch (e) {}
  };

  const isFavorite = (id: string, type: FavoriteType) => {
    if (!isClient || status !== "authenticated") return false;
    return favorites.some(p => p.id === id && p.type === type);
  };

  return { favorites, toggleFavorite, isFavorite, isClient, status };
}

