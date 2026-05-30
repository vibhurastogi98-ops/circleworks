"use client";

import { useEffect } from "react";

import {
  isPlatformTheme,
  usePlatformStore,
  type PlatformTheme,
} from "@/store/usePlatformStore";

function getStoredTheme(): PlatformTheme {
  if (typeof window === "undefined") return "system";

  try {
    const storedTheme = window.localStorage.getItem("theme");
    return isPlatformTheme(storedTheme) ? storedTheme : "system";
  } catch {
    return "system";
  }
}

export default function ThemeInitializer() {
  const theme = usePlatformStore((state) => state.theme);
  const setTheme = usePlatformStore((state) => state.setTheme);

  useEffect(() => {
    setTheme(getStoredTheme());
  }, [setTheme]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => setTheme("system");
    mediaQuery.addEventListener("change", syncSystemTheme);

    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, [setTheme, theme]);

  return null;
}
