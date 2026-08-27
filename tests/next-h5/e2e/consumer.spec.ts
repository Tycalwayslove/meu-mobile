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

test("renders atomic display components with native actions and fallbacks", async ({ page }) => {
  const section = page.getByRole("region", { name: "信息展示组件" });
  await expect(section).toBeVisible();
  await expect(section.getByText("99+")).toBeVisible();
  await expect(section.getByLabel("店铺在线")).toBeVisible();
  await expect(section.getByRole("img", { name: "林夏" })).toBeVisible();

  const media = section.getByRole("img", { name: "绿色植物与商品包装插画" });
  await media.scrollIntoViewIfNeeded();
  await expect(media).toBeVisible();
  await expect(media.locator("xpath=..")).toHaveAttribute("data-state", "loaded");

  await section.getByRole("button", { name: "仅看待处理" }).click();
  await expect(section.getByText("已筛选待处理商品")).toBeVisible();

  const expand = section.getByRole("button", { name: "展开" });
  await expect(expand).toBeVisible();
  await expand.click();
  await expect(section.getByRole("button", { name: "收起" })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
});

test("composes Card slots and controls accessible Collapse panels", async ({ page }) => {
  const section = page.getByRole("region", { name: "卡片与折叠内容" });
  await expect(section.locator('[data-meu-component="card"]')).toContainText("履约摘要");
  await expect(section.locator("[data-meu-card-body]")).toContainText("2 至 3 个工作日");

  await section.getByRole("button", { name: "查看详情" }).click();
  await expect(page.getByText("已查看履约详情")).toBeVisible();

  const delivery = section.getByRole("button", { name: /配送范围/ });
  const returns = section.getByRole("button", { name: "退换规则" });
  const invoice = section.getByRole("button", { name: "发票服务" });
  await expect(delivery).toHaveAttribute("aria-expanded", "true");
  await expect(invoice).toBeDisabled();

  await returns.click();
  await expect(delivery).toHaveAttribute("aria-expanded", "false");
  await expect(returns).toHaveAttribute("aria-expanded", "true");
  await expect(section.getByText("已展开：returns")).toBeVisible();

  const controlledPanel = section.getByRole("region", { name: "退换规则" });
  await expect(controlledPanel).toHaveAttribute("role", "region");
  await expect(controlledPanel).toHaveAttribute("aria-hidden", "false");
});

test("uses native navigation actions, radio segments and read-only page dots", async ({ page }) => {
  const section = page.getByRole("region", { name: "导航组件" });
  await section.getByRole("button", { name: "返回" }).click();
  await section.getByText("详情", { exact: true }).click();
  await expect(section.getByText("已触发返回 / 详情")).toBeVisible();

  const dots = section.getByRole("img", { name: "第 2 页，共 4 页" });
  await expect(dots).toHaveAttribute("data-variant", "line");
  await expect(dots.getByRole("button")).toHaveCount(0);
  await section.getByRole("button", { name: "下一页" }).click();
  await expect(section.getByRole("img", { name: "第 3 页，共 4 页" })).toBeVisible();
});

test("connects tab panels, primary navigation and read-only progress semantics", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "导航组件" });
  const tabList = section.getByRole("tablist", { name: "订单内容" });
  const overview = tabList.getByRole("tab", { name: "概览" });
  const settings = tabList.getByRole("tab", { name: "设置" });
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(settings).toBeFocused();
  await expect(settings).toHaveAttribute("aria-selected", "true");
  await expect(section.getByRole("tabpanel", { name: "设置" })).toContainText("订单设置");

  const progress = section.getByRole("list", { name: "进度" });
  await expect(progress.locator("li")).toHaveCount(3);
  await expect(progress.locator('li[aria-current="step"]')).toContainText("商家发货");
  const statusPrefix = progress.getByText("进行中：", { exact: true });
  await expect(statusPrefix).toHaveCSS("position", "absolute");
  await expect(statusPrefix).toHaveCSS("width", "1px");

  const primary = section.getByRole("navigation", { name: "底部主导航" });
  await expect(primary.getByRole("link", { name: "首页" })).toHaveAttribute("href", "#home");
  await primary.getByRole("button", { name: /订单/ }).click();
  await expect(primary.getByRole("button", { name: /订单/ })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(primary.getByRole("button", { name: "我的" })).toBeDisabled();
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
  await page
    .getByRole("radiogroup", { name: "列表布局" })
    .getByText("卡片", { exact: true })
    .click();

  await page.getByRole("button", { name: "保存店铺" }).click();
  await expect(
    page.getByText("已保存录入：quantity:2 / volume:41 / rating:4 / selector:fast / segmented:card")
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
      '[data-meu-component="checkbox"], [data-meu-component="radio"], [data-meu-component="switch"], [data-meu-component="stepper"], [data-meu-component="slider"], [data-meu-component="rate"], [data-meu-component="selector"], [data-meu-component="segmented-control"], [data-meu-component="cell"]'
    )
    .evaluateAll((controls) => controls.map((control) => control.getBoundingClientRect().height));
  expect(controlHeights.every((height) => height >= 44)).toBe(true);

  const navigationTargetHeights = await page
    .locator('[data-meu-component="tab-bar"] a, [role="tab"]')
    .evaluateAll((targets) => targets.map((target) => target.getBoundingClientRect().height));
  expect(navigationTargetHeights.every((height) => height >= 44)).toBe(true);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});
