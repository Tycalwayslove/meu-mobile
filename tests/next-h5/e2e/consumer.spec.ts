import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("renders the isolated Next consumer without hydration errors", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await expect(page.getByRole("heading", { name: "Next H5 集成测试" })).toBeVisible();
  await expect(page.locator('[data-meu-component="config-provider"]')).toHaveAttribute(
    "data-meu-theme",
    "light"
  );
  expect(runtimeErrors).toEqual([]);
});

test("binds validation, clear action and successful submission", async ({ page }) => {
  const input = page.getByLabel("店铺名称");
  await page.getByRole("button", { name: "保存店铺" }).click();

  await expect(
    page.locator('[data-meu-component="field"] [role="alert"]')
  ).toHaveText("店铺名称至少输入 2 个字符");
  await expect(input).toHaveAttribute("aria-invalid", "true");

  await input.fill("喵呜体验店");
  await page.getByRole("button", { name: "清除输入" }).click();
  await expect(input).toHaveValue("");

  await input.fill("喵呜体验店");
  await page.getByRole("button", { name: "保存店铺" }).click();
  await expect(page.getByText("已保存：喵呜体验店")).toBeVisible();
});

test("switches theme and preserves mobile touch targets", async ({ page }) => {
  const provider = page.locator('[data-meu-component="config-provider"]');
  await page.getByRole("button", { name: "切换主题" }).click();
  await expect(provider).toHaveAttribute("data-meu-theme", "dark");

  const buttonHeights = await page.locator("button").evaluateAll((buttons) =>
    buttons.map((button) => button.getBoundingClientRect().height)
  );
  expect(buttonHeights.every((height) => height >= 44)).toBe(true);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});
