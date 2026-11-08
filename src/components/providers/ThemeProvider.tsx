"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

type ThemeValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // null hasta leer el tema que ya aplicó el script de <head> (evita el parpadeo blanco)
  const [storedTheme, setTheme] = useState<Theme | null>(null);
  const theme: Theme = storedTheme ?? "light";

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (!storedTheme) return;
    document.documentElement.dataset.theme = storedTheme;
    document.documentElement.style.colorScheme = storedTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, storedTheme);
  }, [storedTheme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => ((current ?? "light") === "light" ? "dark" : "light"))
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
}

