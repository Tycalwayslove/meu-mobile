/* global console */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

const sourceRoot = join(process.cwd(), "packages/mobile/src");
const ignoredSuffixes = [".stories.tsx", ".test.tsx", ".ssr.test.tsx", ".hydration.test.tsx"];

function collectSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    if (!entry.name.endsWith(".tsx") || ignoredSuffixes.some((suffix) => entry.name.endsWith(suffix))) {
      return [];
    }
    return [path];
  });
}

const portalConsumers = collectSourceFiles(sourceRoot)
  .map((path) => ({ path, source: readFileSync(path, "utf8") }))
  .filter(({ source }) => /<(?:Portal|FloatingPortal)\b/.test(source));

const issues = [];
for (const { path, source } of portalConsumers) {
  const label = relative(process.cwd(), path);
  if (!/import\s*{[^}]*\bgetConfigBoundaryProps\b[^}]*}\s*from\s*["'][^"']*configBoundary["']/.test(source)) {
    issues.push(`${label}: Portal consumer must import getConfigBoundaryProps`);
  }
  if (!/const\s+configBoundary\s*=\s*getConfigBoundaryProps\(config\)/.test(source)) {
    issues.push(`${label}: Portal consumer must resolve the nearest Meu config boundary`);
  }
  if (!/{\.\.\.configBoundary}/.test(source)) {
    issues.push(`${label}: Portal root must spread the resolved config boundary props`);
  }
  if (!/configBoundary\.className/.test(source)) {
    issues.push(`${label}: Portal root must preserve the theme and motion boundary classes`);
  }
}

if (portalConsumers.length === 0) {
  issues.push("No direct Portal consumers were discovered; the source scan is probably stale");
}

if (issues.length > 0) {
  console.error("Overlay configuration boundary check failed:\n");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  const labels = portalConsumers.map(({ path }) => relative(process.cwd(), path)).sort();
  console.log(`Validated ${labels.length} direct overlay Portal consumers:`);
  for (const label of labels) console.log(`- ${label}`);
}
