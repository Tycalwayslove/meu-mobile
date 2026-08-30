import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const runtimeErrorsByPage = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const runtimeErrors: string[] = [];
  runtimeErrorsByPage.set(page, runtimeErrors);
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto("/safe-area-contract");
  await expect(page.getByRole("heading", { name: "SafeArea viewport contract" })).toBeVisible();
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

test("ships viewport-fit=cover and the fallback-first env declarations", async ({ page }) => {
  const viewport = page.locator('meta[name="viewport"]');
  await expect(viewport).toHaveAttribute("content", /(?:^|,)\s*width=device-width(?:,|$)/);
  await expect(viewport).toHaveAttribute("content", /(?:^|,)\s*viewport-fit=cover(?:,|$)/);

  expect(await page.evaluate(() => CSS.supports("height", "env(safe-area-inset-bottom)"))).toBe(
    true
  );

  const css = await page.evaluate(async () => {
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
    const responses = await Promise.all(links.map((link) => fetch(link.href)));
    const texts = await Promise.all(responses.map((response) => response.text()));
    return texts.join("\n").replace(/\s+/g, "");
  });
  const fallback = "var(--meu-safe-area-fallback,0px)";
  expect(css).toContain(`height:${fallback};height:env(safe-area-inset-top,${fallback})`);
  expect(css).toContain(`width:${fallback};width:env(safe-area-inset-right,${fallback})`);
  expect(css).toContain(`height:${fallback};height:env(safe-area-inset-bottom,${fallback})`);
  expect(css).toContain(`width:${fallback};width:env(safe-area-inset-left,${fallback})`);
});

test("keeps physical-edge axes correct when the viewport rotates", async ({ page }) => {
  const dimensions = async () =>
    page.evaluate(() => {
      const required = (testId: string) => {
        const element = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
        if (!element) throw new Error(`Missing ${testId}`);
        return element;
      };
      const rect = (testId: string) => {
        const box = required(testId).getBoundingClientRect();
        return { height: box.height, width: box.width, x: box.x, y: box.y };
      };
      const top = required("safe-area-top");
      const right = required("safe-area-right");
      const bottom = required("safe-area-bottom");
      const left = required("safe-area-left");
      const stored = (window as typeof window & { __meuSafeAreaNodes?: Array<HTMLElement> })
        .__meuSafeAreaNodes;
      const nodes = [top, right, bottom, left];
      if (!stored) {
        (window as typeof window & { __meuSafeAreaNodes?: Array<HTMLElement> }).__meuSafeAreaNodes =
          nodes;
      }
      return {
        horizontalHost: rect("safe-area-horizontal-host"),
        verticalHost: rect("safe-area-vertical-host"),
        top: rect("safe-area-top"),
        right: rect("safe-area-right"),
        bottom: rect("safe-area-bottom"),
        left: rect("safe-area-left"),
        sameNodes: stored ? stored.every((node, index) => node === nodes[index]) : true,
        landscape: matchMedia("(orientation: landscape)").matches
      };
    });

  const portrait = await dimensions();
  expect(portrait.landscape).toBe(false);
  expect(portrait.top.width).toBeCloseTo(portrait.verticalHost.width, 1);
  expect(portrait.bottom.width).toBeCloseTo(portrait.verticalHost.width, 1);
  expect(portrait.left.height).toBeCloseTo(portrait.horizontalHost.height, 1);
  expect(portrait.right.height).toBeCloseTo(portrait.horizontalHost.height, 1);

  await page.setViewportSize({ width: 844, height: 390 });
  await expect.poll(async () => page.evaluate(() => innerWidth > innerHeight)).toBe(true);

  const landscape = await dimensions();
  expect(landscape.landscape).toBe(true);
  expect(landscape.sameNodes).toBe(true);
  expect(landscape.top.width).toBeCloseTo(landscape.verticalHost.width, 1);
  expect(landscape.bottom.width).toBeCloseTo(landscape.verticalHost.width, 1);
  expect(landscape.left.height).toBeCloseTo(landscape.horizontalHost.height, 1);
  expect(landscape.right.height).toBeCloseTo(landscape.horizontalHost.height, 1);
});

test("leaves visualViewport keyboard avoidance to the page owner", async ({ page }) => {
  const input = page.getByLabel("Keyboard owner input");
  const safeArea = page.getByTestId("safe-area-keyboard-bottom");
  await expect(page.getByTestId("visual-viewport-height")).not.toHaveText("pending");
  await input.focus();
  await expect(input).toBeFocused();

  const before = await safeArea.evaluate((element) => {
    const safeAreaElement = element as HTMLElement;
    (
      window as typeof window & { __meuKeyboardSafeAreaNode?: HTMLElement }
    ).__meuKeyboardSafeAreaNode = safeAreaElement;
    return {
      className: safeAreaElement.className,
      height: safeAreaElement.getBoundingClientRect().height,
      style: safeAreaElement.getAttribute("style")
    };
  });
  const simulatedHeight = await page.evaluate(() => {
    const viewport = window.visualViewport;
    if (!viewport) throw new Error("Expected visualViewport in the mobile browser projects");
    const height = Math.max(1, Math.round(viewport.height - 180));
    Object.defineProperty(viewport, "height", { configurable: true, value: height });
    viewport.dispatchEvent(new Event("resize"));
    return height;
  });

  await expect(page.getByTestId("visual-viewport-height")).toHaveText(String(simulatedHeight));
  expect(
    await safeArea.evaluate((element, snapshot) => {
      const safeAreaElement = element as HTMLElement;
      return {
        className: safeAreaElement.className === snapshot.className,
        height: safeAreaElement.getBoundingClientRect().height === snapshot.height,
        node:
          safeAreaElement ===
          (window as typeof window & { __meuKeyboardSafeAreaNode?: HTMLElement })
            .__meuKeyboardSafeAreaNode,
        style: safeAreaElement.getAttribute("style") === snapshot.style
      };
    }, before)
  ).toEqual({ className: true, height: true, node: true, style: true });
  await expect(safeArea).toHaveAttribute("data-position", "bottom");
  await expect(safeArea).toHaveAttribute("aria-hidden", "true");
});
