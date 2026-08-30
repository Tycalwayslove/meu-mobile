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
  await page.goto("/nav-bar-contract");
  await expect(page.getByRole("heading", { name: "NavBar router contract" })).toBeVisible();
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

test("keeps a native href while a Next Router adapter owns client navigation", async ({ page }) => {
  const serverMarkup = await (await page.request.get("/nav-bar-contract")).text();
  expect(serverMarkup).toContain('href="/nav-bar-contract/list"');
  expect(serverMarkup).toContain("订单详情");

  const adapter = page.getByRole("region", { name: "Next Router adapter" });
  const backLink = adapter.getByRole("link", { name: "返回" });
  await expect(backLink).toHaveAttribute("href", "/nav-bar-contract/list");
  await backLink.click();

  await expect(page).toHaveURL(/\/nav-bar-contract\/list$/);
  await expect(page.getByRole("heading", { level: 1, name: "订单列表" })).toBeVisible();
});

test("lets the page own scroll state while sticky and unavailable states stay native", async ({
  page
}) => {
  const adapter = page.getByRole("region", { name: "Next Router adapter" });
  const scroller = adapter.getByRole("region", { name: "NavBar nested scroll container" });
  const sticky = adapter.locator('[data-meu-component="nav-bar"][aria-label="订单详情页头"]');

  await expect(sticky).toHaveAttribute("data-position", "sticky");
  await expect(sticky).toHaveAttribute("data-safe-area", "true");
  await expect(sticky).toHaveAttribute("data-scrolled", "false");
  const initialTop = await sticky.evaluate((element) => element.getBoundingClientRect().top);

  await scroller.evaluate((element) => {
    element.scrollTop = 180;
    element.dispatchEvent(new Event("scroll", { bubbles: true }));
  });
  await expect(sticky).toHaveAttribute("data-scrolled", "true");
  await expect(adapter.getByText("页面已滚动")).toBeVisible();
  expect(await sticky.evaluate((element) => element.getBoundingClientRect().top)).toBeCloseTo(
    initialTop,
    1
  );

  const unavailable = page.getByRole("region", { name: "Unavailable back states" });
  const disabledLink = unavailable
    .locator('[data-meu-component="nav-bar"][aria-label="不可用返回页头"]')
    .getByRole("link", { name: "返回" });
  await expect(disabledLink).not.toHaveAttribute("href");
  await expect(disabledLink).toHaveAttribute("aria-disabled", "true");
  await expect(disabledLink).toHaveAttribute("tabindex", "-1");

  const loadingLink = unavailable
    .locator('[data-meu-component="nav-bar"][aria-label="加载返回页头"]')
    .getByRole("link", { name: "返回" });
  await expect(loadingLink).not.toHaveAttribute("href");
  await expect(loadingLink).toHaveAttribute("aria-busy", "true");
  await expect(loadingLink).toHaveAttribute("data-state", "loading");
});
