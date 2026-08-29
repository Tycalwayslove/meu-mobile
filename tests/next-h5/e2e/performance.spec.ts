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
  await page.goto("/performance");
  await expect(page.locator('[data-hydrated="true"]')).toBeAttached();
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

test("keeps ten thousand rows bounded and jumps within budget", async ({ page }) => {
  const scenario = page.getByRole("region", { name: "运行时性能场景" });
  const list = page.getByRole("list", { name: "万条性能订单" });
  const initialRenderedCount = Number(await list.getAttribute("data-rendered-count"));
  expect(initialRenderedCount).toBeGreaterThan(0);
  expect(initialRenderedCount).toBeLessThanOrEqual(20);

  await page.getByRole("button", { name: "跳转到性能订单 9001" }).click();
  await expect(page.getByText(/性能范围 9001-/)).toBeVisible();
  await expect(scenario).toHaveAttribute("data-virtual-metric", /\d+/);
  const elapsed = Number(await scenario.getAttribute("data-virtual-metric"));
  expect(elapsed).toBeLessThanOrEqual(500);
  expect(Number(await list.getAttribute("data-rendered-count"))).toBeLessThanOrEqual(20);
});

test("opens and filters fifteen hundred tree nodes within budget", async ({ page }) => {
  const scenario = page.getByRole("region", { name: "运行时性能场景" });
  await page.getByRole("button", { name: "选择性能分类" }).click();
  const dialog = page.getByRole("dialog", { name: "性能分类选择" });
  await expect(dialog).toBeVisible();
  await expect(scenario).toHaveAttribute("data-tree-metric", /^open:/);
  const openMetric = await scenario.getAttribute("data-tree-metric");
  const openElapsed = Number(openMetric ? openMetric.split(":")[1] : undefined);
  expect(openElapsed).toBeLessThanOrEqual(750);
  expect(await dialog.getByRole("treeitem").count()).toBeLessThanOrEqual(30);

  await dialog.getByRole("searchbox", { name: "搜索选项" }).fill("性能分类 1499");
  await expect(dialog.getByRole("treeitem", { name: /性能分类 1499/ })).toBeVisible();
  await expect(scenario).toHaveAttribute("data-tree-metric", /^search:/);
  const searchMetric = await scenario.getAttribute("data-tree-metric");
  const searchElapsed = Number(searchMetric ? searchMetric.split(":")[1] : undefined);
  expect(searchElapsed).toBeLessThanOrEqual(500);
});

test("handles a burst of pointer moves without a long synchronous task", async ({ page }) => {
  const root = page
    .getByRole("region", { name: "滑动操作性能" })
    .locator('[data-meu-component="swipe-actions"]');
  const elapsed = await root.evaluate((node) => {
    const startedAt = window.performance.now();
    const dispatch = (type: string, clientX: number) => {
      node.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          button: 0,
          cancelable: true,
          clientX,
          clientY: 32,
          isPrimary: true,
          pointerId: 19,
          pointerType: "touch"
        })
      );
    };
    dispatch("pointerdown", 360);
    for (let index = 0; index < 240; index += 1) {
      dispatch("pointermove", 360 - Math.min(180, index));
    }
    dispatch("pointerup", 180);
    return window.performance.now() - startedAt;
  });

  expect(elapsed).toBeLessThanOrEqual(250);
  await expect(root).toHaveAttribute("data-open-side", "right");
});
