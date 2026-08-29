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
