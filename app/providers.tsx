"use client";

import { createContext, useContext, ReactNode } from "react";
import type enDictionary from "../lib/dictionaries/en.json";

export type Dictionary = typeof enDictionary;

type LanguageContextType = {
  dict: Dictionary;
  locale: string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

import { SessionProvider } from "next-auth/react";

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
    <SessionProvider>
      <LanguageContext.Provider value={{ dict, locale }}>
        {children}
      </LanguageContext.Provider>
    </SessionProvider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
