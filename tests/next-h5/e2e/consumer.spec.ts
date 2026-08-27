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

test("renders progress, skeleton, empty and result feedback contracts", async ({ page }) => {
  const section = page.getByRole("region", { name: "反馈状态组件" });
  const progress = section.getByRole("progressbar", { name: "资料上传" });
  await expect(progress).toHaveAttribute("aria-valuenow", "64");
  await section.getByRole("button", { name: "推进上传" }).click();
  await expect(progress).toHaveAttribute("aria-valuenow", "76");

  const loading = section.getByLabel("订单摘要加载中");
  await expect(loading).toHaveAttribute("aria-busy", "true");
  const skeletons = loading.locator('[data-meu-component="skeleton"]');
  await expect(skeletons).toHaveCount(2);
  await expect(skeletons.nth(0)).toHaveAttribute("aria-hidden", "true");
  await expect(skeletons.nth(1)).toHaveAttribute("aria-hidden", "true");

  const empty = section.getByRole("group", { name: "没有待处理订单" });
  await expect(empty).toContainText("当前筛选条件下没有可处理的订单。");
  await empty.getByRole("button", { name: "清除筛选" }).click();
  await expect(section.getByText("已清除订单筛选")).toBeVisible();

  const result = section.getByRole("status", { name: "订单提交成功" });
  await expect(result).toContainText("MEU-2026-0827");
  await result.getByRole("button", { name: "查看订单" }).click();
  await expect(section.getByText("已打开订单详情")).toBeVisible();
});

test("locks scroll, contains focus and restores the Popup trigger", async ({ page }) => {
  const section = page.getByRole("region", { name: "浮层基础组件" });
  const previewMask = section.locator('[data-meu-component="mask"]');
  await expect(previewMask).toHaveAttribute("aria-hidden", "true");
  await expect(previewMask).toHaveCSS("position", "absolute");

  const trigger = section.getByRole("button", { name: "打开配送浮层" });
  await trigger.click();
  const popup = page.getByRole("dialog", { name: "配送方式" });
  await expect(popup).toBeVisible();
  await expect(popup).toHaveAttribute("aria-modal", "true");
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");

  const close = popup.getByRole("button", { name: "关闭" });
  const confirm = popup.getByRole("button", { name: "确认标准配送" });
  await expect(close).toBeFocused();
  await confirm.focus();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByText("浮层已关闭：escape")).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");

  await trigger.click();
  const popupMask = page.locator('[data-meu-overlay-layer="popup"] [data-meu-component="mask"]');
  await popupMask
    .locator(":scope > button")
    .first()
    .click({ position: { x: 8, y: 8 } });
  await expect(page.getByText("浮层已关闭：mask")).toBeVisible();
});

test("snaps and drag-dismisses an accessible modal BottomSheet", async ({ page }) => {
  const section = page.getByRole("region", { name: "浮层基础组件" });
  const trigger = section.getByRole("button", { name: "打开筛选面板" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const sheet = page.getByRole("dialog", { name: "订单筛选" });
  const handle = page.getByRole("button", { name: "调整面板高度" });
  await expect(sheet).toBeVisible();
  await expect(sheet).toHaveAttribute("aria-modal", "true");
  await expect(sheet).toHaveAttribute("data-snap-point", "0.9");
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");
  await expect(handle).toBeFocused();

  await page.keyboard.press("Home");
  await expect(sheet).toHaveAttribute("data-snap-point", "0.35");
  await page.keyboard.press("End");
  await expect(sheet).toHaveAttribute("data-snap-point", "0.9");
  await page.keyboard.press("Home");
  await expect(sheet).toHaveAttribute("data-snap-point", "0.35");
  await page.waitForTimeout(250);
  await handle.hover();

  const viewport = page.viewportSize();
  const sheetBox = await sheet.boundingBox();
  const handleBox = await handle.boundingBox();
  if (!viewport || !sheetBox || !handleBox) throw new Error("Expected BottomSheet bounds");
  expect(sheetBox.x).toBeGreaterThanOrEqual(0);
  expect(sheetBox.width).toBeLessThanOrEqual(viewport.width);
  expect(sheetBox.y).toBeGreaterThanOrEqual(0);
  expect(sheetBox.y).toBeLessThan(viewport.height);
  expect(handleBox.y).toBeGreaterThanOrEqual(0);
  expect(handleBox.y + handleBox.height).toBeLessThanOrEqual(viewport.height + 1);

  const startX = handleBox.x + handleBox.width / 2;
  const startY = handleBox.y + handleBox.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX, Math.min(viewport.height - 8, startY + 240), { steps: 5 });
  await page.mouse.up();

  await expect(sheet).toBeHidden();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");
  await expect(trigger).toBeFocused();
  await expect(section.getByText("BottomSheet 已关闭：drag")).toBeVisible();
});

test("runs ActionMenu actions with danger confirmation", async ({ page }) => {
  const section = page.getByRole("region", { name: "浮层基础组件" });
  const trigger = section.getByRole("button", { name: "打开订单操作菜单" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const menu = page.getByRole("dialog", { name: "订单操作" });
  const copyAction = menu.getByRole("button", { name: /复制订单号/ });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-modal", "true");
  await expect(menu).toHaveAttribute("aria-describedby");
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");
  await expect(copyAction).toBeFocused();
  await expect(menu.locator('[data-action-group="neutral"]')).toBeVisible();
  await expect(menu.locator('[data-action-group="danger"]')).toBeVisible();
  await expect(menu.locator('[data-action-group="cancel"]')).toBeVisible();

  await copyAction.click();
  await expect(menu).toHaveAttribute("aria-busy", "true");
  await expect(menu.getByRole("button", { name: "取消" })).toBeDisabled();
  await expect(section.getByText("ActionMenu 操作：已复制订单号")).toBeVisible();
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");

  await trigger.click();
  await menu.getByRole("button", { name: "永久删除订单" }).click();
  const confirmation = page.getByRole("alertdialog", { name: "删除测试订单？" });
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByRole("button", { name: "取消" })).toBeFocused();
  await expect(menu.getByRole("button", { name: "永久删除订单" })).toBeDisabled();
  await confirmation.getByRole("button", { name: "永久删除" }).click();
  await expect(section.getByText("ActionMenu 操作：已删除订单")).toBeVisible();
  await expect(confirmation).toBeHidden();
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("keeps Picker drafts isolated until confirmation and restores trigger focus", async ({
  page
}) => {
  const trigger = page.getByRole("button", { name: "预约时间" });
  await expect(trigger).toContainText("今天 / 09:00");
  await trigger.click();

  let picker = page.getByRole("dialog", { name: "预约时间" });
  const dateWheel = picker.getByRole("listbox", { name: "日期" });
  const timeWheel = picker.getByRole("listbox", { name: "时段" });
  await expect(picker).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");
  await dateWheel.focus();
  await page.keyboard.press("ArrowDown");
  await expect(picker.getByRole("option", { name: "明天" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await timeWheel.focus();
  await page.keyboard.press("ArrowDown");
  await picker.getByRole("button", { name: "取消" }).click();
  await expect(picker).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("今天 / 09:00");

  await trigger.click();
  picker = page.getByRole("dialog", { name: "预约时间" });
  await expect(picker.getByRole("option", { name: "今天" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await picker.getByRole("option", { name: "明天" }).click();
  await picker.getByRole("option", { name: "10:00" }).click();
  await picker.getByRole("button", { name: "确定" }).click();
  await expect(picker).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("明天 / 10:00");
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");
});

test("positions and dismisses a non-modal Popover without locking scroll", async ({
  browserName,
  page
}) => {
  const section = page.getByRole("region", { name: "浮层基础组件" });
  const trigger = section.getByRole("button", { name: "打开订单快捷操作" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const popover = page.getByRole("dialog", { name: "订单快捷操作" });
  await expect(popover).toBeVisible();
  await expect(popover).not.toHaveAttribute("aria-modal");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");
  await expect(popover).toBeFocused();
  await expect(popover.locator("svg")).toHaveCount(1);

  const viewport = page.viewportSize();
  const triggerBox = await trigger.boundingBox();
  const popoverBox = await popover.boundingBox();
  if (!viewport || !triggerBox || !popoverBox) throw new Error("Expected Popover bounds");
  expect(popoverBox.x).toBeGreaterThanOrEqual(0);
  expect(popoverBox.y).toBeGreaterThanOrEqual(0);
  expect(popoverBox.x + popoverBox.width).toBeLessThanOrEqual(viewport.width);
  expect(popoverBox.y + popoverBox.height).toBeLessThanOrEqual(viewport.height);
  const actualPlacement = await popover.getAttribute("data-placement");
  if (!actualPlacement) throw new Error("Expected resolved Popover placement");
  if (actualPlacement.startsWith("bottom")) {
    expect(popoverBox.y).toBeGreaterThanOrEqual(triggerBox.y + triggerBox.height);
  } else if (actualPlacement.startsWith("top")) {
    expect(popoverBox.y + popoverBox.height).toBeLessThanOrEqual(triggerBox.y);
  }

  const action = popover.getByRole("button", { name: "复制订单号" });
  if (browserName === "webkit") {
    // Mobile WebKit does not include buttons in sequential Tab navigation by default.
    await action.focus();
  } else {
    await page.keyboard.press("Tab");
  }
  await expect(action).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(section.getByText("Popover 已关闭：escape")).toBeVisible();

  await trigger.click();
  await expect(popover).toBeVisible();
  await page.getByRole("heading", { name: "Next H5 集成测试" }).click();
  await expect(popover).toBeHidden();
  await expect(section.getByText("Popover 已关闭：outside")).toBeVisible();
});

test("runs accessible declarative and provider-scoped Dialog flows", async ({ page }) => {
  const section = page.getByRole("region", { name: "浮层基础组件" });
  const deleteTrigger = section.getByRole("button", { name: "打开删除确认" });
  await deleteTrigger.click();
  const deleteDialog = page.getByRole("alertdialog", { name: "删除测试订单？" });
  await expect(deleteDialog).toBeVisible();
  await expect(deleteDialog).toHaveAttribute("aria-modal", "true");
  await expect(deleteDialog).toContainText("订单及关联记录将被永久删除");
  await expect(deleteDialog.getByRole("button", { name: "取消" })).toBeFocused();
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");

  const deleteAction = deleteDialog.getByRole("button", { name: "永久删除" });
  await deleteAction.click();
  await expect(deleteAction).toHaveAttribute("aria-busy", "true");
  await expect(deleteDialog.getByRole("button", { name: "取消" })).toBeDisabled();
  await expect(section.getByText("已删除测试订单")).toBeVisible();
  await expect(deleteDialog).toBeHidden();
  await expect(deleteTrigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");

  const commandTrigger = section.getByRole("button", { name: "命令式确认订单" });
  await commandTrigger.click();
  const commandDialog = page.getByRole("alertdialog", { name: "确认提交订单？" });
  await expect(commandDialog.getByRole("button", { name: "取消" })).toBeFocused();
  await commandDialog.getByRole("button", { name: "确认" }).click();
  await expect(section.getByText("命令式确认：已提交")).toBeVisible();
  await expect(commandDialog).toBeHidden();
  await expect(commandTrigger).toBeFocused();
});

test("queues accessible Toast messages without trapping focus or scroll", async ({ page }) => {
  const section = page.getByRole("region", { name: "浮层基础组件" });
  const trigger = section.getByRole("button", { name: "显示 Toast 队列" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const firstToast = page.locator('[data-meu-component="toast"]');
  await expect(firstToast).toHaveAttribute("data-tone", "warning");
  await expect(firstToast.locator('[role="alert"]')).toHaveText("库存不足，已调整购买数量");
  await expect(firstToast.locator("xpath=..")).toHaveAttribute("data-position", "bottom");
  const viewportSize = page.viewportSize();
  const firstToastBox = await firstToast.boundingBox();
  if (!viewportSize || !firstToastBox) throw new Error("Expected Toast viewport bounds");
  expect(firstToastBox.y).toBeGreaterThan(viewportSize.height / 2);
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");
  await expect(page.getByText("队列中的第二条消息")).toHaveCount(0);

  const undo = firstToast.getByRole("button", { name: "撤销调整" });
  const undoBox = await undo.boundingBox();
  if (!undoBox) throw new Error("Expected Toast action bounds");
  expect(undoBox.width).toBeGreaterThanOrEqual(44);
  expect(undoBox.height).toBeGreaterThanOrEqual(44);
  await undo.click();
  await expect(section.getByText("Toast 操作：已撤销")).toBeVisible();

  const secondToast = page.locator('[data-meu-component="toast"]');
  await expect(secondToast.locator('[role="status"]')).toHaveText("队列中的第二条消息");
  await expect(secondToast).toHaveAttribute("data-tone", "success");
  const secondToastBox = await secondToast.boundingBox();
  if (!secondToastBox) throw new Error("Expected queued Toast bounds");
  expect(secondToastBox.y).toBeLessThan(viewportSize.height / 2);
  await section.getByRole("button", { name: "清空 Toast" }).click();
  await expect(page.locator('[data-meu-component="toast"]')).toBeHidden();
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
    page.getByText(
      "已保存录入：quantity:2 / volume:41 / rating:4 / picker:today,9 / selector:fast / segmented:card"
    )
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
