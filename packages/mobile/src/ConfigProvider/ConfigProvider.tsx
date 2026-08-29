"use client";

import { createContext, useContext, useMemo } from "react";
import type { CSSProperties, ReactNode, Ref } from "react";

import { motionReduced, motionSystem, themeBoundary } from "./ConfigProvider.css";

/**
 * Locales whose built-in Meu Mobile strings are currently maintained.
 *
 * @public
 */
export type MeuLocale = "zh-CN" | "en-US";

/**
 * Color-scheme strategy applied to a Meu Mobile subtree.
 *
 * @public
 */
export type MeuTheme = "light" | "dark" | "system";

/**
 * Resolved configuration available to Meu Mobile components.
 *
 * @public
 */
export type MeuConfig = {
  /** Text direction inherited by the configured subtree. */
  dir: "ltr" | "rtl";
  /** Locale used by built-in component strings and the provider `lang` attribute. */
  locale: MeuLocale;
  /** Motion strategy resolved for the configured subtree. */
  motion: "system" | "reduced";
  /** Theme strategy represented by `data-meu-theme`. */
  theme: MeuTheme;
  /** Default portal target; `null` requests in-place rendering. */
  portalContainer: HTMLElement | (() => HTMLElement) | null | undefined;
};

/**
 * Props for {@link ConfigProvider}.
 *
 * @public
 */
export type ConfigProviderProps = {
  /** Meu Mobile content governed by this configuration scope. */
  children: ReactNode;
  /** Optional class appended to the provider's DOM boundary. */
  className?: string;
  /** Text direction. Omit it in a nested provider to inherit the parent value. */
  dir?: "ltr" | "rtl";
  /** Built-in string locale. Omit it in a nested provider to inherit the parent value. */
  locale?: MeuLocale;
  /**
   * Motion strategy. `reduced` removes token-based durations; `system` also honors
   * `prefers-reduced-motion`. Omit it in a nested provider to inherit the parent value.
   */
  motion?: "system" | "reduced";
  /**
   * Default target for overlay portals. A function is resolved by the portal on the client;
   * `null` renders in place and `undefined` inherits the parent/default behavior.
   */
  portalContainer?: HTMLElement | (() => HTMLElement) | null;
  /** React 19 ref for the provider's real DOM boundary. */
  ref?: Ref<HTMLDivElement>;
  /** Inline styles for the provider DOM boundary. */
  style?: CSSProperties;
  /** Theme strategy. `system` is resolved by CSS without a hydration-time script. */
  theme?: MeuTheme;
};

const defaultConfig: MeuConfig = {
  dir: "ltr",
  locale: "zh-CN",
  motion: "system",
  theme: "system",
  portalContainer: undefined
};

const MeuConfigContext = createContext<MeuConfig>(defaultConfig);

/**
 * Provides locale, direction, motion, theme, and portal defaults to a component subtree.
 *
 * @public
 */
export function ConfigProvider({
  children,
  className,
  dir,
  locale,
  motion,
  portalContainer,
  ref,
  style,
  theme
}: ConfigProviderProps) {
  const parentConfig = useContext(MeuConfigContext);
  const resolvedDir = dir === undefined ? parentConfig.dir : dir;
  const resolvedLocale = locale === undefined ? parentConfig.locale : locale;
  const resolvedMotion = motion === undefined ? parentConfig.motion : motion;
  const resolvedPortalContainer =
    portalContainer === undefined ? parentConfig.portalContainer : portalContainer;
  const resolvedTheme = theme === undefined ? parentConfig.theme : theme;
  const config = useMemo<MeuConfig>(
    () => ({
      dir: resolvedDir,
      locale: resolvedLocale,
      motion: resolvedMotion,
      portalContainer: resolvedPortalContainer,
      theme: resolvedTheme
    }),
    [resolvedDir, resolvedLocale, resolvedMotion, resolvedPortalContainer, resolvedTheme]
  );
  const motionClassName = resolvedMotion === "reduced" ? motionReduced : motionSystem;
  const internalClassName = `${themeBoundary} ${motionClassName}`;
  const resolvedClassName = className ? `${internalClassName} ${className}` : internalClassName;

  return (
    <MeuConfigContext.Provider value={config}>
      <div
        ref={ref}
        className={resolvedClassName}
        dir={resolvedDir}
        style={style}
        lang={resolvedLocale}
        data-meu-component="config-provider"
        data-meu-motion={resolvedMotion}
        data-meu-theme={resolvedTheme}
      >
        {children}
      </div>
    </MeuConfigContext.Provider>
  );
}

/**
 * Reads the resolved configuration for the nearest provider scope.
 *
 * @public
 */
export function useMeuConfig(): MeuConfig {
  return useContext(MeuConfigContext);
}

/**
 * Theme-focused alias of {@link ConfigProvider}. It shares the same component identity and accepts
 * the same props; nested omitted values inherit their parent scope.
 *
 * @public
 */
export const ThemeProvider = ConfigProvider;
