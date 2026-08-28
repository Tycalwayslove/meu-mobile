/* global console, process */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoots = ["packages", "apps", "tests"].map((entry) => path.join(workspaceRoot, entry));
const ignoredDirectories = new Set([
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "storybook-static",
  "test-results"
]);
const sourceExtensions = new Set([".css", ".js", ".jsx", ".mjs", ".ts", ".tsx"]);

async function collectFiles(directory, result = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(absolutePath, result);
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      result.push(absolutePath);
    }
  }
  return result;
}

const files = [];
for (const sourceRoot of sourceRoots) await collectFiles(sourceRoot, files);

const declarations = new Set();
const references = new Map();
const cssDeclarationPattern = /(--meu-[a-z0-9-]+)\s*:/g;
const objectDeclarationPattern = /["'](--meu-[a-z0-9-]+)["']\s*\??:/g;
const referencePattern = /var\((--meu-[a-z0-9-]+)/g;

for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(cssDeclarationPattern)) declarations.add(match[1]);
  for (const match of source.matchAll(objectDeclarationPattern)) declarations.add(match[1]);
  for (const match of source.matchAll(referencePattern)) {
    const token = match[1];
    const locations = references.get(token) || [];
    locations.push(path.relative(workspaceRoot, file));
    references.set(token, locations);
  }
}

const missing = [...references]
  .filter(([token]) => !declarations.has(token))
  .map(([token, locations]) => ({ token, locations: [...new Set(locations)].sort() }))
  .sort((left, right) => left.token.localeCompare(right.token));

if (missing.length > 0) {
  console.error("Undefined Meu CSS custom property references:");
  for (const item of missing) console.error(`- ${item.token}: ${item.locations.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`Meu CSS token references are valid across ${files.length} source files.`);
}
