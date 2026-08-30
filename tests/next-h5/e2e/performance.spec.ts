import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const runtimeErrorsByPage = new WeakMap<Page, string[]>();

const imageSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160">
    <rect width="320" height="160" fill="#e7f4ef" />
    <circle cx="160" cy="80" r="36" fill="#087f5b" />
  </svg>
`;

test.beforeEach(async ({ page }) => {
  const runtimeErrors: string[] = [];
  runtimeErrorsByPage.set(page, runtimeErrors);
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.route("**/performance-image.svg?**", async (route) => {
    await route.fulfill({ body: imageSvg, contentType: "image/svg+xml", status: 200 });
  });
  await page.route("**/performance-page?**", async (route) => {
    await route.fulfill({ body: JSON.stringify({ ok: true }), contentType: "application/json" });
  });
  await page.route("**/performance-upload?**", async (route) => {
    await route.fulfill({ body: JSON.stringify({ ok: true }), contentType: "application/json" });
  });
  await page.goto("/performance");
  await expect(page.locator('[data-hydrated="true"]')).toBeAttached();
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

test("keeps ten thousand rows bounded and jumps within budget", async ({ page }) => {
  const scenario = page.locator('section[aria-label="运行时性能场景"]');
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
  const scenario = page.locator('section[aria-label="运行时性能场景"]');
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

test("keeps virtual rows bounded through accelerated bidirectional scrolling", async ({ page }) => {
  const list = page.getByRole("list", { name: "万条性能订单" });
  const result = await list.evaluate(async (node) => {
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const startedAt = performance.now();
    let maximumRendered = 0;
    for (let index = 0; index < 40; index += 1) {
      node.scrollTop = index % 2 === 0 ? node.scrollHeight : 0;
      await frame();
      await frame();
      maximumRendered = Math.max(
        maximumRendered,
        Number(node.getAttribute("data-rendered-count") || 0)
      );
    }
    return { elapsed: performance.now() - startedAt, maximumRendered };
  });

  expect(result.elapsed).toBeLessThanOrEqual(5_000);
  expect(result.maximumRendered).toBeGreaterThan(0);
  expect(result.maximumRendered).toBeLessThanOrEqual(20);
  expect(Number(await list.getAttribute("data-rendered-count"))).toBeLessThanOrEqual(20);
});

test("recovers SwipeActions and FloatingPanel after repeated pointer cancellation", async ({
  page
}) => {
  const swipe = page
    .getByRole("region", { name: "滑动操作性能" })
    .locator('[data-meu-component="swipe-actions"]');
  const floating = page.locator('[data-meu-component="floating-panel"]');
  const floatingHandle = page.getByRole("button", { name: "调整浮动面板高度" });

  const elapsed = await page.evaluate(
    ({ floatingHandleNode, swipeNode }) => {
      const startedAt = performance.now();
      const dispatch = (
        node: Element,
        type: string,
        pointerId: number,
        clientX: number,
        clientY: number
      ) => {
        node.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            button: 0,
            cancelable: true,
            clientX,
            clientY,
            isPrimary: true,
            pointerId,
            pointerType: "touch"
          })
        );
      };
      for (let index = 0; index < 40; index += 1) {
        dispatch(swipeNode, "pointerdown", index + 1, 360, 40);
        dispatch(swipeNode, "pointermove", index + 1, 300, 41);
        dispatch(swipeNode, "pointercancel", index + 1, 300, 41);
        dispatch(floatingHandleNode, "pointerdown", index + 101, 190, 420);
        dispatch(floatingHandleNode, "pointermove", index + 101, 190, 360);
        dispatch(floatingHandleNode, "pointercancel", index + 101, 190, 360);
      }
      dispatch(swipeNode, "pointerdown", 999, 360, 40);
      dispatch(swipeNode, "pointermove", 999, 180, 40);
      dispatch(swipeNode, "pointerup", 999, 180, 40);
      dispatch(floatingHandleNode, "pointerdown", 1_000, 190, 420);
      dispatch(floatingHandleNode, "pointermove", 1_000, 190, 180);
      dispatch(floatingHandleNode, "pointerup", 1_000, 190, 180);
      return performance.now() - startedAt;
    },
    {
      floatingHandleNode: await floatingHandle.elementHandle(),
      swipeNode: await swipe.elementHandle()
    }
  );

  expect(elapsed).toBeLessThanOrEqual(1_000);
  await expect(swipe).toHaveAttribute("data-open-side", "right");
  await expect(floating).not.toHaveAttribute("data-dragging", "true");
  await expect(floating).not.toHaveAttribute("data-current-height", "160");
});

test("recovers image and pagination requests after deterministic failures", async ({ page }) => {
  await page.unroute("**/performance-image.svg?**");
  await page.unroute("**/performance-page?**");

  await page.route("**/performance-image.svg?**", async (route) => {
    const attempt = new URL(route.request().url()).searchParams.get("attempt");
    await route.fulfill(
      attempt === "1"
        ? { body: "not-an-image", contentType: "image/svg+xml", status: 200 }
        : { body: imageSvg, contentType: "image/svg+xml", status: 200 }
    );
  });
  let pageAttempts = 0;
  await page.route("**/performance-page?**", async (route) => {
    pageAttempts += 1;
    await route.fulfill({
      body: JSON.stringify({ ok: pageAttempts > 1 }),
      contentType: "application/json",
      status: 200
    });
  });

  await page.getByRole("button", { name: "重试网络图片" }).click();
  await expect(page.getByText("图片请求失败 1")).toBeVisible();
  await page.getByRole("button", { name: "重试网络图片" }).click();
  await expect(page.getByText("图片请求成功 2")).toBeVisible();

  await page.getByRole("button", { name: "加载更多" }).click();
  await expect(page.getByText("分页请求失败", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "重试", exact: true }).click();
  await expect(page.getByText("分页请求成功 retry")).toBeVisible();
  await expect(page.getByText("网络分页 2", { exact: true })).toBeVisible();
  expect(pageAttempts).toBe(2);
});

test("retries a failed upload and aborts a pending upload without stale completion", async ({
  page
}) => {
  await page.unroute("**/performance-upload?**");
  let retryAttempts = 0;
  await page.route("**/performance-upload?**", async (route) => {
    const name = new URL(route.request().url()).searchParams.get("name");
    if (name === "retry.png") {
      retryAttempts += 1;
      await route.fulfill({
        body: JSON.stringify({ ok: retryAttempts > 1 }),
        contentType: "application/json",
        status: 200
      });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      await route.fulfill({ body: JSON.stringify({ ok: true }), contentType: "application/json" });
    } catch {
      // The component is expected to abort this request before the delayed response is fulfilled.
    }
  });

  const input = page.getByRole("group", { name: "网络图片上传" }).locator('input[type="file"]');
  await input.setInputFiles({
    buffer: Buffer.from("retry-image"),
    mimeType: "image/png",
    name: "retry.png"
  });
  await expect(page.getByText("上传队列 1 error")).toBeVisible();
  await page.getByRole("button", { name: "重试 retry.png", exact: true }).click();
  await expect(page.getByText("上传请求成功 retry.png")).toBeVisible();
  await expect(page.getByText("上传队列 0", { exact: true })).toBeVisible();
  expect(retryAttempts).toBe(2);

  await input.setInputFiles({
    buffer: Buffer.from("slow-image"),
    mimeType: "image/png",
    name: "slow.png"
  });
  await expect(page.getByText("上传队列 1 uploading")).toBeVisible();
  await page.getByRole("button", { name: "删除 slow.png" }).click();
  await expect(page.getByText("上传队列 0", { exact: true })).toBeVisible();
  await page.waitForTimeout(700);
  await expect(page.getByText("上传请求成功 slow.png")).toHaveCount(0);
});
