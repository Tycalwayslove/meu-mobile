// @vitest-environment jsdom
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertNoAxeViolations,
  hydrateWithMeu,
  installReducedMotionMock,
  renderMeuToString,
  renderWithMeu,
  renderWithMeuLocale,
  renderWithMeuRtl,
  runAxe,
  setTestDocumentLocale
} from "./index";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("dir");
  document.documentElement.removeAttribute("lang");
});

describe("Meu render helpers", () => {
  it("keeps the original Chinese light-theme defaults", () => {
    const { container } = renderWithMeu(<button type="button">保存</button>);

    const provider = container.querySelector("[data-meu-component='config-provider']");
    expect(provider && provider.getAttribute("lang")).toBe("zh-CN");
    expect(provider && provider.getAttribute("data-meu-theme")).toBe("light");
    expect(screen.getByRole("button", { name: "保存" })).toBeTruthy();
  });

  it("renders explicit locale and RTL scenarios", () => {
    const localeRender = renderWithMeuLocale(<span>Continue</span>, "en-US", {
      theme: "dark"
    });
    const provider = localeRender.container.querySelector("[data-meu-component='config-provider']");
    expect(provider && provider.getAttribute("lang")).toBe("en-US");
    localeRender.unmount();

    const rtlRender = renderWithMeuRtl(<span>مرحبا</span>, { locale: "en-US" });
    const rtlContainer = rtlRender.container.querySelector("[dir='rtl']");
    expect(rtlContainer && rtlContainer.textContent).toBe("مرحبا");
  });

  it("renders server markup and hydrates the same tree", () => {
    const onClick = vi.fn();
    const ui = (
      <button type="button" onClick={onClick}>
        Continue
      </button>
    );
    const serverHTML = renderMeuToString(ui, { locale: "en-US", theme: "dark" });

    expect(serverHTML).toContain('lang="en-US"');
    expect(serverHTML).toContain('data-meu-theme="dark"');

    hydrateWithMeu(ui, { locale: "en-US", serverHTML, theme: "dark" });
    screen.getByRole("button", { name: "Continue" }).click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("test environment helpers", () => {
  it("sets and restores document locale and direction", () => {
    document.documentElement.setAttribute("lang", "zh-CN");
    const restore = setTestDocumentLocale({ direction: "rtl", locale: "ar" });

    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");

    restore();
    expect(document.documentElement.lang).toBe("zh-CN");
    expect(document.documentElement.hasAttribute("dir")).toBe(false);
  });

  it("mocks reduced motion and dispatches change events", () => {
    const originalMatchMedia = window.matchMedia;
    const controller = installReducedMotionMock(false);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = vi.fn();
    mediaQuery.addEventListener("change", listener);

    expect(mediaQuery.matches).toBe(false);
    controller.setReducedMotion(true);
    expect(mediaQuery.matches).toBe(true);
    expect(listener).toHaveBeenCalledOnce();

    controller.restore();
    expect(window.matchMedia).toBe(originalMatchMedia);
  });
});

describe("axe helpers", () => {
  it("returns results and accepts an accessible subtree", async () => {
    const { container } = renderWithMeu(<button type="button">Save</button>);

    const results = await assertNoAxeViolations(container);
    expect(results.violations).toHaveLength(0);
  });

  it("reports actionable rule and target details", async () => {
    const { container } = renderWithMeu(<button type="button" />);
    const results = await runAxe(container);

    expect(results.violations.some((violation) => violation.id === "button-name")).toBe(true);
    await expect(assertNoAxeViolations(container)).rejects.toThrow(/button-name/);
  });
});
