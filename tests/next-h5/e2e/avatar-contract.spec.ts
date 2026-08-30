import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

const avatarSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88">
    <rect width="88" height="88" fill="#127a67" />
    <circle cx="44" cy="34" r="16" fill="#ffffff" />
    <path d="M18 82c3-18 13-27 26-27s23 9 26 27" fill="#ffffff" />
  </svg>
`;

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

async function expectDecoded(image: Locator) {
  await expect
    .poll(() =>
      image.evaluate(async (node: HTMLImageElement) => {
        await node.decode();
        return { complete: node.complete, naturalWidth: node.naturalWidth };
      })
    )
    .toEqual({ complete: true, naturalWidth: 88 });
}

test("keeps a lazy Avatar pending until its delayed image is visible and decoded", async ({
  page
}) => {
  const responseGate = deferred();
  let requestCount = 0;

  await page.route("**/avatar-lazy.svg", async (route) => {
    requestCount += 1;
    await responseGate.promise;
    await route.fulfill({
      body: avatarSvg,
      contentType: "image/svg+xml",
      headers: { "cache-control": "no-store" },
      status: 200
    });
  });

  try {
    await page.goto("/avatar-contract", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Avatar loading contract" })).toBeVisible();

    const image = page.getByRole("img", { name: "懒加载头像" });
    const imageRoot = image.locator("xpath=..");
    await expect(image).toHaveAttribute("loading", "lazy");
    await expect(image).toHaveAttribute("decoding", "async");
    await expect(imageRoot).toHaveAttribute("data-state", "loading");
    await expect(imageRoot).toHaveAttribute("aria-busy", "true");
    await expect(imageRoot.getByText("LZ")).toBeVisible();

    await page.waitForTimeout(300);
    expect(requestCount).toBe(0);

    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => requestCount).toBe(1);
    await expect(imageRoot).toHaveAttribute("data-state", "loading");
    await expect(image).toHaveAttribute("data-pending", "true");

    responseGate.resolve();
    await expect(imageRoot).toHaveAttribute("data-state", "loaded");
    await expect(imageRoot).not.toHaveAttribute("aria-busy");
    await expect(image).not.toHaveAttribute("data-pending");
    await expectDecoded(image);
  } finally {
    responseGate.resolve();
  }
});

test("recovers from a failed Avatar source while the replacement response is delayed", async ({
  page
}) => {
  const failureGate = deferred();
  const recoveryGate = deferred();
  let recoveryRequestCount = 0;

  await page.route("**/avatar-recovery-0.svg", async (route) => {
    await failureGate.promise;
    await route.fulfill({
      body: "This response intentionally contains no decodable image data.",
      contentType: "application/octet-stream",
      headers: { "cache-control": "no-store" },
      status: 200
    });
  });
  await page.route("**/avatar-recovery-1.svg", async (route) => {
    recoveryRequestCount += 1;
    await recoveryGate.promise;
    await route.fulfill({
      body: avatarSvg,
      contentType: "image/svg+xml",
      headers: { "cache-control": "no-store" },
      status: 200
    });
  });

  try {
    await page.goto("/avatar-contract", { waitUntil: "domcontentloaded" });
    const recoverySection = page.getByRole("region", { name: "失败恢复头像" });
    const pendingImage = recoverySection.getByRole("img", { name: "恢复头像" });
    await expect(pendingImage.locator("xpath=..")).toHaveAttribute("data-state", "loading");
    failureGate.resolve();
    await expect(recoverySection.getByTestId("avatar-error-count")).toHaveText("1");

    const failedRoot = recoverySection.getByRole("img", { name: "恢复头像" });
    await expect(failedRoot).toHaveAttribute("data-state", "error");
    await expect(failedRoot.getByText("AR")).toBeVisible();

    await recoverySection.getByRole("button", { name: "重试头像" }).click();
    await expect.poll(() => recoveryRequestCount).toBe(1);

    const recoveryImage = recoverySection.getByRole("img", { name: "恢复头像" });
    const recoveryRoot = recoveryImage.locator("xpath=..");
    await expect(recoveryImage).toHaveAttribute("src", "/avatar-recovery-1.svg");
    await expect(recoveryImage).toHaveAttribute("decoding", "async");
    await expect(recoveryRoot).toHaveAttribute("data-state", "loading");
    await expect(recoveryRoot).toHaveAttribute("aria-busy", "true");
    await expect(recoveryRoot.getByText("AR")).toBeVisible();
    await expect(recoverySection.getByTestId("avatar-error-count")).toHaveText("1");
    await expect(recoverySection.getByTestId("avatar-load-count")).toHaveText("0");

    recoveryGate.resolve();
    await expect(recoveryRoot).toHaveAttribute("data-state", "loaded");
    await expect(recoverySection.getByTestId("avatar-error-count")).toHaveText("1");
    await expect(recoverySection.getByTestId("avatar-load-count")).toHaveText("1");
    await expectDecoded(recoveryImage);
  } finally {
    failureGate.resolve();
    recoveryGate.resolve();
  }
});
