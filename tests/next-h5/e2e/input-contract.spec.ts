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
  await page.goto("/input-contract");
  await expect(page.locator('[data-hydrated="true"]')).toBeAttached();
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

test("follows a late external form owner and respects cancelled reset", async ({ page }) => {
  const textInput = page.getByRole("textbox", { name: "外部表单姓名" });
  const search = page.getByRole("searchbox", { name: "外部表单搜索" });
  const area = page.getByRole("textbox", { name: "外部表单说明" });

  await textInput.fill("changed-name");
  await search.fill("changed-query");
  await area.fill("changed-description");
  await page.getByRole("button", { name: "挂载外部表单" }).click();

  await page.getByRole("button", { name: "重置外部表单" }).click();
  await expect(textInput).toHaveValue("changed-name");
  await expect(search).toHaveValue("changed-query");
  await expect(area).toHaveValue("changed-description");

  await page.getByRole("button", { name: "允许下一次重置" }).click();
  await page.getByRole("button", { name: "重置外部表单" }).click();
  await expect(textInput).toHaveValue("text-default");
  await expect(search).toHaveValue("search-default");
  await expect(area).toHaveValue("area-default");

  await page.getByRole("button", { name: "提交外部表单" }).click();
  await expect(page.getByTestId("external-form-data")).toHaveText(
    JSON.stringify({ name: "text-default", query: "search-default", description: "area-default" })
  );
});

test("keeps rejected controlled values and transfers clear focus into loading", async ({
  page
}) => {
  const textInput = page.getByRole("textbox", { name: "受控拒绝单行输入" });
  const search = page.getByRole("searchbox", { name: "受控拒绝搜索" });
  const area = page.getByRole("textbox", { name: "受控拒绝多行输入" });

  await textInput.fill("rejected-text");
  await search.fill("rejected-search");
  await area.fill("rejected-area");
  await expect(textInput).toHaveValue("text-locked");
  await expect(search).toHaveValue("search-locked");
  await expect(area).toHaveValue("area-locked");
  await expect(page.getByTestId("controlled-rejections")).toHaveText("1:1:1");

  const loadingInput = page.getByRole("textbox", { name: "loading 焦点输入" });
  await page.getByRole("button", { name: "清除输入" }).last().focus();
  await page.getByRole("button", { name: "开始单行加载" }).click();
  await expect(page.getByRole("status", { name: "正在加载" })).toBeVisible();
  await expect(loadingInput).toBeFocused();
});

test("keeps one search owner across IME, repeat, loading and cancellation", async ({ page }) => {
  const search = page.getByRole("searchbox", { name: "请求搜索" });
  const metrics = page.getByTestId("search-request-metrics");

  await search.press("Enter");
  await expect(metrics).toHaveText("started:1;aborted:0;completed:0;change:none;search:enter");

  await search.fill("new orders");
  await expect(metrics).toHaveText("started:1;aborted:1;completed:0;change:input;search:enter");

  await search.dispatchEvent("compositionstart", { data: "新" });
  await search.press("Enter");
  await expect(metrics).toHaveText("started:1;aborted:1;completed:0;change:input;search:enter");
  await search.dispatchEvent("compositionend", { data: "新" });
  await search.press("Enter");
  await expect(metrics).toHaveText("started:2;aborted:1;completed:0;change:input;search:enter");

  await search.dispatchEvent("keydown", { key: "Enter", repeat: true });
  await expect(metrics).toHaveText("started:2;aborted:1;completed:0;change:input;search:enter");
  await page.getByRole("button", { name: "完成当前搜索" }).click();
  await expect(metrics).toHaveText("started:2;aborted:1;completed:1;change:input;search:enter");

  await page.getByRole("searchbox", { name: "原生提交搜索" }).press("Enter");
  await expect(page.getByTestId("native-submit-count")).toHaveText("1");
});

test("preserves paste input details and remeasures autosize after viewport change", async ({
  page
}) => {
  const area = page.getByRole("textbox", { name: "粘贴自动高度说明" });
  const pasted = Array.from({ length: 5 }, () => "responsive mobile textarea content").join(" ");

  await area.evaluate((element, value) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
    if (descriptor && descriptor.set) descriptor.set.call(element, value);
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: value,
        inputType: "insertFromPaste"
      })
    );
  }, pasted);

  await expect(area).toHaveValue(pasted);
  await expect(page.getByTestId("paste-metrics")).toHaveText("inputType:insertFromPaste;changes:1");
  const initialBox = await area.boundingBox();
  expect(initialBox).not.toBeNull();
  if (!initialBox) throw new Error("Expected autosize textarea geometry");
  await page.getByRole("button", { name: "模拟 viewport 收窄" }).click();
  await expect
    .poll(() => area.evaluate((element) => element.getBoundingClientRect().width))
    .toBeLessThan(initialBox.width);
  await expect
    .poll(() => area.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThan(initialBox.height);
});
