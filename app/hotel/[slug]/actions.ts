"use server";

export async function fetchMorePhotosAction(locationId: string, limit: number, offset: number, lang: string) {
  if (!locationId) return [];
  const RAPID_API_KEY = process.env.RAPID_API_KEY as string;
  const RAPID_API_HOST = "travel-advisor.p.rapidapi.com";
  const BASE_URL = "https://travel-advisor.p.rapidapi.com";

  try {
    const res = await fetch(`${BASE_URL}/photos/list?location_id=${locationId}&limit=${limit}&offset=${offset}&lang=${lang}`, {
      headers: { "X-RapidAPI-Key": RAPID_API_KEY, "X-RapidAPI-Host": RAPID_API_HOST },
      // Important to skip caching dynamically requested paginated images
      cache: 'no-store'
    });
    
    if (!res.ok) return [];
    
    const { data } = await res.json();
    if (!data) return [];
    
    return data
      .map((p: any) => p.images?.original?.url || p.images?.large?.url)
      .filter((url: any): url is string => typeof url === 'string');
  } catch (err) {
    console.error("fetchMorePhotosAction error:", err);
    return [];
  }
}
