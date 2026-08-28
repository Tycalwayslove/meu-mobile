// @vitest-environment jsdom
import { act } from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider, ThemeProvider, useMeuConfig } from "./ConfigProvider";

function ConfigReadout({ testId }: { testId: string }) {
  const config = useMeuConfig();

  return (
    <output
      data-testid={testId}
      data-dir={config.dir}
      data-locale={config.locale}
      data-motion={config.motion}
      data-portal={
        config.portalContainer === null
          ? "inline"
          : config.portalContainer === undefined
            ? "body"
            : "custom"
      }
      data-theme={config.theme}
    />
  );
}

describe("ConfigProvider", () => {
  it("renders stable defaults and exposes them through context", () => {
    render(
      <ConfigProvider className="consumer-class">
        <ConfigReadout testId="config" />
      </ConfigProvider>
    );

    const boundary = document.querySelector("[data-meu-component='config-provider']");
    if (!(boundary instanceof HTMLElement)) throw new Error("Expected provider boundary");
    expect(boundary.getAttribute("dir")).toBe("ltr");
    expect(boundary.getAttribute("lang")).toBe("zh-CN");
    expect(boundary.getAttribute("data-meu-motion")).toBe("system");
    expect(boundary.getAttribute("data-meu-theme")).toBe("system");
    expect(boundary.classList.contains("consumer-class")).toBe(true);

    const config = screen.getByTestId("config");
    expect(config.getAttribute("data-dir")).toBe("ltr");
    expect(config.getAttribute("data-locale")).toBe("zh-CN");
    expect(config.getAttribute("data-motion")).toBe("system");
    expect(config.getAttribute("data-portal")).toBe("body");
    expect(config.getAttribute("data-theme")).toBe("system");
  });

  it("inherits omitted nested values and only overrides explicit values", () => {
    const portalTarget = document.createElement("div");
    render(
      <ConfigProvider
        dir="rtl"
        locale="en-US"
        motion="reduced"
        portalContainer={portalTarget}
        theme="dark"
      >
        <ConfigReadout testId="outer" />
        <ConfigProvider locale="zh-CN">
          <ConfigReadout testId="inherited" />
          <ConfigProvider dir="ltr" motion="system" portalContainer={null} theme="light">
            <ConfigReadout testId="overridden" />
          </ConfigProvider>
        </ConfigProvider>
      </ConfigProvider>
    );

    const inherited = screen.getByTestId("inherited");
    expect(inherited.getAttribute("data-dir")).toBe("rtl");
    expect(inherited.getAttribute("data-locale")).toBe("zh-CN");
    expect(inherited.getAttribute("data-motion")).toBe("reduced");
    expect(inherited.getAttribute("data-portal")).toBe("custom");
    expect(inherited.getAttribute("data-theme")).toBe("dark");

    const overridden = screen.getByTestId("overridden");
    expect(overridden.getAttribute("data-dir")).toBe("ltr");
    expect(overridden.getAttribute("data-locale")).toBe("zh-CN");
    expect(overridden.getAttribute("data-motion")).toBe("system");
    expect(overridden.getAttribute("data-portal")).toBe("inline");
    expect(overridden.getAttribute("data-theme")).toBe("light");
  });

  it("keeps ThemeProvider as the exact ConfigProvider alias", () => {
    expect(ThemeProvider).toBe(ConfigProvider);
    render(
      <ConfigProvider locale="en-US" dir="rtl">
        <ThemeProvider theme="dark">
          <ConfigReadout testId="theme-alias" />
        </ThemeProvider>
      </ConfigProvider>
    );

    const config = screen.getByTestId("theme-alias");
    expect(config.getAttribute("data-locale")).toBe("en-US");
    expect(config.getAttribute("data-dir")).toBe("rtl");
    expect(config.getAttribute("data-theme")).toBe("dark");
  });

  it("does not resolve a lazy portal target during render", () => {
    const getPortalTarget = vi.fn(() => document.body);
    render(
      <ConfigProvider portalContainer={getPortalTarget}>
        <ConfigReadout testId="lazy-portal" />
      </ConfigProvider>
    );

    expect(getPortalTarget).not.toHaveBeenCalled();
    expect(screen.getByTestId("lazy-portal").getAttribute("data-portal")).toBe("custom");
  });

  it("hydrates deterministic system-theme markup without recoverable errors", async () => {
    const ui = (
      <ConfigProvider theme="system" motion="system" dir="rtl" locale="en-US">
        <span>Hydration boundary</span>
      </ConfigProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    const recoverableErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(container, ui, {
        onRecoverableError: (error) => recoverableErrors.push(error)
      });
      await Promise.resolve();
    });

    const boundary = container.querySelector("[data-meu-component='config-provider']");
    if (!(boundary instanceof HTMLElement)) throw new Error("Expected provider boundary");
    expect(boundary.getAttribute("data-meu-theme")).toBe("system");
    expect(boundary.getAttribute("data-meu-motion")).toBe("system");
    expect(boundary.getAttribute("dir")).toBe("rtl");
    expect(boundary.getAttribute("lang")).toBe("en-US");
    expect(recoverableErrors).toEqual([]);

    act(() => {
      if (root !== undefined) root.unmount();
    });
  });
});
