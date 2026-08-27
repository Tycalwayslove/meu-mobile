/* global console */

import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const targets = [resolve(root, "packages"), resolve(root, "apps/playground/dist")];
const ignoredDirectories = new Set(["node_modules", "src", ".turbo"]);
const checks = [
  { extension: ".js", pattern: /\?\.|\?\?/, message: "optional chaining or nullish coalescing" },
  {
    extension: ".js",
    pattern: /\bclass\s+[^{]+\{[^}]*#[A-Za-z_$]/s,
    message: "private class fields"
  },
  { extension: ".css", pattern: /@layer\b/, message: "CSS cascade layers" },
  {
    extension: ".css",
    pattern: /:focus-visible\b/,
    message: ":focus-visible without a legacy fallback"
  },
  { extension: ".css", pattern: /:is\(/, message: ":is() selectors" }
];

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(path)));
    if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".css"))) {
      files.push(path);
    }
  }

  return files;
}

const files = (await Promise.all(targets.map(collect))).flat();
const failures = [];

for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const check of checks) {
    if (extname(file) === check.extension && check.pattern.test(source)) {
      failures.push(`${relative(root, file)}: ${check.message}`);
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Client compatibility check failed:\n${failures.join("\n")}`);
}

console.log(
  `Client compatibility check passed for ${files.length} built files (Chrome 70 / iOS 13 baseline).`
);
