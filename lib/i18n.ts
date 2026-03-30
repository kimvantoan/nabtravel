import { cookies } from "next/headers";

type Dictionary = typeof import("./dictionaries/en.json");

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  vi: () => import("./dictionaries/vi.json").then((module) => module.default),
};

export async function getDictionary(): Promise<Dictionary> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en";
  
  if (lang === "vi" || lang === "en") {
    return dictionaries[lang]();
  }
  return dictionaries.en();
}

export async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("NEXT_LOCALE")?.value || "en";
}
