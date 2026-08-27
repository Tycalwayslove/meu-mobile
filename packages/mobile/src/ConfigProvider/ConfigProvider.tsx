"use client";

import { createContext, useContext } from "react";
import type { CSSProperties, ReactNode } from "react";

export type MeuLocale = "zh-CN" | "en-US";
export type MeuTheme = "light" | "dark" | "system";

export type MeuConfig = {
  locale: MeuLocale;
  theme: MeuTheme;
  portalContainer: HTMLElement | (() => HTMLElement) | null | undefined;
};

export type ConfigProviderProps = {
  children: ReactNode;
  className?: string;
  locale?: MeuLocale;
  portalContainer?: HTMLElement | (() => HTMLElement) | null;
  style?: CSSProperties;
  theme?: MeuTheme;
};

const defaultConfig: MeuConfig = {
  locale: "zh-CN",
  theme: "system",
  portalContainer: undefined
};

const MeuConfigContext = createContext<MeuConfig>(defaultConfig);

export function ConfigProvider({
  children,
  className,
  locale = "zh-CN",
  portalContainer,
  style,
  theme = "system"
}: ConfigProviderProps) {
  const config: MeuConfig = { locale, theme, portalContainer };

  return (
    <MeuConfigContext.Provider value={config}>
      <div
        className={className}
        style={style}
        lang={locale}
        data-meu-component="config-provider"
        data-meu-theme={theme}
      >
        {children}
      </div>
    </MeuConfigContext.Provider>
  );
}

export function useMeuConfig(): MeuConfig {
  return useContext(MeuConfigContext);
}
