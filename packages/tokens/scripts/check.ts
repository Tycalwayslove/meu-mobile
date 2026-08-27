import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = resolve(import.meta.dirname, "../../..");
const generatedFiles = [
  "packages/tokens/src/generated.ts",
  "packages/tokens/src/theme.css",
  "packages/tokens/src/figma.generated.json",
  "packages/tokens/src/tokens.lock.json"
];

const before = await Promise.all(
  generatedFiles.map(async (file) => readFile(resolve(root, file), "utf8"))
);

await execFileAsync(process.execPath, ["--import", "tsx", "packages/tokens/scripts/generate.ts"], {
  cwd: root
});

const after = await Promise.all(
  generatedFiles.map(async (file) => readFile(resolve(root, file), "utf8"))
);

const changed = generatedFiles.filter((_, index) => before[index] !== after[index]);
if (changed.length > 0) {
  await Promise.all(
    generatedFiles.map(async (file, index) => {
      const snapshot = before[index];
      if (snapshot !== undefined) {
        await writeFile(resolve(root, file), snapshot, "utf8");
      }
    })
  );
  throw new Error(`Design token outputs were stale: ${changed.join(", ")}`);
}

console.log("Design token outputs are synchronized.");
