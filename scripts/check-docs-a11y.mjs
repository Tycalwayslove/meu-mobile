import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = globalThis.process.cwd();
const docsRoot = resolve(root, "apps/docs");
const nextBin = resolve(docsRoot, "node_modules/next/dist/bin/next");
const axeSource = await readFile(
  resolve(root, "packages/test-utils/node_modules/axe-core/axe.min.js"),
  "utf8"
);
const { chromium } = await import(
  new globalThis.URL("../tests/next-h5/node_modules/@playwright/test/index.mjs", import.meta.url)
);

async function reservePort() {
  const server = createServer();
  await new Promise((resolveServer, rejectServer) => {
    server.once("error", rejectServer);
    server.listen(0, "127.0.0.1", resolveServer);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to reserve docs port");
  await new Promise((resolveServer, rejectServer) =>
    server.close((error) => (error ? rejectServer(error) : resolveServer()))
  );
  return address.port;
}

async function waitForServer(origin, child) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Docs server exited with ${child.exitCode}`);
    try {
      const response = await globalThis.fetch(`${origin}/components`);
      if (response.ok) return;
    } catch {
      // The local server is still starting.
    }
    await new Promise((resolveWait) => globalThis.setTimeout(resolveWait, 100));
  }
  throw new Error("Docs server did not become ready within 20 seconds");
}

const port = await reservePort();
const origin = `http://127.0.0.1:${port}`;
const server = spawn(
  globalThis.process.execPath,
  [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)],
  {
    cwd: docsRoot,
    env: { ...globalThis.process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"]
  }
);
let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

try {
  await waitForServer(origin, server);
  const browser = await chromium.launch({ headless: true });
  const discovery = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await discovery.goto(`${origin}/components`, { waitUntil: "networkidle" });
  const componentPaths = await discovery
    .locator('a[href^="/components/"]')
    .evaluateAll((links) => [
      ...new Set(
        links
          .map((link) => new globalThis.URL(link.href).pathname)
          .filter((path) => path.split("/").length === 3)
      )
    ]);
  await discovery.close();
  const staticPaths = [
    "/",
    "/getting-started",
    "/foundations",
    "/components",
    "/lab",
    "/licenses",
    "/privacy",
    "/terms"
  ];
  let paths = [...componentPaths, ...staticPaths];

  const match = globalThis.process.env.MEU_DOCS_MATCH;
  const limit = Number.parseInt(globalThis.process.env.MEU_DOCS_LIMIT || "0", 10);
  const requestedTheme = globalThis.process.env.MEU_DOCS_THEME || "all";
  const themes =
    requestedTheme === "light" || requestedTheme === "dark" ? [requestedTheme] : ["light", "dark"];
  if (match) paths = paths.filter((path) => path.includes(match));
  if (limit > 0) paths = paths.slice(0, limit);

  const failures = [];
  let completed = 0;

  async function scanTheme(theme) {
    const context = await browser.newContext({
      colorScheme: theme,
      viewport: { width: 390, height: 844 }
    });
    await context.addInitScript(
      (nextTheme) => globalThis.localStorage.setItem("meu-docs-theme", nextTheme),
      theme
    );
    let cursor = 0;
    const workerCount = Math.min(2, Math.max(1, paths.length));

    async function scanBatch() {
      const page = await context.newPage();
      let activePath = "";
      page.on("pageerror", (error) => {
        failures.push({ path: activePath, theme, error: `pageerror: ${error.message}` });
      });
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        failures.push({ path: activePath, theme, error: `console.error: ${message.text()}` });
      });
      while (cursor < paths.length) {
        const path = paths[cursor++];
        activePath = path;
        try {
          const response = await page.goto(`${origin}${path}`, {
            timeout: 20_000,
            waitUntil: "networkidle"
          });
          if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
          const isComponentPage = path.startsWith("/components/");
          const [headingCount, mainCount, previewCount, apiCount] = await Promise.all([
            page.locator("h1").count(),
            page.locator("main").count(),
            page.locator(".preview-frame").count(),
            page.locator("#api-reference").count()
          ]);
          if (headingCount !== 1 || mainCount !== 1) {
            throw new Error(`Expected h1/main once, received ${headingCount}/${mainCount}`);
          }
          if (isComponentPage && (previewCount !== 1 || apiCount !== 1)) {
            throw new Error(
              `Expected component preview/API once, received ${previewCount}/${apiCount}`
            );
          }
          if (isComponentPage) {
            const documentStatus = await page
              .locator(".component-document__meta dd[data-status]")
              .getAttribute("data-status");
            if (
              !documentStatus ||
              !["audit", "design", "implementation", "verification", "commercial"].includes(
                documentStatus
              )
            ) {
              throw new Error(`Missing or invalid component document status: ${documentStatus}`);
            }
          }
          const selectedTheme = await page.locator(".theme-select select").inputValue();
          if (selectedTheme !== theme) {
            throw new Error(`Theme restoration returned ${selectedTheme}`);
          }
          await page.addScriptTag({ content: axeSource });
          const result = await page.evaluate(async () => {
            const report = await globalThis.axe.run(globalThis.document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
              }
            });
            return report.violations.map((violation) => ({
              id: violation.id,
              impact: violation.impact,
              nodes: violation.nodes.map((node) => ({
                failureSummary: node.failureSummary,
                html: node.html,
                target: node.target
              }))
            }));
          });
          if (result.length > 0) failures.push({ path, theme, violations: result });
        } catch (error) {
          failures.push({ path, theme, error: String(error).slice(0, 500) });
        }
        completed += 1;
        if (completed % 20 === 0 || completed === paths.length * themes.length) {
          globalThis.process.stdout.write(
            `Scanned ${completed}/${paths.length * themes.length} docs scenarios\n`
          );
        }
      }
      await page.close();
    }

    await Promise.all(Array.from({ length: workerCount }, () => scanBatch()));
    await context.close();
  }

  await Promise.all(themes.map((theme) => scanTheme(theme)));
  await browser.close();

  if (failures.length > 0) {
    globalThis.process.stderr.write(`${JSON.stringify({ failures }, null, 2)}\n`);
    globalThis.process.stderr.write(
      `Docs accessibility failed: ${failures.length} page/theme failure(s).\n`
    );
    globalThis.process.exitCode = 1;
  } else {
    globalThis.process.stdout.write(
      `Docs accessibility passed: ${paths.length} pages × ${themes.length} theme(s).\n`
    );
  }
} catch (error) {
  globalThis.process.stderr.write(`${String(error)}\n${serverOutput}`);
  globalThis.process.exitCode = 1;
} finally {
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await new Promise((resolveExit) => server.once("exit", resolveExit));
  }
}
