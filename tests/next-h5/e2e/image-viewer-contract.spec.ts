import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/image-viewer-contract");
  await expect(page.getByRole("heading", { name: "ImageViewer gesture contract" })).toBeVisible();
  await page.getByRole("button", { name: "Open RTL image viewer" }).click();
  await expect(page.getByRole("dialog", { name: "Image viewer" })).toHaveAttribute(
    "data-index",
    "1"
  );
});

test("maps a physical RTL gallery drag to the visual next image", async ({ page }) => {
  const viewport = page.locator("[data-meu-carousel-viewport]");
  const box = await viewport.boundingBox();
  if (!box) throw new Error("Expected the RTL carousel viewport");

  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5, { steps: 8 });
  await page.mouse.up();

  await expect(page.getByTestId("image-viewer-index")).toHaveText("2");
  await expect(page.getByTestId("image-viewer-reason")).toHaveText("drag");
});

test("clears cancelled and lost-capture pans before the next mouse session", async ({ page }) => {
  await page.getByRole("button", { name: "Zoom in" }).click();
  const stage = page.locator(
    '[data-meu-carousel-slide][data-active="true"] [data-meu-image-viewer-stage]'
  );
  const media = stage.locator("[data-meu-image-viewer-media]");
  const box = await stage.boundingBox();
  if (!box) throw new Error("Expected the active zoom stage");

  const startX = box.x + box.width * 0.5;
  const startY = box.y + box.height * 0.5;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 36, startY, { steps: 3 });
  await expect(media).toHaveAttribute("data-interacting", "true");
  await stage.dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse" });
  await expect(media).toHaveAttribute("data-interacting", "false");
  await page.mouse.up();

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - 36, startY, { steps: 3 });
  await expect(media).toHaveAttribute("data-interacting", "true");
  await stage.dispatchEvent("lostpointercapture", { pointerId: 1, pointerType: "mouse" });
  await expect(media).toHaveAttribute("data-interacting", "false");
  await page.mouse.up();

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 24, startY, { steps: 3 });
  await expect(media).toHaveAttribute("data-interacting", "true");
  await page.mouse.up();
  await expect(media).toHaveAttribute("data-interacting", "false");
});
