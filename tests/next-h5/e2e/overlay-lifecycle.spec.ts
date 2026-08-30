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
  await page.goto("/overlay-lifecycle");
  await expect(page.getByRole("heading", { name: "Nested overlay lifecycle" })).toBeVisible();
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

async function openPopup(page: Page) {
  const trigger = page.getByRole("button", { name: "Open nested popup" });
  await trigger.focus();
  await trigger.click();
  const popup = page.getByRole("dialog", { name: "Nested delivery popup" });
  await expect(popup).toBeVisible();
  return { popup, trigger };
}

async function expectInheritedBoundary(page: Page, selector: string) {
  const boundary = page.locator(selector);
  await expect(boundary).toHaveCount(1);
  await expect(boundary).toHaveAttribute("dir", "rtl");
  await expect(boundary).toHaveAttribute("lang", "en-US");
  await expect(boundary).toHaveAttribute("data-meu-theme", "dark");
  await expect(boundary).toHaveAttribute("data-meu-motion", "reduced");
  await expect(boundary).toHaveCSS("color-scheme", "dark");
  expect(
    await boundary.evaluate((node) =>
      getComputedStyle(node).getPropertyValue("--meu-color-ink").trim().toLowerCase()
    )
  ).toBe("#f0f2ec");
  expect(
    await boundary.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).getPropertyValue("--meu-motion-enter"))
    )
  ).toBe(0);
}

test("preserves the nearest Provider boundary across every direct overlay Portal", async ({
  page
}) => {
  const selectors = [
    '[data-meu-overlay-layer="bottom-sheet"]',
    '[data-meu-overlay-layer="dialog"]',
    '[data-meu-overlay-layer="image-viewer"]',
    '[data-testid="boundary-mask"]',
    '[data-meu-overlay-layer="number-keyboard"]',
    '[data-meu-component="popover"]',
    '[data-meu-overlay-layer="toast"]'
  ];

  for (const selector of selectors) await expectInheritedBoundary(page, selector);
});

test("inherits the nested Provider boundary and moves one open Popup between containers", async ({
  page
}) => {
  const { popup, trigger } = await openPopup(page);
  const firstTarget = page.getByTestId("portal-target-first");
  const secondTarget = page.getByTestId("portal-target-second");
  const layer = page.locator('[data-meu-overlay-layer="popup"]');

  await expect(firstTarget.locator('[data-meu-overlay-layer="popup"]')).toHaveCount(1);
  await expect(layer).toHaveCount(1);
  await expect(layer).toHaveAttribute("dir", "rtl");
  await expect(layer).toHaveAttribute("lang", "en-US");
  await expect(layer).toHaveAttribute("data-meu-theme", "dark");
  await expect(layer).toHaveAttribute("data-meu-motion", "reduced");
  await expect(layer).toHaveCSS("color-scheme", "dark");
  expect(
    await layer.evaluate((node) =>
      getComputedStyle(node).getPropertyValue("--meu-color-ink").trim().toLowerCase()
    )
  ).toBe("#f0f2ec");
  expect(
    await layer.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).getPropertyValue("--meu-motion-enter"))
    )
  ).toBe(0);
  await expect(popup.getByRole("button", { name: "Close" })).toBeFocused();
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");

  await popup.getByRole("button", { name: "Move popup" }).click();
  await expect(firstTarget.locator('[data-meu-overlay-layer="popup"]')).toHaveCount(0);
  await expect(secondTarget.locator('[data-meu-overlay-layer="popup"]')).toHaveCount(1);
  await expect(layer).toHaveCount(1);
  await expect(popup.getByRole("button", { name: "Close" })).toBeFocused();
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");

  await page.locator("#outside-control").evaluate((node) => (node as HTMLElement).focus());
  await expect(popup.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("overlay-status")).toHaveText("Popup closed: escape");
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked");
  await expect(layer).toHaveCount(0);
});

test("does not dismiss on a canceled mask pointer sequence", async ({ page }) => {
  const { popup, trigger } = await openPopup(page);
  const backdrop = page.locator(
    '[data-meu-overlay-layer="popup"] [data-meu-component="mask"] > button'
  );

  await backdrop.dispatchEvent("pointerdown", { pointerId: 7, pointerType: "touch" });
  await backdrop.dispatchEvent("pointercancel", { pointerId: 7, pointerType: "touch" });
  await expect(popup).toBeVisible();
  await expect(page.getByTestId("overlay-status")).toHaveText("Popup open");
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");

  await backdrop.click({ position: { x: 8, y: 8 } });
  await expect(page.getByTestId("overlay-status")).toHaveText("Popup closed: mask");
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked");
});

test("interrupts an exit without duplicating the Popup, focus trap, or scroll lock", async ({
  page
}) => {
  const { popup, trigger } = await openPopup(page);
  const layer = page.locator('[data-meu-overlay-layer="popup"]');

  await popup.getByRole("button", { name: "Interrupt exit" }).click();
  const status = page.getByTestId("overlay-status");
  await expect(status).toHaveAttribute("data-exit-requests", "1");
  await expect(status).toHaveText("Exit interrupted");
  await expect(layer).toHaveAttribute("data-state", "open");
  await expect(layer).toHaveCount(1);
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");
  await expect(popup.getByRole("button", { name: "Close" })).toBeFocused();

  await page.waitForTimeout(200);
  await expect(layer).toHaveCount(1);
  await expect(popup).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");

  await popup.getByRole("button", { name: "Close" }).click();
  await expect(page.getByTestId("overlay-status")).toHaveText("Popup closed: close-button");
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked");
  await expect(layer).toHaveCount(0);
});
