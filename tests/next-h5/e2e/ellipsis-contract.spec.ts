import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const runtimeErrorsByPage = new WeakMap<Page, string[]>();

function visualText(root: Locator) {
  return root.locator(":scope > span[aria-hidden='true']");
}

test.beforeEach(async ({ page }) => {
  const runtimeErrors: string[] = [];
  runtimeErrorsByPage.set(page, runtimeErrors);
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto("/ellipsis-contract");
  await expect(page.getByRole("heading", { name: "Ellipsis typography contracts" })).toBeVisible();
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

test("remeasures the real candidate after its font family is replaced", async ({ page }) => {
  const section = page.getByRole("region", { name: "Font family replacement" });
  const root = page.getByTestId("replacement-ellipsis");
  await expect(root).toHaveAttribute("data-state", "collapsed");
  const before = await visualText(root).textContent();

  await section.getByRole("button", { name: "Replace font family" }).click();
  await expect(root).toHaveCSS("font-family", "monospace");
  await expect.poll(() => visualText(root).textContent()).not.toBe(before);
  await expect(root).toHaveAttribute("data-state", "collapsed");
});

test("remeasures after a web font finishes loading beyond the first measurement", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "Font loading completion" });
  const root = page.getByTestId("loading-ellipsis");
  await expect(root).toHaveAttribute("data-state", "collapsed");
  await expect(page.getByTestId("font-status")).toHaveText("fallback");
  const before = await visualText(root).textContent();

  await section.getByRole("button", { name: "Load web font" }).click();
  await expect(page.getByTestId("font-status")).toHaveText("loaded");
  await expect
    .poll(() =>
      root.evaluate((element) =>
        document.fonts.check(`18px ${getComputedStyle(element).fontFamily}`)
      )
    )
    .toBe(true);
  await expect.poll(() => visualText(root).textContent()).not.toBe(before);
  await expect(root).toHaveAttribute("data-state", "collapsed");
});
