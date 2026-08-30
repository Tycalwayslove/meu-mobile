import { expect, test } from "@playwright/test";

const cases = [
  ["virtual-list", '[data-meu-component="virtual-list"]'],
  ["tree-select", '[data-meu-component="tree-select"]'],
  ["popup", '[data-meu-overlay-layer="popup"]'],
  ["bottom-sheet", '[data-meu-overlay-layer="bottom-sheet"]'],
  ["popover", '[data-meu-component="popover"]'],
  ["image-viewer", '[data-meu-overlay-layer="image-viewer"]'],
  ["floating-panel", '[data-meu-component="floating-panel"]'],
  ["swipe-actions", '[data-meu-component="swipe-actions"]'],
  ["form", '[data-meu-component="form"]']
] as const;

test("hydrates measurement, portal and gesture boundaries without runtime errors", async ({
  page
}) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  for (const [kind, selector] of cases) {
    await test.step(kind, async () => {
      runtimeErrors.length = 0;
      await page.goto(`/hydration?case=${kind}`);
      const scenario = page.locator('section[aria-label="专项 Hydration 场景"]');
      await expect(scenario).toHaveAttribute("data-hydrated", "true");
      await expect(page.locator(selector)).toBeAttached();
      if (kind === "form") {
        const input = page.getByRole("textbox", { name: "Hydration form name" });
        const provider = page.locator('[data-meu-component="config-provider"]');
        await expect(provider).toHaveAttribute("dir", "rtl");
        await expect(provider).toHaveAttribute("data-meu-motion", "reduced");
        await expect(input).toHaveCSS("direction", "rtl");
        await expect(input).toHaveValue("Server default");
        await page.getByRole("button", { name: "Apply client default" }).click();
        await expect(input).toHaveValue("Client default");
        await input.fill("Temporary edit");
        await page.getByRole("button", { name: "Reset hydration form" }).click();
        await expect(input).toHaveValue("Client default");
      }
      expect(runtimeErrors, `${kind} runtime errors`).toEqual([]);
    });
  }
});

test("hydrates TreeSelect from complete SSR into a semantic virtual tree and aborts stale loads", async ({
  page,
  request
}) => {
  const response = await request.get("/hydration?case=tree-select");
  expect(response.ok()).toBe(true);
  const serverHtml = await response.text();
  expect(serverHtml.match(/role="treeitem"/g)).toHaveLength(122);
  expect(serverHtml).toContain("Hydration remote branch");
  expect(serverHtml).toContain('aria-level="2"');

  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hydration?case=tree-select");
  await expect(page.locator('[data-case="tree-select"]')).toHaveAttribute("data-hydrated", "true");

  const tree = page.getByRole("tree", { name: "Hydration tree" });
  await expect(tree).toBeVisible();
  const renderedCount = await tree.getByRole("treeitem").count();
  expect(renderedCount).toBeGreaterThan(0);
  expect(renderedCount).toBeLessThanOrEqual(12);

  const remote = tree.getByRole("treeitem", { name: "Hydration remote branch" });
  await expect(remote).toHaveAttribute("aria-level", "2");
  await expect(remote).toHaveAttribute("aria-posinset", "1");
  await expect(remote).toHaveAttribute("aria-setsize", "1");
  await remote.focus();
  await remote.press("ArrowRight");
  await expect(remote).toHaveAttribute("aria-expanded", "true");
  await expect(remote).toHaveAttribute("aria-busy", "true");
  const loadingStatus = page.getByRole("status", { name: "正在加载子选项" });
  await expect(loadingStatus).toBeVisible();
  await expect(loadingStatus).toHaveCSS("animation-name", "none");
  await expect(remote.locator("[data-meu-tree-expand] > span")).toHaveCSS(
    "transition-duration",
    "0s"
  );
  await remote.press("ArrowLeft");
  await expect(page.locator('output[aria-label="Hydration tree async status"]')).toHaveText(
    "aborted"
  );
  await expect(remote).not.toHaveAttribute("aria-busy", "true");
  await expect(remote).toBeFocused();

  await remote.press("ArrowRight");
  const remoteChild = tree.getByRole("treeitem", { name: "Hydration remote child" });
  await expect(remoteChild).toBeVisible();
  await expect(remoteChild).toHaveAttribute("aria-level", "3");
  await expect(remoteChild).toHaveAttribute("aria-posinset", "1");
  await expect(remoteChild).toHaveAttribute("aria-setsize", "1");

  await remote.press("End");
  const lastRoot = tree.getByRole("treeitem", { name: "Hydration option 120" });
  await expect(lastRoot).toBeFocused();
  await expect(lastRoot).toHaveAttribute("tabindex", "0");
  await expect(lastRoot).toHaveAttribute("aria-level", "1");
  await expect(lastRoot).toHaveAttribute("aria-posinset", "121");
  await expect(lastRoot).toHaveAttribute("aria-setsize", "121");
  expect(await tree.getByRole("treeitem").count()).toBeLessThanOrEqual(12);
  expect(runtimeErrors).toEqual([]);
});
