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
  await page.goto("/layout-contract");
  await expect(page.getByRole("heading", { name: "Layout and hydration contracts" })).toBeVisible();
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

test("hydrates FloatingPanel to the requested 300px visible anchor", async ({ page }) => {
  const panel = page.getByTestId("hydrated-floating-panel");
  await expect(panel).toHaveAttribute("data-measured", "true");
  await expect(panel).toHaveAttribute("data-current-height", "300");
  await expect(panel).toHaveAttribute("data-anchor-index", "1");
  await expect(panel).toHaveCSS("height", "440px");

  const box = await panel.boundingBox();
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  expect(box).not.toBeNull();
  expect(Math.round(viewportHeight - box!.y)).toBe(300);
});

test("updates an open SwipeActions offset from ResizeObserver rail measurement", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "SwipeActions dynamic measurement" });
  const swipe = section.locator('[data-meu-component="swipe-actions"]');
  await expect(swipe).toHaveAttribute("data-open-side", "right");
  const initialOffset = Number(await swipe.getAttribute("data-offset"));
  expect(initialOffset).toBeLessThan(0);

  await section.getByRole("button", { name: "Expand action width" }).click();
  await expect(page.getByTestId("dynamic-action-label")).toHaveText(
    "Archive this order permanently"
  );
  await expect
    .poll(async () => Number(await swipe.getAttribute("data-offset")))
    .toBeLessThan(initialOffset);
  await expect(swipe).toHaveAttribute("data-open-side", "right");
  await expect(
    section.getByRole("button", { name: "Archive this order permanently" })
  ).toHaveAttribute("tabindex", "0");
});

test("hydrates PullToRefresh as an idle native-keyboard refresh boundary", async ({ page }) => {
  const section = page.getByRole("region", { name: "PullToRefresh hydration" });
  const root = section.locator('[data-meu-component="pull-to-refresh"]');
  const action = section.getByRole("button", { name: "Refresh content" });
  await expect(root).toHaveAttribute("data-status", "idle");
  await expect(root).toHaveAttribute("data-pull-distance", "0");
  await expect(section.getByText("Hydrated refresh content")).toBeVisible();
  const contentId = await action.getAttribute("aria-controls");
  expect(contentId).toBeTruthy();
  await expect(page.locator(`#${contentId}`)).toHaveCount(1);

  await action.focus();
  await action.press("Enter");
  await expect(root).toHaveAttribute("data-status", "refreshing");
  await expect(root).toHaveAttribute("aria-busy", "true");
  await expect(action).toBeDisabled();
});

test("replaces Skeleton with identical geometry and no non-input layout shift", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "Skeleton replacement geometry" });
  const placeholder = page.getByTestId("skeleton-placeholder");
  const before = await placeholder.boundingBox();
  expect(before).not.toBeNull();

  const layoutShiftSupported = await page.evaluate(() => {
    const supported = PerformanceObserver.supportedEntryTypes.includes("layout-shift");
    const state = { value: 0 };
    (window as typeof window & { __meuLayoutShift?: typeof state }).__meuLayoutShift = state;
    if (supported) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!shift.hadRecentInput) state.value += shift.value;
        });
      });
      observer.observe({ type: "layout-shift" });
    }
    return supported;
  });

  await section
    .getByRole("button", { name: "Replace skeleton" })
    .evaluate((element) => (element as HTMLButtonElement).click());
  const content = page.getByTestId("skeleton-content");
  await expect(content).toBeVisible({ timeout: 2_000 });
  const after = await content.boundingBox();
  expect(after).not.toBeNull();
  expect(after!.x).toBeCloseTo(before!.x, 1);
  expect(after!.y).toBeCloseTo(before!.y, 1);
  expect(after!.width).toBeCloseTo(before!.width, 1);
  expect(after!.height).toBeCloseTo(before!.height, 1);

  if (layoutShiftSupported) {
    expect(
      await page.evaluate(() => {
        const state = (window as typeof window & { __meuLayoutShift?: { value: number } })
          .__meuLayoutShift;
        return state ? state.value : 0;
      })
    ).toBe(0);
  }
});
