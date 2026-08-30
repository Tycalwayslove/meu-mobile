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
  await page.goto("/portal-cross-document");
  await expect(page.getByRole("heading", { name: "Portal cross-document contract" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Portal cross-document scenario" })
  ).toHaveAttribute("data-hydrated", "true");
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

test("keeps container ownership, Provider context and event boundaries in a real iframe", async ({
  page
}) => {
  const serverMarkup = await (await page.request.get("/portal-cross-document")).text();
  expect(serverMarkup).toContain('data-testid="iframe-portal-action"');
  expect(serverMarkup).toContain("provider-preserved");

  const frameElement = page.locator('iframe[title="Portal owner document"]');
  const frame = page.frameLocator('iframe[title="Portal owner document"]');
  const firstTarget = frame.getByRole("main", { name: "First iframe Portal target" });
  const secondTarget = frame.getByRole("main", { name: "Second iframe Portal target" });
  const action = frame.getByRole("button", { name: "Portal action · provider-preserved" });

  await expect(firstTarget.getByTestId("iframe-portal-action")).toHaveCount(1);
  await expect(secondTarget.getByTestId("iframe-portal-action")).toHaveCount(0);
  await expect(action.getByTestId("portal-provider-value")).toHaveText("provider-preserved");
  expect(
    await action.evaluate((node) => {
      const ownerWindow = node.ownerDocument.defaultView;
      const frame = ownerWindow ? (ownerWindow.frameElement as HTMLIFrameElement | null) : null;
      return Boolean(frame && node.ownerDocument === frame.contentDocument);
    })
  ).toBe(true);

  await action.click();
  await expect(page.getByTestId("portal-click-count")).toHaveText("1");
  await expect(page.getByTestId("logical-click-count")).toHaveText("1");
  await expect(page.getByTestId("frame-native-click-count")).toHaveText("1");
  await expect(page.getByTestId("top-native-click-count")).toHaveText("0");

  await action.focus();
  await expect(action).toBeFocused();
  expect(await frameElement.evaluate((node) => node.ownerDocument.activeElement === node)).toBe(
    true
  );

  await page.getByRole("button", { name: "Switch Portal target" }).click();
  await expect(firstTarget.getByTestId("iframe-portal-action")).toHaveCount(0);
  await expect(secondTarget.getByTestId("iframe-portal-action")).toHaveCount(1);
  await expect(frame.getByTestId("iframe-portal-action")).toHaveCount(1);
});

test("removes only Portal children on unmount and can mount into the retained iframe target", async ({
  page
}) => {
  const frame = page.frameLocator('iframe[title="Portal owner document"]');
  const firstTarget = frame.getByRole("main", { name: "First iframe Portal target" });
  const action = frame.getByTestId("iframe-portal-action");

  await expect(action).toHaveCount(1);
  await action.focus();
  await expect(action).toBeFocused();
  await page.getByRole("button", { name: "Unmount Portal" }).click();

  await expect(action).toHaveCount(0);
  await expect(firstTarget).toHaveCount(1);
  expect(
    await firstTarget.evaluate(
      (node) => node.ownerDocument.activeElement === node.ownerDocument.body
    )
  ).toBe(true);

  await page.getByRole("button", { name: "Mount Portal" }).click();
  await expect(firstTarget.getByTestId("iframe-portal-action")).toHaveCount(1);
  await expect(frame.getByTestId("portal-provider-value")).toHaveText("provider-preserved");
});
