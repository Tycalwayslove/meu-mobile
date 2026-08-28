/* global console */

import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import apiExtractor from "@microsoft/api-extractor";

const { Extractor, ExtractorConfig, ExtractorLogLevel } = apiExtractor;

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packages = [
  { folder: "mobile", artifact: "mobile.api.json" },
  { folder: "form-react", artifact: "form-react.api.json" },
  { folder: "icons-react", artifact: "icons-react.api.json" },
  { folder: "primitives-react", artifact: "primitives-react.api.json" }
];
const argumentsSet = new Set(process.argv.slice(2));
const update = argumentsSet.has("--update");
const strict = argumentsSet.has("--strict");
const unknownArguments = [...argumentsSet].filter(
  (argument) => argument !== "--update" && argument !== "--strict"
);

function normalizeLineEndings(path) {
  if (!existsSync(path)) return;
  const source = readFileSync(path, "utf8");
  const normalized = source.replace(/\r\n/g, "\n");
  if (source !== normalized) writeFileSync(path, normalized);
}

if (unknownArguments.length > 0) {
  console.error(`Unknown API Extractor arguments: ${unknownArguments.join(", ")}`);
  process.exitCode = 2;
} else {
  let hasErrors = false;
  let hasStaleDocModels = false;
  let totalWarnings = 0;
  let migrationWarnings = 0;

  for (const { folder, artifact } of packages) {
    const configPath = resolve(workspaceRoot, `packages/${folder}/api-extractor.json`);
    const generatedDocModelPath = resolve(workspaceRoot, "temp/api", artifact);
    const committedDocModelPath = resolve(workspaceRoot, "etc/api", artifact);
    const committedReportPath = resolve(workspaceRoot, "etc/api", `${folder}.api.md`);
    const extractorConfig = ExtractorConfig.loadFileAndPrepare(configPath);
    const result = Extractor.invoke(extractorConfig, {
      localBuild: update,
      messageCallback(message) {
        if (message.messageId === "ae-missing-release-tag") {
          migrationWarnings += 1;
          if (!strict) {
            message.logLevel = ExtractorLogLevel.None;
          }
          message.handled = true;
        }
      },
      printApiReportDiff: !update,
      showDiagnostics: false,
      showVerboseMessages: false
    });

    normalizeLineEndings(generatedDocModelPath);

    if (update) {
      copyFileSync(generatedDocModelPath, committedDocModelPath);
      normalizeLineEndings(committedDocModelPath);
      normalizeLineEndings(committedReportPath);
    } else if (
      !existsSync(committedDocModelPath) ||
      readFileSync(generatedDocModelPath, "utf8") !== readFileSync(committedDocModelPath, "utf8")
    ) {
      hasStaleDocModels = true;
      console.error(
        `[api-extractor] @meu/${folder}: doc model is stale; run pnpm api:extract:update and commit ${committedDocModelPath}`
      );
    }

    totalWarnings += result.warningCount;
    hasErrors ||= result.errorCount > 0;
    hasErrors ||= !update && result.apiReportChanged;
    console.log(
      `[api-extractor] @meu/${folder}: ${result.errorCount} error(s), ${result.warningCount} active warning(s)`
    );
  }

  if (hasErrors || hasStaleDocModels) {
    process.exitCode = 1;
  } else if (strict && totalWarnings > 0) {
    console.error(
      `[api-extractor] Strict gate failed with ${totalWarnings} warning(s). Add TSDoc/release tags or explicitly resolve the reported API debt.`
    );
    process.exitCode = 1;
  } else {
    const action = update ? "updated" : "verified";
    console.log(
      `[api-extractor] API reports and doc models ${action}; ${migrationWarnings} deferred release-tag warning(s).`
    );
  }
}
