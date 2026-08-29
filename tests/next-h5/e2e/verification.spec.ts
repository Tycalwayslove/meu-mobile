import { readFile } from "node:fs/promises";

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
  await page.goto("/verification");
  await expect(page.getByRole("heading", { name: "真机商用验收工作台" })).toBeVisible();
});

test.afterEach(({ page }) => {
  expect(runtimeErrorsByPage.get(page), "runtime console/page errors").toEqual([]);
});

test("captures a smoke sample and exports structured device evidence", async ({ page }) => {
  await page.addScriptTag({ content: axe.source });
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
              nodes: Array<{ target: string[] }>;
            }>;
          }>;
        };
      }
    ).axe;
    const result = await axeRuntime.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      targets: violation.nodes.flatMap((node) => node.target)
    }));
  });
  expect(violations).toEqual([]);

  await page.getByLabel("执行人").fill("playwright-smoke");
  await page.getByLabel("设备与系统").fill("Playwright mobile profile");
  await page.getByLabel("候选 commit SHA").fill("a".repeat(40));
  await page.getByLabel("时长").selectOption("5");
  await page.getByRole("button", { name: "开始采样" }).click();
  await expect(page.locator('[data-capture-status="running"]')).toBeVisible();
  await expect(page.locator('[data-capture-status="complete"]')).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText("60 秒达标").locator("..").getByText("否")).toBeVisible();

  await page.getByRole("button", { name: "运行网络探针" }).click();
  await expect(page.getByText(/网络探针第 1 次成功/)).toBeVisible();
  await page.getByLabel("结果").first().selectOption("pass");
  await page.getByLabel("证据或问题").first().fill("工具自检通过；不计作真机结果。");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出验收 JSON" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const report = JSON.parse(await readFile(downloadPath, "utf8")) as {
    candidate: string;
    checklist: Array<{ id: string; status: string }>;
    environment: { userAgent: string; viewport: { height: number; width: number } };
    networkEvents: Array<{ attempt: number; result: string }>;
    performance: {
      durationMs: number;
      estimatedFps: number;
      requiredDurationMet: boolean;
    };
    schemaVersion: string;
    tester: string;
  };

  expect(report.schemaVersion).toBe("1.0.0");
  expect(report.candidate).toBe("a".repeat(40));
  expect(report.tester).toBe("playwright-smoke");
  expect(report.performance.durationMs).toBeGreaterThanOrEqual(4_900);
  expect(report.performance.estimatedFps).toBeGreaterThan(0);
  expect(report.performance.requiredDurationMet).toBe(false);
  expect(report.environment.userAgent.length).toBeGreaterThan(0);
  expect(report.environment.viewport.width).toBeGreaterThan(0);
  expect(report.checklist[0]).toMatchObject({ id: "D-01", status: "pass" });
  expect(report.networkEvents).toEqual(
    expect.arrayContaining([expect.objectContaining({ attempt: 1, result: "success" })])
  );
});
