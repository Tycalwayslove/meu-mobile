import { ConfigProvider } from "@meu/mobile";
import { render } from "@testing-library/react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import axe from "axe-core";
import type { AxeResults, ElementContext, RunOptions } from "axe-core";
import type { ReactElement, ReactNode } from "react";
import { renderToString } from "react-dom/server";

import type { MeuLocale, MeuTheme } from "@meu/mobile";

export type MeuDirection = "ltr" | "rtl";

export type MeuTestProviderOptions = {
  direction?: MeuDirection;
  locale?: MeuLocale;
  portalContainer?: HTMLElement | (() => HTMLElement) | null;
  theme?: MeuTheme;
};

export type MeuTestProviderProps = MeuTestProviderOptions & {
  children: ReactNode;
};

export type MeuRenderOptions = Omit<RenderOptions, "wrapper"> & MeuTestProviderOptions;

export type MeuHydrateOptions = Omit<MeuRenderOptions, "hydrate"> & {
  serverHTML?: string;
};

export type TestDocumentLocaleOptions = {
  direction?: MeuDirection;
  locale: string;
};

export type ReducedMotionController = {
  restore: () => void;
  setReducedMotion: (reduced: boolean) => void;
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const jsdomAxeDefaults: RunOptions = {
  rules: {
    "color-contrast": { enabled: false }
  }
};

function splitRenderOptions(options: MeuRenderOptions = {}) {
  const {
    direction,
    locale = "zh-CN",
    portalContainer,
    theme = "light",
    ...renderOptions
  } = options;

  const providerOptions: MeuTestProviderOptions = {
    locale,
    theme,
    ...(direction === undefined ? {} : { direction }),
    ...(portalContainer === undefined ? {} : { portalContainer })
  };

  return {
    providerOptions,
    renderOptions
  };
}

export function MeuTestProvider({
  children,
  direction,
  locale = "zh-CN",
  portalContainer,
  theme = "light"
}: MeuTestProviderProps) {
  const content = direction ? <div dir={direction}>{children}</div> : children;

  return (
    <ConfigProvider
      locale={locale}
      theme={theme}
      {...(portalContainer === undefined ? {} : { portalContainer })}
    >
      {content}
    </ConfigProvider>
  );
}

export function renderWithMeu(ui: ReactElement, options: MeuRenderOptions = {}): RenderResult {
  const { providerOptions, renderOptions } = splitRenderOptions(options);

  return render(ui, {
    ...renderOptions,
    wrapper: ({ children }) => <MeuTestProvider {...providerOptions}>{children}</MeuTestProvider>
  });
}

export function renderWithMeuLocale(
  ui: ReactElement,
  locale: MeuLocale,
  options: Omit<MeuRenderOptions, "locale"> = {}
): RenderResult {
  return renderWithMeu(ui, { ...options, locale });
}

export function renderWithMeuRtl(
  ui: ReactElement,
  options: Omit<MeuRenderOptions, "direction"> = {}
): RenderResult {
  return renderWithMeu(ui, { ...options, direction: "rtl" });
}

export function renderMeuToString(ui: ReactElement, options: MeuTestProviderOptions = {}): string {
  return renderToString(<MeuTestProvider {...options}>{ui}</MeuTestProvider>);
}

export function hydrateWithMeu(ui: ReactElement, options: MeuHydrateOptions = {}): RenderResult {
  const { serverHTML, ...meuRenderOptions } = options;
  const { providerOptions, renderOptions } = splitRenderOptions(meuRenderOptions);
  const container =
    renderOptions.container !== undefined
      ? renderOptions.container
      : document.body.appendChild(document.createElement("div"));

  container.innerHTML =
    serverHTML !== undefined ? serverHTML : renderMeuToString(ui, providerOptions);

  return render(ui, {
    ...renderOptions,
    container,
    hydrate: true,
    wrapper: ({ children }) => <MeuTestProvider {...providerOptions}>{children}</MeuTestProvider>
  });
}

export function setTestDocumentLocale({
  direction,
  locale
}: TestDocumentLocaleOptions): () => void {
  const root = document.documentElement;
  const previousDirection = root.getAttribute("dir");
  const previousLocale = root.getAttribute("lang");

  root.setAttribute("lang", locale);
  if (direction) root.setAttribute("dir", direction);
  else root.removeAttribute("dir");

  return () => {
    if (previousLocale === null) root.removeAttribute("lang");
    else root.setAttribute("lang", previousLocale);

    if (previousDirection === null) root.removeAttribute("dir");
    else root.setAttribute("dir", previousDirection);
  };
}

export function installReducedMotionMock(initialReducedMotion = true): ReducedMotionController {
  if (typeof window === "undefined") {
    throw new Error("installReducedMotionMock requires a DOM-like test environment.");
  }

  const previousDescriptor = Object.getOwnPropertyDescriptor(window, "matchMedia");
  let reducedMotion = initialReducedMotion;
  const lists = new Set<MediaQueryList>();
  const listeners = new Map<MediaQueryList, Set<EventListenerOrEventListenerObject>>();
  const legacyListeners = new Map<MediaQueryList, Set<(event: MediaQueryListEvent) => void>>();

  const createChangeEvent = (media: string, matches: boolean): MediaQueryListEvent => {
    if (typeof MediaQueryListEvent === "function") {
      return new MediaQueryListEvent("change", { media, matches });
    }

    const event = new Event("change") as MediaQueryListEvent;
    Object.defineProperties(event, {
      matches: { value: matches },
      media: { value: media }
    });
    return event;
  };

  const matchMedia = (query: string): MediaQueryList => {
    let onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null = null;
    const eventListeners = new Set<EventListenerOrEventListenerObject>();
    const oldListeners = new Set<(event: MediaQueryListEvent) => void>();
    const mediaQueryList = {
      get matches() {
        return query.trim() === reducedMotionQuery ? reducedMotion : false;
      },
      media: query,
      get onchange() {
        return onchange;
      },
      set onchange(listener) {
        onchange = listener;
      },
      addEventListener(_type: string, listener: EventListenerOrEventListenerObject) {
        eventListeners.add(listener);
      },
      removeEventListener(_type: string, listener: EventListenerOrEventListenerObject) {
        eventListeners.delete(listener);
      },
      addListener(listener: (event: MediaQueryListEvent) => void) {
        oldListeners.add(listener);
      },
      removeListener(listener: (event: MediaQueryListEvent) => void) {
        oldListeners.delete(listener);
      },
      dispatchEvent(event: Event) {
        eventListeners.forEach((listener) => {
          if (typeof listener === "function") listener.call(mediaQueryList, event);
          else listener.handleEvent(event);
        });
        return !event.defaultPrevented;
      }
    } as MediaQueryList;

    lists.add(mediaQueryList);
    listeners.set(mediaQueryList, eventListeners);
    legacyListeners.set(mediaQueryList, oldListeners);
    return mediaQueryList;
  };

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: matchMedia,
    writable: true
  });

  return {
    setReducedMotion(nextReducedMotion) {
      if (nextReducedMotion === reducedMotion) return;
      reducedMotion = nextReducedMotion;

      lists.forEach((mediaQueryList) => {
        if (mediaQueryList.media.trim() !== reducedMotionQuery) return;
        const event = createChangeEvent(mediaQueryList.media, mediaQueryList.matches);
        if (mediaQueryList.onchange !== null) {
          mediaQueryList.onchange.call(mediaQueryList, event);
        }
        mediaQueryList.dispatchEvent(event);
        const registeredLegacyListeners = legacyListeners.get(mediaQueryList);
        if (registeredLegacyListeners) {
          registeredLegacyListeners.forEach((listener) => listener(event));
        }
      });
    },
    restore() {
      lists.clear();
      listeners.clear();
      legacyListeners.clear();
      if (previousDescriptor) {
        Object.defineProperty(window, "matchMedia", previousDescriptor);
      } else {
        Reflect.deleteProperty(window, "matchMedia");
      }
    }
  };
}

export async function runAxe(
  context: ElementContext = document,
  options?: RunOptions
): Promise<AxeResults> {
  const resolvedOptions: RunOptions = {
    ...jsdomAxeDefaults,
    ...options,
    rules: {
      ...jsdomAxeDefaults.rules,
      ...(options !== undefined && options.rules !== undefined ? options.rules : {})
    }
  };
  return axe.run(context, resolvedOptions);
}

export async function assertNoAxeViolations(
  context: ElementContext = document,
  options?: RunOptions
): Promise<AxeResults> {
  const results = await runAxe(context, options);
  if (results.violations.length === 0) return results;

  const details = results.violations
    .map((violation) => {
      const targets = violation.nodes
        .flatMap((node) => node.target)
        .map(String)
        .join(", ");
      const impact = violation.impact === null ? "unknown" : violation.impact;
      return `${violation.id} (${impact}): ${violation.help}; targets: ${targets}`;
    })
    .join("\n");

  throw new Error(
    `Expected no axe violations, but found ${results.violations.length}:\n${details}`
  );
}

export type { AxeResults, RunOptions } from "axe-core";
