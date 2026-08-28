import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, relative, resolve } from "node:path";

const root = globalThis.process.cwd();
const staticRoot = resolve(root, "apps/storybook/storybook-static");
const axeSource = await readFile(
  resolve(root, "packages/test-utils/node_modules/axe-core/axe.min.js"),
  "utf8"
);
const { chromium } = await import(
  new globalThis.URL("../tests/next-h5/node_modules/@playwright/test/index.mjs", import.meta.url)
);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function isInsideStaticRoot(path) {
  const pathFromRoot = relative(staticRoot, path);
  return pathFromRoot === "" || (!pathFromRoot.startsWith("..") && !pathFromRoot.startsWith("/"));
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new globalThis.URL(request.url || "/", "http://127.0.0.1");
    const requestedPath = normalize(decodeURIComponent(requestUrl.pathname)).replace(/^\/+/, "");
    let filePath = resolve(staticRoot, requestedPath || "index.html");
    if (!isInsideStaticRoot(filePath)) throw new Error("Path escapes Storybook output");
    const fileStats = await stat(filePath);
    if (fileStats.isDirectory()) filePath = join(filePath, "index.html");
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": mimeTypes[extname(filePath)] || "application/octet-stream"
    });
    response.end(await readFile(filePath));
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

await new Promise((resolveServer) => server.listen(0, "127.0.0.1", resolveServer));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Storybook server did not start");
const origin = `http://127.0.0.1:${address.port}`;

try {
  const storybookIndex = JSON.parse(await readFile(join(staticRoot, "index.json"), "utf8"));
  const match = globalThis.process.env.MEU_STORYBOOK_MATCH;
  const limit = Number.parseInt(globalThis.process.env.MEU_STORYBOOK_LIMIT || "0", 10);
  const requestedTheme = globalThis.process.env.MEU_STORYBOOK_THEME || "all";
  const themes =
    requestedTheme === "light" || requestedTheme === "dark" ? [requestedTheme] : ["light", "dark"];
  let stories = Object.values(storybookIndex.entries)
    .filter((entry) => entry.type === "story")
    .filter((entry) => !match || entry.id.includes(match) || entry.title.includes(match));
  if (limit > 0) stories = stories.slice(0, limit);

  const browser = await chromium.launch({ headless: true });
  const violations = [];
  const renderErrors = [];
  let completed = 0;
  const workerCount = Math.min(4, Math.max(1, stories.length));

  async function scanBatch(workerIndex) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript({ content: axeSource });
    await page.addInitScript({
      content: `
        globalThis.__MEU_STORYBOOK_RESULT__ = null;
        globalThis.__MEU_STORYBOOK_PLAY_ERROR__ = null;
        let meuStorybookChannel;
        const attachMeuStorybookChannel = (channel) => {
          if (!channel || channel.__meuQualityAttached) return;
          channel.__meuQualityAttached = true;
          channel.on("playFunctionThrewException", (error) => {
            globalThis.__MEU_STORYBOOK_PLAY_ERROR__ = error;
          });
          channel.on("storyFinished", (result) => {
            globalThis.__MEU_STORYBOOK_RESULT__ = result;
          });
        };
        Object.defineProperty(globalThis, "__STORYBOOK_ADDONS_CHANNEL__", {
          configurable: true,
          get: () => meuStorybookChannel,
          set: (channel) => {
            meuStorybookChannel = channel;
            attachMeuStorybookChannel(channel);
          }
        });
      `
    });
    for (let storyIndex = workerIndex; storyIndex < stories.length; storyIndex += workerCount) {
      const story = stories[storyIndex];
      for (const theme of themes) {
        try {
          const globals = `theme:${theme};dir:ltr;locale:zh-CN;motion:system`;
          const url = `${origin}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story&globals=${encodeURIComponent(globals)}`;
          await page.goto(url, { timeout: 20_000, waitUntil: "domcontentloaded" });
          await page.waitForFunction(
            (storyId) => {
              const result = globalThis.__MEU_STORYBOOK_RESULT__;
              return result && result.storyId === storyId;
            },
            story.id,
            { timeout: 10_000 }
          );
          const storyResult = await page.evaluate(() => ({
            error: globalThis.__MEU_STORYBOOK_PLAY_ERROR__,
            result: globalThis.__MEU_STORYBOOK_RESULT__
          }));
          if (!storyResult.result || storyResult.result.status !== "success") {
            throw new Error(
              `Story interaction failed: ${JSON.stringify(storyResult.error || storyResult.result)}`
            );
          }
          await page.waitForFunction(
            () =>
              globalThis.document.querySelector("#storybook-root")?.childElementCount ||
              globalThis.document.querySelector("#storybook-root")?.textContent?.trim() ||
              globalThis.document.querySelector('[data-meu-component="portal"]'),
            null,
            { timeout: 10_000 }
          );
          await page.waitForTimeout(250);
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
          if (result.length > 0) violations.push({ story: story.id, theme, violations: result });
        } catch (error) {
          renderErrors.push({ story: story.id, theme, error: String(error).slice(0, 500) });
        }
      }
      completed += 1;
      if (completed % 25 === 0 || completed === stories.length) {
        globalThis.process.stdout.write(`Scanned ${completed}/${stories.length} stories\n`);
      }
    }
    await page.close();
  }

  await Promise.all(Array.from({ length: workerCount }, (_, index) => scanBatch(index)));
  await browser.close();

  if (renderErrors.length > 0 || violations.length > 0) {
    globalThis.process.stderr.write(`${JSON.stringify({ renderErrors, violations }, null, 2)}\n`);
    globalThis.process.stderr.write(
      `Storybook accessibility failed: ${renderErrors.length} render errors, ${violations.length} story/theme violations.\n`
    );
    globalThis.process.exitCode = 1;
  } else {
    globalThis.process.stdout.write(
      `Storybook accessibility passed: ${stories.length} stories × ${themes.length} theme(s).\n`
    );
  }
} finally {
  await new Promise((resolveServer, rejectServer) =>
    server.close((error) => (error ? rejectServer(error) : resolveServer()))
  );
}
