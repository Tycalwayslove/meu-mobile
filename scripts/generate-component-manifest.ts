/* global console, process */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { componentDocs } from "../apps/docs/app/_data/components";
import {
  buildComponentManifest,
  manifestIssues,
  serializeManifest
} from "./lib/component-manifest";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(workspaceRoot, "apps/docs/app/_generated/component-manifest.json");
const argumentsSet = new Set(process.argv.slice(2));
const check = argumentsSet.has("--check");
const strict = argumentsSet.has("--strict");
const report = argumentsSet.has("--report") || strict;
const manifest = buildComponentManifest(workspaceRoot, componentDocs);
const serialized = serializeManifest(manifest);
const issues = manifestIssues(manifest);

if (check) {
  let current = "";
  try {
    current = readFileSync(outputPath, "utf8");
  } catch {
    console.error(`Component manifest is missing: ${path.relative(workspaceRoot, outputPath)}`);
    process.exitCode = 1;
  }
  if (current && current !== serialized) {
    console.error("Component manifest is stale. Run `pnpm docs:manifest` and commit the result.");
    process.exitCode = 1;
  }
} else {
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
  console.log(`Wrote ${path.relative(workspaceRoot, outputPath)}.`);
}

console.log(
  [
    `${manifest.summary.products} product entries`,
    `${manifest.summary.publicValues} public values`,
    `${manifest.summary.publicTypes} public types`,
    `${manifest.summary.documentedProducts} colocated docs`,
    `${manifest.summary.unclaimedPublicValues} unclaimed public values`,
    `${issues.length} coverage issues`
  ].join(" · ")
);

if (report && issues.length > 0) {
  console.log("Coverage report:");
  for (const issue of issues) console.log(`- ${issue}`);
} else if (issues.length > 0) {
  console.log("Run `pnpm docs:manifest:report` for the complete non-blocking coverage report.");
}

if (strict && issues.length > 0) {
  console.error("Strict component documentation coverage failed.");
  process.exitCode = 1;
}
