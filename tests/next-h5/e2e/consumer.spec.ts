import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import axe from "axe-core";

const runtimeErrorsByPage = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const runtimeErrors: string[] = [];
  runtimeErrorsByPage.set(page, runtimeErrors);
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator('[data-hydrated="true"]')).toBeAttached();
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

test("renders the isolated Next consumer without hydration errors", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Next H5 集成测试" })).toBeVisible();
  await expect(page.locator('[data-meu-component="config-provider"]').first()).toHaveAttribute(
    "data-meu-theme",
    "light"
  );
  expect(runtimeErrorsByPage.get(page)).toEqual([]);
});

test("resolves system theme and motion from media queries without React state", async ({
  page
}) => {
  const boundary = page
    .getByRole("region", { name: "系统主题与动效" })
    .locator('[data-meu-component="config-provider"][data-meu-theme="system"]');

  await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
  await expect(boundary).toHaveCSS("color", "rgb(30, 36, 32)");
  await expect(boundary).toHaveCSS("background-color", "rgb(248, 247, 243)");
  expect(
    await boundary.evaluate((node) => {
      const value = getComputedStyle(node).getPropertyValue("--meu-motion-enter").trim();
      return value.endsWith("ms") ? Number.parseFloat(value) : Number.parseFloat(value) * 1000;
    })
  ).toBeCloseTo(180);

  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await expect(boundary).toHaveAttribute("data-meu-theme", "system");
  await expect(boundary).toHaveAttribute("data-meu-motion", "system");
  await expect(boundary).toHaveCSS("color", "rgb(240, 242, 236)");
  await expect(boundary).toHaveCSS("background-color", "rgb(22, 26, 23)");
  expect(
    await boundary.evaluate((node) => {
      const value = getComputedStyle(node).getPropertyValue("--meu-motion-enter").trim();
      return value.endsWith("ms") ? Number.parseFloat(value) : Number.parseFloat(value) * 1000;
    })
  ).toBe(0);
});

test("composes layout, icon action, custom portal and hidden accessible text", async ({ page }) => {
  const section = page.getByRole("region", { name: "基础布局与原语" });
  const divider = section.getByRole("separator", { name: "基础布局" });
  await expect(divider).toHaveAttribute("role", "separator");
  await expect(divider).toHaveAttribute("aria-label", "基础布局");
  await expect(divider).toHaveAttribute("aria-orientation", "horizontal");
  await expect(divider).toHaveAttribute("data-align", "start");

  const emptyDivider = section.getByTestId("foundation-empty-divider");
  await expect(emptyDivider).toHaveAttribute("data-content", "false");
  await expect(emptyDivider.locator(":scope > *")).toHaveCount(1);

  const space = section.locator('[data-meu-component="space"]');
  await expect(space).toHaveAttribute("data-gap", "3");
  await expect(space).toHaveAttribute("data-wrap", "true");
  await expect(space).toHaveCSS("display", "flex");
  await expect(space).toHaveCSS("column-gap", "12px");

  const normalAction = section.getByRole("button", { name: "普通操作" });
  await expect(normalAction).toHaveAttribute("type", "button");
  const normalActionBox = await normalAction.boundingBox();
  expect(normalActionBox).not.toBeNull();
  expect(normalActionBox ? normalActionBox.width : 0).toBeGreaterThanOrEqual(44);
  expect(normalActionBox ? normalActionBox.height : 0).toBeGreaterThanOrEqual(44);
  await normalAction.click();
  await expect(section.getByText("普通按钮已执行")).toBeVisible();

  const iconAction = section.getByRole("button", { name: "刷新基础组件" });
  const decorativeIcon = iconAction.locator('svg[data-meu-icon="search"]');
  await expect(decorativeIcon).toHaveAttribute("aria-hidden", "true");
  await expect(decorativeIcon).toHaveAttribute("focusable", "false");
  await expect(decorativeIcon).toHaveAttribute("width", "20");
  await expect(decorativeIcon).toHaveAttribute("height", "20");
  const iconActionBox = await iconAction.boundingBox();
  expect(iconActionBox).not.toBeNull();
  expect(iconActionBox ? iconActionBox.width : 0).toBeGreaterThanOrEqual(44);
  expect(iconActionBox ? iconActionBox.height : 0).toBeGreaterThanOrEqual(44);
  await iconAction.focus();
  await iconAction.press("Enter");
  await expect(section.getByText("图标按钮已执行")).toBeVisible();

  const portalTarget = section.getByTestId("foundation-portal-target");
  await expect(portalTarget.getByTestId("foundation-portal-content")).toHaveText(
    "自定义容器 Portal 内容"
  );

  const hiddenLabel = page.locator("#foundation-status-label");
  await expect(hiddenLabel).toBeAttached();
  await expect(hiddenLabel).toHaveCSS("position", "absolute");
  await expect(hiddenLabel).toHaveCSS("width", "1px");

  const skipLink = section.getByRole("link", { name: "跳到基础操作" });
  await expect(skipLink.locator("..")).toHaveCSS("position", "absolute");
  await skipLink.focus();
  await expect(skipLink.locator("..")).toHaveCSS("position", "static");

  const semanticIcon = section.getByRole("img", { name: "基础组件状态：正常" });
  const semanticTitle = semanticIcon.locator("title");
  await expect(semanticTitle).toHaveText("基础组件状态：正常");
  await expect(semanticTitle).toHaveAttribute("id", /.+/);
  expect(await semanticIcon.getAttribute("aria-labelledby")).toBe(
    await semanticTitle.getAttribute("id")
  );

  const safeArea = section.getByTestId("foundation-safe-area");
  await expect(safeArea).toHaveAttribute("data-position", "bottom");
  await expect(safeArea).toHaveAttribute("aria-hidden", "true");
  await expect(safeArea).toHaveCSS("pointer-events", "none");
  expect(
    await safeArea.evaluate((node) =>
      node.style.getPropertyValue("--meu-safe-area-fallback").trim()
    )
  ).toBe("12px");
});

test("has no WCAG A/AA violations in light and dark themes", async ({ page }) => {
  await page.addScriptTag({ content: axe.source });

  for (const theme of ["light", "dark"] as const) {
    if (theme === "dark") {
      await page.getByRole("button", { name: "切换主题" }).click();
    }
    await expect(page.locator('[data-meu-component="config-provider"]').first()).toHaveAttribute(
      "data-meu-theme",
      theme
    );
    await page.waitForTimeout(250);
    const violations = await page.evaluate(async () => {
      const axeRuntime = (
        globalThis as typeof globalThis & {
          axe: {
            run: (
              context: Document,
              options: { runOnly: { type: "tag"; values: string[] } }
            ) => Promise<{
              violations: Array<{
                id: string;
                impact: string | null;
                nodes: Array<{ failureSummary?: string; html: string; target: unknown }>;
              }>;
            }>;
          };
        }
      ).axe;
      const results = await axeRuntime.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }
      });
      return results.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({
          failureSummary: node.failureSummary,
          html: node.html,
          target: node.target
        }))
      }));
    });

    expect(violations, `${theme} theme accessibility violations`).toEqual([]);
  }
});

test("renders a non-interactive watermark and restores its removed overlay", async ({ page }) => {
  const section = page.getByRole("region", { name: "内容水印" });
  const watermark = section.locator('[data-meu-component="watermark"]');
  const overlay = watermark.locator("[data-meu-watermark-overlay]");

  await expect(overlay).toHaveAttribute("aria-hidden", "true");
  await expect(overlay).toHaveCSS("pointer-events", "none");
  await section.getByRole("button", { name: "查看水印凭证" }).click();
  await expect(section.getByText("水印内操作可用")).toBeVisible();

  await overlay.evaluate((node) => node.remove());
  await expect(watermark.locator("[data-meu-watermark-overlay]")).toBeAttached();
  await expect(section.getByText("水印已恢复")).toBeVisible();

  const restoredOverlay = watermark.locator("[data-meu-watermark-overlay]");
  const canonicalStyle = await restoredOverlay.getAttribute("style");
  await restoredOverlay.evaluate((node) => node.setAttribute("style", "display: none"));
  await expect(restoredOverlay).toHaveAttribute("style", canonicalStyle || "");
});

test("navigates indexed sections and vertical category panels", async ({ page }) => {
  const section = page.getByRole("region", { name: "索引与侧边导航" });
  const indexList = section.locator('[data-meu-component="index-list"]');
  const indexB = indexList.getByRole("button", { name: "B" });

  await indexB.click();
  await expect(indexB).toHaveAttribute("aria-current", "location");
  await expect(section.getByText("索引 B / 分类 featured")).toBeVisible();

  await indexB.focus();
  await indexB.press("ArrowDown");
  const indexC = indexList.getByRole("button", { name: "C" });
  await expect(indexC).toBeFocused();
  await expect(indexC).toHaveAttribute("aria-current", "location");
  await expect(section.getByText("索引 C / 分类 featured")).toBeVisible();

  const indexA = indexList.getByRole("button", { name: "A" });
  const rail = indexList.getByRole("navigation", { name: "分组索引" });
  const aBox = await indexA.boundingBox();
  const cBox = await indexC.boundingBox();
  if (!aBox || !cBox) throw new Error("Expected IndexList rail button bounds");
  await rail.evaluate(
    (node, positions) => {
      const dispatch = (type: string, clientY: number) => {
        node.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            button: 0,
            cancelable: true,
            clientX: positions.clientX,
            clientY,
            isPrimary: true,
            pointerId: 17,
            pointerType: "touch"
          })
        );
      };
      dispatch("pointerdown", positions.fromY);
      dispatch("pointermove", positions.toY);
      dispatch("pointerup", positions.toY);
    },
    {
      clientX: aBox.x + aBox.width / 2,
      fromY: cBox.y + cBox.height / 2,
      toY: aBox.y + aBox.height / 2
    }
  );
  await expect(indexA).toHaveAttribute("aria-current", "location");
  await expect(section.getByText("索引 A / 分类 featured")).toBeVisible();

  const featured = section.getByRole("tab", { name: "精选" });
  await featured.focus();
  await featured.press("ArrowDown");
  const food = section.getByRole("tab", { name: /食品/ });
  await expect(food).toHaveAttribute("aria-selected", "true");
  await expect(section.getByRole("tabpanel", { name: /食品/ })).toContainText("食品与饮品分类");
  await expect(section.getByText("索引 A / 分类 food")).toBeVisible();
});

test("binds validation, clear action and successful submission", async ({ page }) => {
  const input = page.getByLabel("店铺名称");
  const textarea = page.getByLabel("店铺介绍");
  await page.getByRole("button", { name: "保存店铺" }).click();

  await expect(page.getByText("店铺名称至少输入 2 个字符")).toBeVisible();
  await expect(page.getByText("店铺介绍至少输入 6 个字符")).toBeVisible();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(textarea).toHaveAttribute("aria-invalid", "true");
  await expect(input).toHaveAttribute("data-meu-component", "text-input");
  await expect(textarea).toHaveAttribute("data-meu-component", "text-area");
  await expect(input.locator('xpath=ancestor::*[@data-meu-component="field"]')).toHaveCount(1);
  await expect(textarea.locator('xpath=ancestor::*[@data-meu-component="field"]')).toHaveCount(1);

  await input.fill("喵呜体验店");
  await page.getByRole("button", { name: "清除输入" }).click();
  await expect(input).toHaveValue("");

  await input.fill("喵呜体验店");
  await textarea.fill("专注宠物生活方式的体验店");
  await page.getByRole("button", { name: "保存店铺" }).click();
  await expect(page.getByText("已保存：喵呜体验店")).toBeVisible();
});

test("synchronizes native reset with RHF values and interaction state", async ({ page }) => {
  const input = page.getByLabel("店铺名称");
  const textarea = page.getByLabel("店铺介绍");
  const state = page.getByLabel("店铺表单状态");

  await input.fill("等待重置的店铺");
  await input.blur();
  await textarea.fill("等待重置的店铺介绍内容");
  await page.getByRole("button", { name: "应用服务端错误" }).click();

  await expect(state).toHaveText("dirty/touched/error");
  await expect(page.getByText("服务端提示店铺名称已存在")).toBeVisible();
  await expect(page.getByText("服务端拒绝了当前店铺介绍")).toBeVisible();

  await page.getByRole("button", { name: "原生重置店铺表单" }).click();

  await expect(input).toHaveValue("");
  await expect(textarea).toHaveValue("");
  await expect(state).toHaveText("pristine/untouched/valid");
  await expect(page.getByText("服务端提示店铺名称已存在")).toHaveCount(0);
  await expect(page.getByText("服务端拒绝了当前店铺介绍")).toHaveCount(0);
  await expect(input).not.toHaveAttribute("aria-invalid", /.+/);
  await expect(textarea).not.toHaveAttribute("aria-invalid", /.+/);
});

test("focuses and reveals the first server error in form DOM order", async ({ page }) => {
  await page.getByRole("button", { name: "应用服务端错误" }).click();

  const input = page.getByLabel("店铺名称");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("服务端提示店铺名称已存在")).toBeVisible();
  await expect(page.getByText("服务端拒绝了当前店铺介绍")).toBeVisible();

  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const box = await input.boundingBox();
  expect(box).not.toBeNull();
  expect(box ? box.y : -1).toBeGreaterThanOrEqual(0);
  expect(box ? box.y + box.height : viewportHeight + 1).toBeLessThanOrEqual(viewportHeight);
});

test("searches and clears with the SearchField contract", async ({ page }) => {
  const search = page.getByRole("searchbox", { name: "搜索组件" });
  await expect(search).toHaveAttribute("dir", "rtl");
  await expect(search.locator("xpath=parent::*")).toHaveAttribute("dir", "rtl");
  const describedByValue = await search.getAttribute("aria-describedby");
  const describedBy = describedByValue ? describedByValue.split(/\s+/) : [];
  expect(describedBy).toContain("integration-search-policy");
  expect(describedBy.length).toBe(new Set(describedBy).size);
  expect(
    await page.evaluate(
      (ids) =>
        ids.map((id) => {
          const description = document.getElementById(id);
          return description ? description.textContent || "" : "";
        }),
      describedBy
    )
  ).toContain("支持组件名和能力关键词");
  await search.fill("TextArea");
  await search.press("Enter");
  await expect(page.getByText("正在搜索：TextArea")).toBeVisible();

  await search.locator("xpath=parent::*").getByRole("button", { name: "清除搜索" }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();

  const nestedInput = page.getByRole("textbox", { name: /嵌套联系人/ });
  await expect(nestedInput).toHaveAttribute("required", "");
  await expect(nestedInput).toHaveAttribute("id", "integration-nested-field-control");
  await expect(page.locator("#integration-nested-field-control")).toHaveCount(1);
  expect(
    await nestedInput.evaluate((input) => Number.parseFloat(getComputedStyle(input).fontSize))
  ).toBeGreaterThanOrEqual(16);

  const rtlTextArea = page.getByRole("textbox", { name: "RTL 备注" });
  await expect(rtlTextArea).toHaveAttribute("dir", "rtl");
  const rtlTextAreaRoot = rtlTextArea.locator("..");
  await expect(rtlTextAreaRoot).toHaveAttribute("dir", "rtl");
  const counter = rtlTextAreaRoot.locator('[data-meu-slot="count"]');
  await expect(counter).toContainText("/ 80");
  await expect(counter).toHaveAttribute("dir", "ltr");
  expect(
    await rtlTextArea.evaluate((input) => Number.parseFloat(getComputedStyle(input).fontSize))
  ).toBeGreaterThanOrEqual(16);
});

test("unregisters dynamic values and serializes one pending submit with its submitter", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "表单核心加固" });
  const form = section.getByRole("form", { name: "表单核心加固表单" });
  await expect(form.getByRole("textbox", { name: "动态可选字段" })).toHaveValue("应随卸载移除");
  await form.getByRole("button", { name: "卸载可选字段" }).click();
  await expect(form.getByRole("textbox", { name: "动态可选字段" })).toHaveCount(0);

  const submit = form.getByRole("button", { name: "提交加固表单" });
  await submit.click();
  await expect(form.getByLabel("加固表单提交次数")).toHaveText("提交尝试：1");
  await expect(form.getByLabel("加固表单状态")).toHaveText("submitting");
  await submit.click();
  await expect(form.getByLabel("加固表单提交次数")).toHaveText("提交尝试：1");
  await expect(form.getByLabel("加固表单 Action")).toHaveText("Action 尚未执行");

  await form.getByRole("button", { name: "完成异步提交" }).click();
  await expect(form.getByLabel("加固表单提交值")).toHaveText("提交值：Meu 商店/optional:absent");
  await expect(form.getByLabel("加固表单 Action")).toHaveText(
    "Action：Meu 商店/save/optional:absent"
  );
  await expect(form.getByLabel("加固表单状态")).toHaveText("idle");
});

test("lets a native search form submit once and restore its uncontrolled default", async ({
  page
}) => {
  const form = page.getByRole("form", { name: "原生搜索表单" });
  const search = form.getByRole("searchbox", { name: "可重置原生搜索" });

  await expect(search).toHaveValue("订单");
  await search.fill("退款订单");
  await search.press("Enter");
  await expect(form.getByText("原生搜索提交：退款订单")).toBeVisible();

  await search.fill("临时条件");
  await form.getByRole("button", { name: "恢复默认搜索" }).click();
  await expect(search).toHaveValue("订单");
  const formValue = await form.evaluate((element) => {
    const value = new FormData(element as HTMLFormElement).get("nativeQuery");
    return typeof value === "string" ? value : "";
  });
  expect(formValue).toBe("订单");
});

test("arbitrates a real scroll container and keyboard-equivalent refresh paths", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "下拉刷新" });
  const root = section.locator('[data-meu-component="pull-to-refresh"]');
  const dispatchGesture = (points: Array<{ x: number; y: number }>) =>
    root.evaluate((node, gesturePoints) => {
      const dispatch = (type: string, point: { x: number; y: number }, touching: boolean) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, "touches", {
          value: touching ? [{ clientX: point.x, clientY: point.y }] : []
        });
        node.dispatchEvent(event);
        return event.defaultPrevented;
      };

      const [start, ...moves] = gesturePoints;
      if (!start) throw new Error("Expected at least one gesture point");
      dispatch("touchstart", start, true);
      const moveResults = moves.map((point) => dispatch("touchmove", point, true));
      dispatch("touchend", moves.at(-1) || start, false);
      return moveResults;
    }, points);

  const scrollMetrics = await section.evaluate((node) => ({
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight
  }));
  expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);

  await section.evaluate((node) => {
    node.scrollTop = 80;
  });
  await expect.poll(() => section.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  const blockedMoveResults = await dispatchGesture([
    { x: 20, y: 20 },
    { x: 20, y: 220 }
  ]);
  expect(blockedMoveResults).toEqual([false]);
  await expect(root).toHaveAttribute("data-status", "idle");
  await expect(root).toContainText("刷新次数：0");

  await section.evaluate((node) => {
    node.scrollTop = 0;
  });
  const horizontalMoveResults = await dispatchGesture([
    { x: 20, y: 20 },
    { x: 180, y: 40 }
  ]);
  expect(horizontalMoveResults).toEqual([false]);
  await expect(root).toHaveAttribute("data-status", "idle");

  const landingJitterMoveResults = await dispatchGesture([
    { x: 20, y: 20 },
    { x: 22, y: 19 },
    { x: 20, y: 50 }
  ]);
  expect(landingJitterMoveResults).toEqual([false, true]);
  await expect(root).toHaveAttribute("data-status", "idle");
  await expect(root).toContainText("请求开始次数：0");

  const pullMoveResults = await dispatchGesture([
    { x: 20, y: 20 },
    { x: 20, y: 220 }
  ]);
  expect(pullMoveResults).toEqual([true]);
  await expect(root).toHaveAttribute("data-status", "refreshing");
  await expect(root).toContainText("请求开始次数：1");

  const keyboardAction = section.getByRole("button", { name: "刷新订单数据" });
  await expect(keyboardAction).toBeDisabled();

  const lockedMoveResults = await dispatchGesture([
    { x: 20, y: 20 },
    { x: 20, y: 220 }
  ]);
  expect(lockedMoveResults).toEqual([false]);
  await expect(root).toContainText("请求开始次数：1");

  await root.getByRole("button", { name: "完成刷新请求" }).click();
  await expect(root).toContainText("刷新次数：1");

  await keyboardAction.focus();
  await keyboardAction.press("Enter");
  await expect(root).toHaveAttribute("aria-busy", "true");
  await expect(root).toContainText("请求开始次数：2");
  await root.getByRole("button", { name: "完成刷新请求" }).click();
  await expect(root).toContainText("刷新次数：2");
});

test("cancels a pull when the active touch sequence is interrupted", async ({ page }) => {
  const section = page.getByRole("region", { name: "下拉刷新" });
  const root = section.locator('[data-meu-component="pull-to-refresh"]');
  await section.evaluate((node) => {
    node.scrollTop = 0;
  });
  await root.evaluate((node) => {
    const dispatch = (type: string, y: number, touching: boolean) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, "touches", {
        value: touching ? [{ clientX: 20, clientY: y }] : []
      });
      node.dispatchEvent(event);
    };
    dispatch("touchstart", 20, true);
    dispatch("touchmove", 220, true);
    dispatch("touchcancel", 220, false);
  });
  await expect(root).toHaveAttribute("data-status", "idle");
  await expect(root).toHaveAttribute("data-pull-distance", "0");
  await expect(root).toContainText("刷新次数：0");
});

test("loads infinite pages manually, locks each request and reaches completion", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "无限列表" });
  const list = section.getByRole("list", { name: "分页订单" });
  const root = section.locator('[data-meu-component="infinite-list"]');
  await expect(list.getByRole("listitem")).toHaveCount(2);

  const firstLoad = section.getByRole("button", { name: "加载更多" });
  await firstLoad.focus();
  await firstLoad.evaluate((button) => {
    (button as HTMLButtonElement).click();
    (button as HTMLButtonElement).click();
  });
  await expect(root).toHaveAttribute("aria-busy", "true");
  await expect(list.getByRole("listitem")).toHaveCount(4);
  const secondLoad = section.getByRole("button", { name: "加载更多" });
  await expect(secondLoad).toBeFocused();
  await expect(root.getByRole("status")).toHaveText("已加载下一页订单");
  await expect(section.getByText("分页请求已完成：manual")).toBeVisible();

  await secondLoad.click();
  await expect(list.getByRole("listitem")).toHaveCount(6);
  await expect(root).toHaveAttribute("data-status", "complete");
  await expect(section.getByText("没有更多内容了").last()).toBeVisible();
  await expect(root.getByRole("button")).toHaveCount(0);
});

test("cooperatively aborts an in-flight infinite-list request on external completion", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "无限列表" });
  const root = section.locator('[data-meu-component="infinite-list"]');

  await section.getByRole("button", { name: "加载更多" }).click();
  await expect(root).toHaveAttribute("aria-busy", "true");
  await section.getByRole("button", { name: "结束分页并取消请求" }).click();

  await expect(root).toHaveAttribute("data-status", "complete");
  await expect(root).not.toHaveAttribute("aria-busy", "true");
  await expect(section.getByText("分页请求已取消：manual")).toBeVisible();
  await expect(root.getByRole("status")).toHaveText("没有更多内容了");
  await expect(section.getByText("加载更多内容失败")).toHaveCount(0);
});

test("virtualizes ten thousand dynamic rows and retains the focused item", async ({ page }) => {
  const section = page.getByRole("region", { name: "虚拟列表" });
  const list = section.getByRole("list", { name: "万条虚拟订单" });
  const firstAction = list.getByRole("button", { name: "查看虚拟订单 1" });

  await expect(firstAction).toBeVisible();
  const initialRows = await list.getByRole("listitem").count();
  expect(initialRows).toBeGreaterThan(4);
  expect(initialRows).toBeLessThan(20);
  await expect(list.getByRole("listitem").first()).toHaveAttribute("aria-setsize", "10000");
  await expect(list.getByRole("listitem").first()).toHaveAttribute("aria-posinset", "1");

  await firstAction.focus();
  await expect(firstAction).toBeFocused();
  await section.getByRole("button", { name: "跳到第 9001 项" }).evaluate((button) => {
    (button as HTMLButtonElement).click();
  });

  await expect(list.locator('[aria-posinset="9001"]')).toBeVisible();
  await expect(firstAction).toBeAttached();
  await expect(firstAction).toBeFocused();
  await expect(section.getByText(/虚拟范围：/)).toContainText("9001");

  await section.getByRole("button", { name: "跳到第 9001 项" }).focus();
  await expect(list.locator('[aria-posinset="1"]')).toHaveCount(0);
});

test("binds a non-modal number keyboard without owning the form value", async ({ page }) => {
  const section = page.getByRole("region", { name: "数字键盘表单集成" });
  const trigger = section.getByRole("button", { name: "交易金额" });

  await trigger.focus();
  await trigger.click();

  const keyboard = page.getByRole("group", { name: "交易金额" });
  await expect(keyboard).toBeVisible();
  const keyboardLayer = page.locator('[data-meu-overlay-layer="number-keyboard"]');
  await expect(keyboardLayer).toHaveAttribute("dir", "rtl");
  await expect(keyboardLayer).toHaveAttribute("data-meu-motion", "reduced");
  await expect(keyboard).toHaveCSS("transition-duration", "0s");
  const closeButton = keyboard.getByRole("button", { name: "收起" });
  const [keyboardBox, closeBox] = await Promise.all([
    keyboard.boundingBox(),
    closeButton.boundingBox()
  ]);
  expect(keyboardBox).not.toBeNull();
  expect(closeBox).not.toBeNull();
  expect(
    keyboardBox && closeBox
      ? closeBox.x + closeBox.width / 2 < keyboardBox.x + keyboardBox.width / 2
      : false
  ).toBe(true);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked");
  await expect(page.getByRole("dialog", { name: "交易金额" })).toHaveCount(0);

  await keyboard.getByRole("button", { name: "1", exact: true }).click();
  await keyboard.getByRole("button", { name: "小数点" }).click();
  await keyboard.getByRole("button", { name: "小数点" }).click();
  await keyboard.getByRole("button", { name: "2", exact: true }).click();
  await keyboard.getByRole("button", { name: "3", exact: true }).click();
  await keyboard.getByRole("button", { name: "4", exact: true }).click();
  await expect(trigger).toContainText("¥ 1.23");

  await keyboard.getByRole("button", { name: "删除上一位" }).click();
  await expect(trigger).toContainText("¥ 1.2");
  await keyboard.getByRole("button", { name: "完成金额输入" }).click();
  await expect(keyboard).toHaveCount(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(section.getByText("金额确认：1.2")).toBeVisible();
  await expect(section.getByText("键盘关闭：confirm")).toBeVisible();

  await trigger.click();
  await expect(page.getByRole("group", { name: "交易金额" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("group", { name: "交易金额" })).toHaveCount(0);
  await expect(section.getByText("键盘关闭：escape")).toBeVisible();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked");
});

test("binds passcode cells to one real form input and a non-modal keyboard", async ({ page }) => {
  const section = page.getByRole("region", { name: "密码输入表单集成" });
  const input = section.getByLabel(/短信验证码/);
  const cells = section.locator("[data-meu-passcode-cell]");

  await expect(input).toHaveAttribute("type", "password");
  await expect(input).toHaveAttribute("inputmode", "none");
  await expect(input).toHaveAttribute("autocomplete", "one-time-code");
  await expect(input).not.toHaveAttribute("readonly", "");
  await expect(cells).toHaveCount(4);
  const cellBox = await cells.first().boundingBox();
  expect(cellBox).not.toBeNull();
  expect(cellBox ? cellBox.width : 0).toBeGreaterThanOrEqual(44);
  expect(cellBox ? cellBox.height : 0).toBeGreaterThanOrEqual(48);

  await input.focus();
  const keyboard = page.getByRole("group", { name: "验证码键盘" });
  await expect(keyboard).toBeVisible();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked");
  await expect(page.getByRole("dialog", { name: "验证码键盘" })).toHaveCount(0);

  await keyboard.getByRole("button", { name: "1", exact: true }).click();
  await keyboard.getByRole("button", { name: "2", exact: true }).click();
  await keyboard.getByRole("button", { name: "删除上一位" }).click();
  await keyboard.getByRole("button", { name: "3", exact: true }).click();
  await keyboard.getByRole("button", { name: "4", exact: true }).click();
  await keyboard.getByRole("button", { name: "5", exact: true }).click();

  await expect(input).toHaveValue("1345");
  await expect(section.locator('[data-meu-component="passcode-input"]')).toHaveAttribute(
    "data-complete",
    "true"
  );
  await expect(section.getByText("验证码完成：1345")).toBeVisible();
  await expect(keyboard).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked");
});

test("binds image upload tasks to serializable form values and native input focus", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "图片上传表单集成" });
  const uploader = section.locator('[data-meu-component="image-uploader"]');
  const input = section.locator('input[type="file"]');
  const serializedValues = section.locator('input[type="hidden"][name="productImages"]');
  const existingPreview = section.getByRole("button", { name: "已有商品主图，预览" });
  await expect(existingPreview).toBeVisible();
  await expect(input).toHaveAttribute("type", "file");
  await expect(input).toHaveAttribute("accept", "image/*");
  expect(await input.getAttribute("name")).toBeNull();
  await expect(serializedValues).toHaveCount(1);
  await expect(serializedValues.first()).toHaveValue("/demo-media.svg");

  const addButton = section.getByRole("button", { name: "添加图片" });
  const addBox = await addButton.boundingBox();
  expect(addBox).not.toBeNull();
  expect(addBox ? addBox.width : 0).toBeGreaterThanOrEqual(44);
  expect(addBox ? addBox.height : 0).toBeGreaterThanOrEqual(44);

  const deleteButton = section.getByRole("button", { name: "删除 已有商品主图" });
  const [previewBox, deleteBox] = await Promise.all([
    existingPreview.boundingBox(),
    deleteButton.boundingBox()
  ]);
  expect(previewBox).not.toBeNull();
  expect(deleteBox).not.toBeNull();
  expect(previewBox ? previewBox.height : 0).toBeGreaterThanOrEqual(44);
  expect(deleteBox ? deleteBox.height : 0).toBeGreaterThanOrEqual(44);
  expect(
    previewBox && deleteBox
      ? previewBox.y + previewBox.height <= deleteBox.y ||
          deleteBox.y + deleteBox.height <= previewBox.y
      : false
  ).toBe(true);

  await deleteButton.click();
  await expect(section.getByText(/图片已删除：已有商品主图；当前 0 张/)).toBeVisible();
  await expect(serializedValues).toHaveCount(0);
  await page.getByLabel("店铺名称").fill("喵呜体验店");
  await page.getByLabel("店铺介绍").fill("专注宠物生活方式的体验店");
  await page.getByRole("button", { name: "保存店铺" }).click();
  await expect(page.getByText("请至少上传一张商品图片")).toBeVisible();
  await expect(input).toBeFocused();
  await expect(uploader).toHaveAttribute("data-native-input-focused", "true");
  await expect(uploader).toHaveAttribute("aria-invalid", "true");
  await expect(input).not.toHaveAttribute("aria-invalid", /.+/);
  await expect(input).toHaveAttribute("aria-describedby", /-error(?:\s|$)/);

  await input.setInputFiles({
    name: "uploaded-product.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("local image fixture")
  });
  await expect(uploader.locator('[data-state="uploading"]')).toBeVisible();
  await expect(section.getByText("35%")).toBeVisible();
  await expect(section.getByRole("button", { name: "uploaded-product.jpg，预览" })).toBeVisible();
  await expect(section.getByText(/图片上传完成：uploaded-product.jpg；当前 1 张/)).toBeVisible();
  await expect(page.getByText("请至少上传一张商品图片")).toHaveCount(0);
  await expect(serializedValues).toHaveCount(1);
  await expect(serializedValues.first()).toHaveValue("/demo-media.svg");

  await page.getByRole("button", { name: "保存店铺" }).click();
  await expect(page.getByText("已保存图片：1")).toBeVisible();
});

test("binds searchable tree drafts and restores focus after confirmation", async ({ page }) => {
  const section = page.getByRole("region", { name: "树形选择表单集成" });
  const trigger = section.getByRole("button", { name: "商品类目" });
  await expect(trigger).toContainText("智能手机");
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "商品类目" });
  const tree = dialog.getByRole("tree", { name: "可选项" });
  await expect(tree).toHaveAttribute("aria-multiselectable", "true");
  await expect(tree.getByRole("treeitem", { name: "数码家电" })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  const kitchen = tree.getByRole("treeitem", { name: "厨房用品" });
  const kitchenBox = await kitchen.boundingBox();
  expect(kitchenBox).not.toBeNull();
  expect(kitchenBox ? kitchenBox.height : 0).toBeGreaterThanOrEqual(48);

  const search = dialog.getByRole("searchbox", { name: "搜索选项" });
  await search.fill("厨房");
  await expect(tree.getByRole("treeitem")).toHaveCount(2);
  await expect(tree.getByRole("treeitem", { name: "家居生活" })).toBeVisible();
  await tree.getByRole("treeitem", { name: "厨房用品" }).click();
  await dialog.getByRole("button", { name: "取消" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toContainText("智能手机");
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(dialog.getByRole("searchbox", { name: "搜索选项" })).toHaveValue("");
  await tree.getByRole("treeitem", { name: "厨房用品" }).click();
  await dialog.getByRole("button", { name: "确定" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toContainText("智能手机、厨房用品");
  await expect(trigger).toBeFocused();
});

test("runs the controlled carousel with native alternatives and focus isolation", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "内容轮播" });
  const carousel = section.getByRole("group", { name: "推荐活动" });
  await expect(carousel).toHaveAttribute("data-index", "0");
  await expect(carousel).toHaveAttribute("data-autoplay", "true");
  await expect(carousel).toHaveAttribute("data-rotating", "false");
  await expect(section.getByRole("button", { name: "播放轮播" })).toBeVisible();
  const carouselProvider = carousel.locator(
    'xpath=ancestor::*[@data-meu-component="config-provider"][1]'
  );
  await expect(carouselProvider).toHaveAttribute("dir", "rtl");
  await expect(carouselProvider).toHaveAttribute("data-meu-motion", "reduced");
  await expect(section.getByText("当前轮播：1")).toBeVisible();
  await expect(section.getByRole("img", { name: "第 1 页，共 3 页" })).toBeVisible();
  await expect(section.locator("[data-meu-carousel-status]")).toHaveText(
    "本周新品，第 1 张，共 3 张"
  );

  await section.getByRole("button", { name: "下一张" }).click();
  await expect(carousel).toHaveAttribute("data-index", "1");
  await expect(section.getByText("当前轮播：2")).toBeVisible();
  await expect(section.getByRole("img", { name: "第 2 页，共 3 页" })).toBeVisible();
  await expect(
    section.getByRole("button", { name: "查看本周新品", includeHidden: true })
  ).toHaveAttribute("tabindex", "-1");
  await expect(section.getByRole("link", { name: "查看会员礼遇" })).not.toHaveAttribute(
    "tabindex",
    "-1"
  );

  await section.getByRole("button", { name: "上一张" }).click();
  await expect(carousel).toHaveAttribute("data-index", "0");
});

test("opens a modal image gallery with zoom, keyboard navigation and focus restoration", async ({
  page
}) => {
  const section = page.locator('section[aria-label="图片预览"]');
  const trigger = section.getByRole("button", { name: "预览商品图片" });
  await trigger.focus();
  await trigger.click();

  const viewer = page.getByRole("dialog", { name: "商品图片预览" });
  const gallery = page.getByRole("group", { name: "商品图片预览" });
  const close = viewer.getByRole("button", { name: "关闭图片预览" });
  await expect(viewer).toBeVisible();
  await expect(viewer).toHaveAttribute("aria-modal", "true");
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");
  await expect(close).toBeFocused();
  await expect(viewer.getByText("1 / 3")).toBeVisible();
  await expect(viewer.getByRole("img", { name: "商品正面图片" })).toBeVisible();
  await expect(viewer.locator("figcaption")).toContainText("商品正面图片");
  await expect(page.locator('[data-meu-overlay-layer="image-viewer"]')).toHaveAttribute(
    "data-meu-motion",
    "system"
  );

  const closeBox = await close.boundingBox();
  expect(closeBox).not.toBeNull();
  expect(closeBox ? closeBox.width : 0).toBeGreaterThanOrEqual(44);
  expect(closeBox ? closeBox.height : 0).toBeGreaterThanOrEqual(44);

  await viewer.getByRole("button", { name: "下一张图片" }).click();
  await expect(viewer.getByText("2 / 3")).toBeVisible();
  await expect(section.getByText(/图片切换：next/)).toBeVisible();

  await viewer.getByRole("button", { name: "放大图片" }).click();
  await expect(viewer).toHaveAttribute("data-scale", "1.5");
  await expect(gallery).toHaveAttribute("data-drag-enabled", "false");
  await viewer.getByRole("img", { name: "商品侧面图片" }).evaluate((image) => {
    image.dispatchEvent(new Event("error"));
  });
  await expect(viewer.getByText("图片加载失败", { exact: true })).toBeVisible();
  await expect(viewer).toHaveAttribute("data-scale", "1");
  await expect(gallery).toHaveAttribute("data-drag-enabled", "true");

  await page.keyboard.press("ArrowRight");
  await expect(viewer.getByText("3 / 3")).toBeVisible();
  await expect(section.getByText(/当前图片：3 \/ 3/)).toBeVisible();
  await close.click();
  await expect(viewer).toHaveCount(0);
  await expect(section.getByText(/图片预览关闭：close-button/)).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked");
});

test("runs controlled swipe actions and preserves a non-gesture action menu", async ({ page }) => {
  const section = page.getByRole("region", { name: "滑动操作" });
  const root = section.locator('[data-meu-component="swipe-actions"]');
  await expect(root).toHaveAttribute("data-open-side", "none");

  const reveal = section.getByRole("button", { name: "显示右侧操作" });
  await reveal.focus();
  await page.keyboard.press("Enter");
  await expect(root).toHaveAttribute("data-open-side", "right");
  await expect(section.getByRole("button", { name: "归档" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(root).toHaveAttribute("data-open-side", "none");
  await expect(section.getByText("滑动操作：已归档")).toBeVisible();
  await expect(reveal).toBeFocused();

  const box = await root.boundingBox();
  if (!box) throw new Error("Expected SwipeActions bounds");
  const startX = box.x + box.width - 24;
  const y = box.y + box.height / 2;
  await root.evaluate(
    (node, position) => {
      const dispatch = (type: string, clientX: number) => {
        node.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            button: 0,
            cancelable: true,
            clientX,
            clientY: position.y,
            isPrimary: true,
            pointerId: 7,
            pointerType: "touch"
          })
        );
      };
      dispatch("pointerdown", position.startX);
      dispatch("pointermove", position.startX - 150);
      dispatch("pointerup", position.startX - 150);
    },
    { startX, y }
  );
  await expect(root).toHaveAttribute("data-open-side", "right");
  await expect(root).toHaveAttribute("data-offset", /^-\d+$/);

  await section.getByRole("button", { name: "删除" }).click();
  await expect(root).toHaveAttribute("data-open-side", "none");
  await expect(section.getByText("滑动操作：已删除")).toBeVisible();
  await expect(reveal).toBeFocused();

  await section.getByRole("button", { name: "更多操作" }).click();
  const menu = page.getByRole("dialog", { name: "滑动操作的等价菜单" });
  await expect(menu).toBeVisible();
  await menu.getByRole("button", { name: "归档" }).click();
  await expect(section.getByText("更多菜单：已归档")).toBeVisible();
});

test("snaps a non-modal floating panel and returns content to native scrolling", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "浮动面板" });
  const panel = section.locator('[data-meu-component="floating-panel"]');
  const handle = section.getByRole("button", { name: "调整浮动面板高度" });

  await expect(panel).toHaveAttribute("data-current-height", "160");
  await expect(section.getByText("页面背景保持可见")).toBeVisible();
  await handle.focus();
  await page.keyboard.press("ArrowUp");
  await expect(panel).toHaveAttribute("data-current-height", "300");
  await expect(section.getByText("面板高度：300px")).toBeVisible();

  await handle.evaluate((node) => {
    const dispatch = (type: string, clientY: number) => {
      node.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          button: 0,
          cancelable: true,
          clientX: 180,
          clientY,
          isPrimary: true,
          pointerId: 9,
          pointerType: "touch"
        })
      );
    };
    dispatch("pointerdown", 520);
    dispatch("pointermove", 250);
    dispatch("pointerup", 250);
  });
  await expect(panel).toHaveAttribute("data-current-height", "480");
  await expect(panel.locator("[data-content-drag='true']")).toHaveCount(0);
  await expect(section.getByRole("button", { name: "查看" })).toBeVisible();

  await handle.focus();
  await page.keyboard.press("Home");
  await expect(panel).toHaveAttribute("data-current-height", "160");
  await expect(panel.locator("[data-content-drag='true']")).toHaveCount(1);
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked");
});

test("keeps Cell actions, links and List semantics native", async ({ page }) => {
  const list = page.getByRole("list", { name: "店铺入口" });
  await expect(list).toBeVisible();
  await expect(list).toHaveAttribute("aria-describedby", "shop-entry-help");
  await expect(list.getByRole("listitem")).toHaveCount(5);

  const action = list.getByRole("button", { name: /商品搜索/ });
  await action.click();
  await expect(page.getByText("已打开商品搜索")).toBeVisible();

  await expect(list.getByRole("link", { name: /订单中心/ })).toHaveAttribute("href", "#orders");
  await expect(list.getByRole("button", { name: "停用店铺" })).toBeDisabled();

  const loadingAction = list.getByRole("button", { name: /同步库存/ });
  await expect(loadingAction).toBeDisabled();
  await expect(loadingAction).toHaveAttribute("aria-busy", "true");
  const loadingStatus = list.locator('[role="status"]');
  await expect(loadingStatus).toContainText("正在同步库存");
  await expect(loadingAction.locator('[role="status"]')).toHaveCount(0);
  await page.getByRole("button", { name: "完成库存同步" }).click();
  await expect(loadingAction).toBeEnabled();
  await expect(loadingAction).not.toHaveAttribute("aria-busy");
  await loadingAction.click();
  await expect(page.getByText("已打开库存同步")).toBeVisible();
});

test("renders atomic display components with native actions and fallbacks", async ({ page }) => {
  const section = page.getByRole("region", { name: "信息展示组件" });
  await expect(section).toBeVisible();
  await expect(section.getByText("99+")).toBeVisible();
  await expect(section.getByLabel("店铺在线")).toBeVisible();
  await expect(section.getByRole("img", { name: "林夏" })).toBeVisible();
  const fallbackAvatar = section.getByRole("img", { name: "备用图片头像" });
  await expect(fallbackAvatar).toBeVisible();
  await expect(fallbackAvatar.locator("xpath=..")).toHaveAttribute("data-source", "fallback");
  await expect(fallbackAvatar.locator("xpath=..")).toHaveAttribute("data-state", "loaded");

  const media = section.getByRole("img", { name: "绿色植物与商品包装插画" });
  await media.scrollIntoViewIfNeeded();
  await expect(media).toBeVisible();
  await expect(media.locator("xpath=..")).toHaveAttribute("data-state", "loaded");
  await expect(media).toHaveAttribute("srcset", /demo-media\.svg 2x/);
  await expect(media).toHaveCSS("object-position", "50% 35%");

  const fallbackMedia = section.getByRole("img", { name: "备用商品插画" });
  await expect(fallbackMedia).toBeVisible();
  await expect(fallbackMedia.locator("xpath=..")).toHaveAttribute("data-source", "fallback");
  await expect(fallbackMedia.locator("xpath=..")).toHaveAttribute("data-state", "loaded");

  await section.getByRole("button", { name: "仅看待处理" }).click();
  await expect(section.getByText("已筛选待处理商品")).toBeVisible();

  const promotionFilter = section.getByRole("button", { name: "促销中", exact: true });
  const removePromotion = section.getByRole("button", { name: "移除标签：促销中" });
  await expect(promotionFilter).toHaveAttribute("aria-pressed", "true");
  await promotionFilter.click();
  await expect(section.getByText("已启用促销筛选")).toBeVisible();
  await removePromotion.click();
  await expect(section.getByText("已移除促销标签")).toBeVisible();
  await expect(section.getByRole("button", { name: "促销中" })).toHaveCount(0);

  const expand = section.getByRole("button", { name: "展开完整商品说明" });
  await expect(expand).toBeVisible();
  await expand.click();
  await expect(section.getByRole("button", { name: "收起完整商品说明" })).toHaveAttribute(
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

test("uses native navigation actions, radio and tab segments, and controlled page dots", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "导航组件" });
  await section.getByRole("button", { name: "返回" }).click();
  await section.getByText("详情", { exact: true }).click();
  await expect(section.getByText("已触发返回 / 详情")).toBeVisible();

  const segmentedTabs = section.getByRole("tablist", { name: "预览面板" });
  const overviewTab = segmentedTabs.getByRole("tab", { name: "订单概况" });
  const metricsTab = segmentedTabs.getByRole("tab", { name: "经营指标" });
  await expect(overviewTab).toHaveAttribute("aria-selected", "true");
  await overviewTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(metricsTab).toBeFocused();
  await expect(metricsTab).toHaveAttribute("aria-selected", "true");
  await expect(section.getByRole("tabpanel", { name: "经营指标" })).toContainText("今日经营指标");

  const dots = section.getByRole("img", { name: "第 2 页，共 4 页" });
  await expect(dots).toHaveAttribute("data-variant", "line");
  await expect(dots.getByRole("button")).toHaveCount(0);

  const pagination = section.getByRole("group", { name: "商品页跳转" });
  const currentPage = pagination.getByRole("button", { name: "前往第 2 页，共 4 页" });
  await expect(currentPage).toHaveAttribute("aria-current", "page");
  await expect(currentPage).toHaveAttribute("tabindex", "0");
  await currentPage.focus();
  await page.keyboard.press("ArrowRight");
  const pageThree = pagination.getByRole("button", { name: "前往第 3 页，共 4 页" });
  await expect(pageThree).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(pageThree).toHaveAttribute("aria-current", "page");
  await expect(section.getByRole("img", { name: "第 3 页，共 4 页" })).toBeVisible();

  await section.getByRole("button", { name: "下一页" }).click();
  await expect(section.getByRole("img", { name: "第 4 页，共 4 页" })).toBeVisible();
});

test("connects tab panels, primary navigation and read-only progress semantics", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "导航组件" });
  const tabList = section.getByRole("tablist", { name: "订单内容" });
  const overview = tabList.getByRole("tab", { name: "概览" });
  const settings = tabList.getByRole("tab", { name: "设置" });
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await expect(tabList).toHaveAttribute("data-overflow-right", "true");
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(settings).toBeFocused();
  await expect(settings).toHaveAttribute("aria-selected", "true");
  await expect(section.getByRole("tabpanel", { name: "设置" })).toContainText("订单设置");

  await section.getByRole("button", { name: "外部切换售后" }).click();
  const afterSales = tabList.getByRole("tab", { name: "售后服务" });
  await expect(afterSales).toHaveAttribute("aria-selected", "true");
  await expect(afterSales).toHaveAttribute("tabindex", "0");
  await expect(section.getByRole("tabpanel", { name: "售后服务" })).toContainText("订单售后服务");

  const progress = section.getByRole("list", { name: "进度", exact: true });
  await expect(progress.locator("li")).toHaveCount(3);
  await expect(progress.locator('li[aria-current="step"]')).toContainText("商家发货");
  const statusPrefix = progress.getByText("进行中：", { exact: true });
  await expect(statusPrefix).toHaveCSS("position", "absolute");
  await expect(statusPrefix).toHaveCSS("width", "1px");

  const interactiveProgress = section.getByRole("list", {
    name: "可交互结算进度",
    exact: true
  });
  await expect(interactiveProgress).toHaveAttribute("data-indicator", "dot");
  await expect(interactiveProgress).toHaveAttribute("data-size", "small");
  await expect(interactiveProgress).toHaveAttribute("tabindex", "0");
  await expect(interactiveProgress.getByRole("button")).toHaveCount(4);
  await expect(interactiveProgress.getByRole("button", { name: /完成$/ })).toBeDisabled();
  expect(await interactiveProgress.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(
    true
  );
  await interactiveProgress.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => interactiveProgress.evaluate((node) => node.scrollLeft))
    .toBeGreaterThan(0);
  const paymentStep = interactiveProgress.getByRole("button", {
    name: "未开始：前往支付步骤"
  });
  await paymentStep.focus();
  await page.keyboard.press("Enter");
  await expect(section.getByText("当前结算步骤：3")).toBeVisible();
  await expect(interactiveProgress.locator('li[aria-current="step"]')).toContainText("支付");

  const rtlProgress = section.getByRole("list", { name: "RTL 可交互结算进度" });
  expect(await rtlProgress.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  await rtlProgress.focus();
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => rtlProgress.evaluate((node) => node.scrollLeft)).toBeLessThan(0);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => rtlProgress.evaluate((node) => node.scrollLeft)).toBe(0);

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
  await expect(progress).toHaveAttribute("aria-valuetext", "已上传 64%");
  await expect(progress).toHaveAttribute("aria-live", "polite");
  await expect(progress).toHaveAttribute("aria-atomic", "true");
  await section.getByRole("button", { name: "推进上传" }).click();
  await expect(progress).toHaveAttribute("aria-valuenow", "76");
  await expect(progress).toHaveAttribute("aria-valuetext", "已上传 76%");

  const reducedProgress = section.getByRole("progressbar", { name: "低动态 RTL 同步" });
  await expect(reducedProgress).not.toHaveAttribute("aria-valuenow", /.+/);
  await expect(reducedProgress).toHaveAttribute("aria-live", "polite");
  const reducedProvider = reducedProgress.locator(
    'xpath=ancestor::*[@data-meu-component="config-provider"][1]'
  );
  await expect(reducedProvider).toHaveAttribute("dir", "rtl");
  await expect(reducedProvider).toHaveAttribute("data-meu-motion", "reduced");
  const reducedFill = reducedProgress.locator('[aria-hidden="true"] > div');
  await expect(reducedFill).toHaveCSS("animation-name", "none");
  await expect(reducedFill).toHaveCSS("transition-duration", "0s");
  const rtlOrigin = await reducedFill.evaluate((node) => {
    const style = window.getComputedStyle(node);
    return {
      originX: Number.parseFloat(style.transformOrigin),
      width: node.getBoundingClientRect().width
    };
  });
  expect(rtlOrigin.originX).toBeCloseTo(rtlOrigin.width, 0);

  const loading = section.getByLabel("订单摘要加载中");
  await expect(loading).toHaveAttribute("aria-busy", "true");
  const skeletons = loading.locator('[data-meu-component="skeleton"]');
  await expect(skeletons).toHaveCount(2);
  await expect(skeletons.nth(0)).toHaveAttribute("aria-hidden", "true");
  await expect(skeletons.nth(1)).toHaveAttribute("aria-hidden", "true");
  await expect(
    loading.locator('xpath=ancestor::*[@data-meu-component="config-provider"][1]')
  ).toHaveAttribute("data-meu-motion", "reduced");
  await expect
    .poll(() =>
      skeletons.nth(0).evaluate((node) => window.getComputedStyle(node, "::after").animationName)
    )
    .toBe("none");

  const pending = section.getByRole("status", { name: "等待库存确认" });
  const waitingDot = pending.locator('[aria-hidden="true"] span span').first();
  await expect(waitingDot).toHaveCSS("animation-name", "none");

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
  const popupLayer = page.locator('[data-meu-overlay-layer="popup"]');
  await expect(popupLayer).toHaveAttribute("dir", "rtl");
  await expect(popupLayer).toHaveAttribute("data-meu-motion", "reduced");
  await expect(popup).toHaveCSS("transition-duration", "0s");
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");

  const close = popup.getByRole("button", { name: "关闭" });
  const confirm = popup.getByRole("button", { name: "确认标准配送" });
  const [popupBox, closeBox] = await Promise.all([popup.boundingBox(), close.boundingBox()]);
  expect(popupBox).not.toBeNull();
  expect(closeBox).not.toBeNull();
  expect(
    popupBox && closeBox ? closeBox.x + closeBox.width / 2 < popupBox.x + popupBox.width / 2 : false
  ).toBe(true);
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
  const close = page.getByRole("button", { name: "关闭" });
  const layer = page.locator('[data-meu-overlay-layer="bottom-sheet"]');
  await expect(sheet).toBeVisible();
  await expect(sheet).toHaveAttribute("aria-modal", "true");
  await expect(sheet).toHaveAttribute("data-snap-point", "0.9");
  await expect(layer).toHaveAttribute("dir", "rtl");
  await expect(layer).toHaveAttribute("data-meu-motion", "reduced");
  await expect(sheet).toHaveCSS("transition-duration", "0s");
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");
  await expect(handle).toBeFocused();

  const [initialSheetBox, closeBox] = await Promise.all([sheet.boundingBox(), close.boundingBox()]);
  expect(initialSheetBox).not.toBeNull();
  expect(closeBox).not.toBeNull();
  expect(
    initialSheetBox && closeBox
      ? closeBox.x + closeBox.width / 2 < initialSheetBox.x + initialSheetBox.width / 2
      : false
  ).toBe(true);

  await page.keyboard.press("Home");
  await expect(sheet).toHaveAttribute("data-snap-point", "0.35");
  await page.keyboard.press("End");
  await expect(sheet).toHaveAttribute("data-snap-point", "0.9");
  await page.keyboard.press("Home");
  await expect(sheet).toHaveAttribute("data-snap-point", "0.35");
  await page.keyboard.press("ArrowUp");
  await expect(sheet).toHaveAttribute("data-snap-point", "0.6");
  const showToast = sheet.getByRole("button", { name: "在面板中显示 Toast" });
  await showToast.focus();
  await expect(showToast).toBeFocused();
  await page.keyboard.press("Enter");
  const toastAction = page.getByRole("button", { name: "撤销筛选" });
  await expect(toastAction).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(toastAction).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(handle).toBeFocused();
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
  await toastAction.click();
  await expect(section.getByText("BottomSheet Toast：已撤销")).toBeVisible();
  await expect(page.locator('[data-meu-component="toast"]')).toBeHidden();
});

test("runs ActionMenu actions with danger confirmation", async ({ page }) => {
  const section = page.getByRole("region", { name: "浮层基础组件" });
  const trigger = section.getByRole("button", { name: "打开订单操作菜单" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const menu = page.locator('[role="dialog"]').filter({
    has: page.locator('[data-meu-component="action-menu"]')
  });
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
  await expect(
    menu.getByRole("button", { name: "永久删除订单", includeHidden: true })
  ).toBeDisabled();
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

test("rebuilds CascadePicker paths and commits only the confirmed branch", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "配送地区" });
  await expect(trigger).toContainText("浙江省 / 杭州市 / 西湖区");
  await trigger.click();

  let picker = page.getByRole("dialog", { name: "配送地区" });
  await expect(picker.getByRole("listbox")).toHaveCount(3);
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");
  await picker.getByRole("option", { name: "江苏省" }).click();
  await expect(picker.getByRole("option", { name: "南京市" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(picker.getByRole("option", { name: "玄武区" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await picker.getByRole("button", { name: "取消" }).click();
  await expect(picker).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("浙江省 / 杭州市 / 西湖区");

  await trigger.click();
  picker = page.getByRole("dialog", { name: "配送地区" });
  await expect(picker.getByRole("option", { name: "浙江省" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await picker.getByRole("option", { name: "江苏省" }).click();
  await picker.getByRole("button", { name: "确定" }).click();
  await expect(picker).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("江苏省 / 南京市 / 玄武区");
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");
});

test("normalizes DatePicker dates and commits only the confirmed draft", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "送达日期" });
  await expect(trigger).toContainText("2026-08-28");
  await trigger.click();

  let picker = page.getByRole("dialog", { name: "送达日期" });
  await expect(picker.getByRole("listbox")).toHaveCount(3);
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");
  await picker.getByRole("option", { name: "29日" }).click();
  await picker.getByRole("button", { name: "取消" }).click();
  await expect(picker).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("2026-08-28");

  await trigger.click();
  picker = page.getByRole("dialog", { name: "送达日期" });
  await expect(picker.getByRole("option", { name: "28日" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await picker.getByRole("option", { name: "29日" }).click();
  await picker.getByRole("button", { name: "确定" }).click();
  await expect(picker).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("2026-08-29");
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");
});

test("rolls back DateRangePicker drafts and commits a complete preset", async ({ page }) => {
  const form = page.locator('form.integration-form[data-meu-component="form"]');
  await expect
    .poll(() =>
      form.evaluate((node) => new FormData(node as HTMLFormElement).getAll("deliveryWindow"))
    )
    .toEqual(['["2026-08-08","2026-08-18"]']);
  const trigger = page.getByRole("button", { name: "配送日期范围" });
  await expect(trigger).toContainText("2026-08-08 – 2026-08-18");
  await trigger.click();

  let picker = page.getByRole("dialog", { name: "配送日期范围" });
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");
  await picker.getByRole("button", { name: /^2026-08-12/ }).click();
  await expect(picker.getByRole("button", { name: "确定" })).toBeDisabled();
  await picker.getByRole("button", { name: /^2026-08-15/ }).click();
  await expect(picker.getByRole("button", { name: "确定" })).toBeEnabled();
  await picker.getByRole("button", { name: "取消" }).click();
  await expect(picker).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("2026-08-08 – 2026-08-18");

  await trigger.click();
  picker = page.getByRole("dialog", { name: "配送日期范围" });
  await picker.getByRole("button", { name: "未来 7 天" }).click();
  await expect(picker.getByRole("button", { name: /^2026-08-10/ })).toHaveAttribute(
    "data-range-start",
    "true"
  );
  await picker.getByRole("button", { name: "确定" }).click();
  await expect(picker).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("2026-08-10 – 2026-08-16");
  await expect
    .poll(() =>
      form.evaluate((node) => new FormData(node as HTMLFormElement).getAll("deliveryWindow"))
    )
    .toEqual(['["2026-08-10","2026-08-16"]']);
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");
});

test("maps TimePicker values and commits only the confirmed draft", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "送达时间" });
  await expect(trigger).toContainText("10:30");
  await trigger.click();

  let picker = page.getByRole("dialog", { name: "送达时间" });
  await expect(picker.getByRole("listbox")).toHaveCount(2);
  await expect(page.locator("body")).toHaveAttribute("data-meu-scroll-locked", "true");
  await picker.getByRole("option", { name: "45分" }).click();
  await picker.getByRole("button", { name: "取消" }).click();
  await expect(picker).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("10:30");

  await trigger.click();
  picker = page.getByRole("dialog", { name: "送达时间" });
  await expect(picker.getByRole("option", { name: "30分" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await picker.getByRole("option", { name: "45分" }).click();
  await picker.getByRole("button", { name: "确定" }).click();
  await expect(picker).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("10:45");
  await expect(page.locator("body")).not.toHaveAttribute("data-meu-scroll-locked", "true");
});

test("binds Calendar multiple dates and preserves roving keyboard focus", async ({ page }) => {
  const calendar = page.getByRole("group", { name: "活动日期" });
  const august8 = calendar.getByRole("button", { name: /^2026-08-08/ });
  const august10 = calendar.getByRole("button", { name: /^2026-08-10/ });
  const august11 = calendar.getByRole("button", { name: /^2026-08-11/ });

  await expect(calendar).toHaveAttribute("data-selection-mode", "multiple");
  await expect(calendar.getByRole("gridcell")).toHaveCount(42);
  await expect(august8).toHaveAttribute("aria-pressed", "true");
  await expect(august10).toHaveAttribute("aria-pressed", "false");

  await august10.click();
  await expect(august10).toHaveAttribute("aria-pressed", "true");
  await august8.click();
  await expect(august8).toHaveAttribute("aria-pressed", "false");

  await august10.focus();
  await page.keyboard.press("ArrowRight");
  await expect(august11).toBeFocused();
});

test("positions and dismisses a non-modal Popover without locking scroll", async ({
  browserName,
  page
}) => {
  const section = page.getByRole("region", { name: "浮层基础组件" });
  const trigger = section.getByRole("button", { name: "打开订单快捷操作" });
  await trigger.click();

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

  await section.getByRole("button", { name: "显示溢出 Toast" }).click();
  await expect(section.getByText("Toast 容量：已拒绝溢出消息")).toBeVisible();
  await expect(page.getByText("不应进入队列的消息")).toHaveCount(0);

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

test("preserves blocked controls, standalone radio sync and read-only form values", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "基础控件边界验证" });
  const loadingButton = section.getByRole("button", { name: "正在保存" });
  const loadingSwitch = section.getByRole("switch", { name: "保存中的通知" });

  await expect(loadingButton).toBeDisabled();
  await expect(loadingButton).toHaveAttribute("aria-busy", "true");
  await expect(loadingSwitch).toBeChecked();
  await expect(loadingSwitch).toHaveAttribute("aria-busy", "true");
  await expect(loadingSwitch).toHaveAttribute("aria-disabled", "true");
  await loadingSwitch.evaluate((element) => (element as HTMLInputElement).click());
  await expect(loadingSwitch).toBeChecked();
  await expect(section.getByText("被阻止点击次数：0")).toBeVisible();

  const economy = section.getByRole("radio", { name: "经济配送（独立）" });
  const priority = section.getByRole("radio", { name: "优先配送（独立）" });
  await expect(economy).toBeChecked();
  await section.getByText("优先配送（独立）", { exact: true }).click();
  await expect(priority).toBeChecked();
  await expect(economy).not.toBeChecked();
  await expect(section.getByText("独立 Radio 变化次数：1")).toBeVisible();

  const readOnlyVolume = section.getByRole("meter", { name: "只读音量" });
  await expect(readOnlyVolume).toHaveAttribute("aria-valuenow", "40");
  const describedByValue = await readOnlyVolume.getAttribute("aria-describedby");
  const describedBy = describedByValue ? describedByValue.split(/\s+/) : [];
  expect(describedBy.length).toBeGreaterThanOrEqual(2);
  await expect(page.locator("#readonly-volume-external")).toHaveText("外部只读音量说明");

  await section.getByRole("button", { name: "检查基础控件提交值" }).click();
  await expect(
    section.getByText("busySwitch:on / standaloneRadio:priority / readonlyVolume:40", {
      exact: true
    })
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

  await page.getByLabel("店铺名称").fill("喵呜体验店");
  await page.getByRole("button", { name: "保存店铺" }).click();
  await expect(
    page.getByText(
      "已保存录入：quantity:2 / volume:41 / rating:4 / picker:today,9 / cascade:zhejiang,hangzhou,xihu / date:2026-08-28 / range:2026-08-08–2026-08-18 / time:10:30 / calendar:2026-08-08,2026-08-18 / selector:fast / segmented:card"
    )
  ).toBeVisible();
});

test("drags slider and rate with browser pointer events and resets cancelled sessions", async ({
  page
}) => {
  const section = page.getByRole("region", { name: "滑块与评分手势验证" });
  const volume = section.getByRole("slider", { name: "提示音量" });
  await volume.scrollIntoViewIfNeeded();
  const volumeBox = await volume.boundingBox();
  if (!volumeBox) throw new Error("Expected Slider pointer bounds");

  await page.mouse.move(volumeBox.x + volumeBox.width * 0.4, volumeBox.y + volumeBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(volumeBox.x + volumeBox.width * 0.8, volumeBox.y + volumeBox.height / 2, {
    steps: 6
  });
  await page.mouse.up();

  const draggedVolume = Number(await volume.inputValue());
  expect(draggedVolume).toBeGreaterThanOrEqual(75);
  await expect(section.getByText(`滑块当前值：${draggedVolume}`)).toBeVisible();
  await expect(section.getByText("滑块完成次数：1")).toBeVisible();
  await expect(section.getByText("滑块 pointerdown：trusted")).toBeVisible();

  await page.mouse.move(volumeBox.x + volumeBox.width * 0.6, volumeBox.y + volumeBox.height / 2);
  await page.mouse.down();
  await volume.dispatchEvent("pointercancel", {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: "mouse"
  });
  await page.mouse.up();
  await expect(section.getByText("滑块取消次数：1")).toBeVisible();
  await expect(section.getByText("滑块 pointercancel：synthetic")).toBeVisible();
  await expect(section.getByText("滑块完成次数：1")).toBeVisible();

  const rating = section.getByRole("slider", { name: "服务评分" });
  await rating.scrollIntoViewIfNeeded();
  const ratingBox = await rating.boundingBox();
  if (!ratingBox) throw new Error("Expected Rate pointer bounds");

  await page.mouse.move(ratingBox.x + ratingBox.width * 0.2, ratingBox.y + ratingBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(ratingBox.x + ratingBox.width * 0.8, ratingBox.y + ratingBox.height / 2, {
    steps: 6
  });
  await page.mouse.up();
  await expect(rating).toHaveValue("4");
  await expect(section.getByText("评分当前值：4")).toBeVisible();
  await expect(section.getByText("评分 pointerdown：trusted")).toBeVisible();

  await rating.click({ position: { x: ratingBox.width * 0.8, y: ratingBox.height / 2 } });
  await expect(rating).toHaveValue("0");
  await expect(section.getByText("评分当前值：0")).toBeVisible();

  await page.mouse.move(ratingBox.x + ratingBox.width * 0.4, ratingBox.y + ratingBox.height / 2);
  await page.mouse.down();
  await rating.dispatchEvent("pointercancel", {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: "mouse"
  });
  await page.mouse.up();
  await expect(section.getByText("评分取消次数：1")).toBeVisible();
  await expect(section.getByText("评分 pointercancel：synthetic")).toBeVisible();
});

test("switches theme and preserves mobile touch targets", async ({ page }) => {
  const provider = page.locator('[data-meu-component="config-provider"]').first();
  await page.getByRole("button", { name: "切换主题" }).click();
  await expect(provider).toHaveAttribute("data-meu-theme", "dark");

  const undersizedButtons = await page.locator("button").evaluateAll((buttons) =>
    buttons
      .map((button) => {
        const text = button.textContent;
        return {
          height: button.getBoundingClientRect().height,
          label: button.getAttribute("aria-label") || (text ? text.trim() : "") || "unnamed"
        };
      })
      // WebKit can report a transformed 44px target as 43.999...px.
      .filter((button) => button.height < 43.99)
  );
  expect(undersizedButtons).toEqual([]);

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
