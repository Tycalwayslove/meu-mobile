"use client";

import { ActionMenuProvider, ConfigProvider, DialogProvider, ToastProvider } from "@meu/mobile";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type ThemePreference = "dark" | "light" | "system";

const ThemePreferenceContext = createContext<{
  setTheme: (theme: ThemePreference) => void;
  theme: ThemePreference;
} | null>(null);

export function SiteProviders({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem("meu-docs-theme");
    if (stored !== "dark" && stored !== "light" && stored !== "system") return;
    const timeout = window.setTimeout(() => setTheme(stored), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function updateTheme(nextTheme: ThemePreference) {
    setTheme(nextTheme);
    window.localStorage.setItem("meu-docs-theme", nextTheme);
  }

  return (
    <ThemePreferenceContext.Provider value={{ setTheme: updateTheme, theme }}>
      <ConfigProvider theme={theme}>
        <ToastProvider>
          <DialogProvider>
            <ActionMenuProvider>{children}</ActionMenuProvider>
          </DialogProvider>
        </ToastProvider>
      </ConfigProvider>
    </ThemePreferenceContext.Provider>
  );
}

export function ThemeSelect() {
  const value = useContext(ThemePreferenceContext);
  if (!value) return null;

  return (
    <label className="theme-select">
      <span className="visually-hidden">外观</span>
      <select
        aria-label="外观"
        value={value.theme}
        onChange={(event) => value.setTheme(event.target.value as ThemePreference)}
      >
        <option value="system">跟随系统</option>
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
    </label>
  );
}
