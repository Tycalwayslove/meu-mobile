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

  await expect(page.getByText("店铺名称至少输入 2 个字符")).toBeVisible();
  await expect(page.getByText("店铺介绍至少输入 6 个字符")).toBeVisible();
  await expect(input).toHaveAttribute("aria-invalid", "true");

  await input.fill("喵呜体验店");
  await page.getByRole("button", { name: "清除输入" }).click();
  await expect(input).toHaveValue("");

  await input.fill("喵呜体验店");
  await page.getByLabel("店铺介绍").fill("专注宠物生活方式的体验店");
  await page.getByRole("button", { name: "保存店铺" }).click();
  await expect(page.getByText("已保存：喵呜体验店")).toBeVisible();
});

test("searches and clears with the SearchField contract", async ({ page }) => {
  const search = page.getByRole("searchbox", { name: "搜索组件" });
  await search.fill("TextArea");
  await search.press("Enter");
  await expect(page.getByText("正在搜索：TextArea")).toBeVisible();

  await page.getByRole("button", { name: "清除搜索" }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
});

test("keeps Cell actions, links and List semantics native", async ({ page }) => {
  const list = page.getByRole("list", { name: "店铺入口" });
  await expect(list).toBeVisible();
  await expect(list.getByRole("listitem")).toHaveCount(4);

  const action = list.getByRole("button", { name: /商品搜索/ });
  await action.click();
  await expect(page.getByText("已打开商品搜索")).toBeVisible();

  await expect(list.getByRole("link", { name: /订单中心/ })).toHaveAttribute("href", "#orders");
  await expect(list.getByRole("button", { name: "停用店铺" })).toBeDisabled();
});

test("binds checkbox arrays, radio keyboard selection and switch booleans", async ({ page }) => {
  await page.getByLabel("店铺名称").fill("喵呜体验店");
  await page.getByLabel("店铺介绍").fill("专注宠物生活方式的体验店");

  await page.getByText("到店自提", { exact: true }).click();
  const standard = page.getByRole("radio", { name: "标准配送" });
  const express = page.getByRole("radio", { name: "急速配送" });
  await standard.focus();
  await page.keyboard.press("ArrowRight");
  await expect(express).toBeChecked();
  await page.getByRole("switch", { name: "消息通知" }).click();

  await page.getByRole("button", { name: "保存店铺" }).click();
  await expect(
    page.getByText("已保存设置：delivery,pickup / express / notifications:false / agreement:true")
  ).toBeVisible();
});

test("binds stepper, slider, rate and selector values", async ({ page }) => {
  await page.getByLabel("店铺名称").fill("喵呜体验店");
  await page.getByLabel("店铺介绍").fill("专注宠物生活方式的体验店");

  await page.getByRole("button", { name: "增加" }).click();
  const volume = page.getByRole("slider", { name: "提示音量" });
  await volume.focus();
  await page.keyboard.press("ArrowRight");
  const rating = page.getByRole("slider", { name: "服务评分" });
  await rating.focus();
  await page.keyboard.press("ArrowRight");
  await page.getByText("优先配送", { exact: true }).click();

  await page.getByRole("button", { name: "保存店铺" }).click();
  await expect(
    page.getByText("已保存录入：quantity:2 / volume:41 / rating:4 / selector:fast")
  ).toBeVisible();
});

test("switches theme and preserves mobile touch targets", async ({ page }) => {
  const provider = page.locator('[data-meu-component="config-provider"]');
  await page.getByRole("button", { name: "切换主题" }).click();
  await expect(provider).toHaveAttribute("data-meu-theme", "dark");

  const buttonHeights = await page
    .locator("button")
    .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
  expect(buttonHeights.every((height) => height >= 44)).toBe(true);

  const controlHeights = await page
    .locator(
      '[data-meu-component="checkbox"], [data-meu-component="radio"], [data-meu-component="switch"], [data-meu-component="stepper"], [data-meu-component="slider"], [data-meu-component="rate"], [data-meu-component="selector"], [data-meu-component="cell"]'
    )
    .evaluateAll((controls) => controls.map((control) => control.getBoundingClientRect().height));
  expect(controlHeights.every((height) => height >= 44)).toBe(true);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});
