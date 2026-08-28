"use client";

import { ActionMenuProvider, ConfigProvider, DialogProvider, ToastProvider } from "@meu/mobile";
import { createContext, useContext, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

type ThemePreference = "dark" | "light" | "system";

const themeStorageKey = "meu-docs-theme";
const themeChangeEvent = "meu-docs-theme-change";

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "dark" || value === "light" || value === "system";
}

function getStoredTheme(): ThemePreference {
  const stored = window.localStorage.getItem(themeStorageKey);
  return isThemePreference(stored) ? stored : "system";
}

function getServerTheme(): ThemePreference {
  return "system";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(themeChangeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeChangeEvent, callback);
  };
}

const ThemePreferenceContext = createContext<{
  setTheme: (theme: ThemePreference) => void;
  theme: ThemePreference;
} | null>(null);

export function SiteProviders({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getStoredTheme, getServerTheme);

  function updateTheme(nextTheme: ThemePreference) {
    window.localStorage.setItem(themeStorageKey, nextTheme);
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  return (
    <ThemePreferenceContext.Provider value={{ setTheme: updateTheme, theme }}>
      <ConfigProvider className="site-theme-root" theme={theme}>
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
