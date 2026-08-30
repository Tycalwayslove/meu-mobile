import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

const placements = [
  "top",
  "top-start",
  "top-end",
  "right",
  "right-start",
  "right-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end"
] as const;

async function expectBaseGeometry(anchor: Locator, panel: Locator, placement: string) {
  const [anchorBox, panelBox] = await Promise.all([anchor.boundingBox(), panel.boundingBox()]);
  expect(anchorBox).not.toBeNull();
  expect(panelBox).not.toBeNull();
  if (!anchorBox || !panelBox) return;

  const base = placement.split("-")[0];
  if (base === "top") expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(anchorBox.y + 1);
  if (base === "right") expect(panelBox.x).toBeGreaterThanOrEqual(anchorBox.x + anchorBox.width - 1);
  if (base === "bottom") expect(panelBox.y).toBeGreaterThanOrEqual(anchorBox.y + anchorBox.height - 1);
  if (base === "left") expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(anchorBox.x + 1);
}

test("positions all twelve placements and follows an anchor inside a nested scroll container", async ({
  page
}) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto("/popover-contract");

  const select = page.getByRole("combobox", { name: "Requested placement" });
  const anchor = page.getByRole("button", { name: "Placement anchor" });
  const panel = page.getByRole("dialog", { name: "Placement probe" });
  const scrollContainer = page.getByTestId("popover-scroll-container");
  await expect.poll(() => scrollContainer.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);

  for (const placement of placements) {
    await select.selectOption(placement);
    await expect(panel).toHaveAttribute("data-positioned", "true");
    await expect(panel).toHaveAttribute("data-placement", placement);
    await expectBaseGeometry(anchor, panel, placement);
  }

  const before = await panel.boundingBox();
  await scrollContainer.evaluate((node) => {
    node.scrollTop += 40;
  });
  await expect.poll(() => scrollContainer.evaluate((node) => node.scrollTop)).toBeGreaterThan(200);
  const beforeY = before ? before.y : undefined;
  await expect.poll(async () => {
    const current = await panel.boundingBox();
    return current ? current.y : undefined;
  }).not.toBe(beforeY);
  await expect(panel).toHaveAttribute("data-meu-motion", "reduced");
  await expect(panel).toHaveCSS("color-scheme", "dark");
  expect(runtimeErrors).toEqual([]);
});
