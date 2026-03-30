"use client";

import { createContext, useContext, ReactNode } from "react";
import type enDictionary from "../lib/dictionaries/en.json";

export type Dictionary = typeof enDictionary;

type LanguageContextType = {
  dict: Dictionary;
  locale: string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
  dict,
  locale
}: {
  children: ReactNode;
  dict: Dictionary;
  locale: string;
}) {
  return (
    <LanguageContext.Provider value={{ dict, locale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
