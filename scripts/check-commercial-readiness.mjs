import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const workspaceRoot = resolve(import.meta.dirname, "..");
const strict = process.argv.includes("--strict");
const acceptancePath = resolve(workspaceRoot, "docs/v2/RELEASE_ACCEPTANCE.md");
const manifestPath = resolve(workspaceRoot, "apps/docs/app/_generated/component-manifest.json");
const acceptance = await readFile(acceptancePath, "utf8");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const failures = [];
const requiredBlockers = [
  "DEV-01",
  "DEV-02",
  "DEV-03",
  "DEV-04",
  "DEV-05",
  "PERF-01",
  "PERF-02",
  "NET-01",
  "LEGAL-01",
  "LEGAL-02",
  "LEGAL-03",
  "VIS-01",
  "WEB-01"
];
const allowedStatuses = new Set(["pending", "pass", "fail", "waived"]);
const blockers = new Map();

for (const line of acceptance.split("\n")) {
  if (!/^\|\s*(?:DEV|PERF|NET|LEGAL|VIS|WEB)-\d+\s*\|/.test(line)) continue;
  const cells = line.split("|").map((cell) => cell.trim());
  const id = cells[1];
  const status = cells[4];
  if (blockers.has(id)) failures.push(`${id}: duplicate release blocker row`);
  blockers.set(id, status);
  if (!allowedStatuses.has(status)) failures.push(`${id}: unsupported status ${status}`);
}

for (const id of requiredBlockers) {
  if (!blockers.has(id)) failures.push(`${id}: missing release blocker row`);
}
for (const id of blockers.keys()) {
  if (!requiredBlockers.includes(id)) failures.push(`${id}: unrecognized release blocker row`);
}

const products = manifest.products || [];
const componentStatuses = [];
for (const product of products) {
  const document = await readFile(resolve(workspaceRoot, product.docsPath), "utf8");
  const frontmatter = document.match(/^---\n([\s\S]*?)\n---/)?.[1] || "";
  const status = frontmatter.match(/^status:\s*(\S+)\s*$/m)?.[1];
  if (!status) failures.push(`${product.docsPath}: missing frontmatter status`);
  componentStatuses.push({ name: product.name, status });
}

const candidateSha =
  acceptance.match(/^\| 候选 commit SHA\s*\|\s*([^|]+?)\s*\|$/m)?.[1].trim() || "";
const completedStatuses = new Set(["pass", "waived"]);
const incompleteBlockers = requiredBlockers.filter(
  (id) => !completedStatuses.has(blockers.get(id))
);
const commercialComponents = componentStatuses.filter(({ status }) => status === "commercial");
const headResult = spawnSync("git", ["rev-parse", "HEAD"], {
  cwd: workspaceRoot,
  encoding: "utf8"
});
const headSha = headResult.status === 0 ? headResult.stdout.trim() : "";
const candidateIsSha = /^[0-9a-f]{40}$/.test(candidateSha);
let candidateIsAncestor = false;
let protectedChanges = [];

if (candidateIsSha && headSha) {
  const ancestorResult = spawnSync("git", ["merge-base", "--is-ancestor", candidateSha, headSha], {
    cwd: workspaceRoot,
    encoding: "utf8"
  });
  candidateIsAncestor = ancestorResult.status === 0;

  if (candidateIsAncestor) {
    const diffResult = spawnSync("git", ["diff", "--name-only", candidateSha], {
      cwd: workspaceRoot,
      encoding: "utf8"
    });
    const untrackedResult = spawnSync("git", ["ls-files", "--others", "--exclude-standard"], {
      cwd: workspaceRoot,
      encoding: "utf8"
    });
    if (diffResult.status !== 0 || untrackedResult.status !== 0) {
      failures.push("unable to inspect working tree changes after the candidate commit");
    } else {
      const evidenceOnlyPaths = new Set([
        "docs/v2/RELEASE_ACCEPTANCE.md",
        "docs/v2/DEVICE_VERIFICATION.md",
        "docs/v2/PERFORMANCE.md"
      ]);
      const changedPaths = new Set(
        `${diffResult.stdout}\n${untrackedResult.stdout}`.split("\n").filter(Boolean)
      );
      protectedChanges = [...changedPaths].filter((path) => {
        if (evidenceOnlyPaths.has(path)) return false;
        if (!path.endsWith(".docs.mdx")) return true;

        const candidateDocument = spawnSync("git", ["show", `${candidateSha}:${path}`], {
          cwd: workspaceRoot,
          encoding: "utf8"
        });
        if (candidateDocument.status !== 0) return true;
        let currentDocument;
        try {
          currentDocument = readFileSync(resolve(workspaceRoot, path), "utf8");
        } catch {
          return true;
        }
        const normalizeStatus = (source) =>
          source.replace(/^status:\s*\S+\s*$/m, "status: <release-status>");
        return normalizeStatus(candidateDocument.stdout) !== normalizeStatus(currentDocument);
      });
    }
  }
}

if (candidateSha !== "待定" && !candidateIsSha) {
  failures.push(
    `candidate commit SHA must be 待定 or a full 40-character SHA, received ${candidateSha}`
  );
}
if (commercialComponents.length > 0 && incompleteBlockers.length > 0) {
  failures.push(
    `${commercialComponents.length} component(s) are commercial while blockers remain: ${incompleteBlockers.join(", ")}`
  );
}
if (candidateIsSha && !candidateIsAncestor) {
  failures.push("candidate SHA must be an ancestor of HEAD");
}
if (candidateIsSha && protectedChanges.length > 0) {
  failures.push(
    `protected changes found after the candidate commit: ${protectedChanges.join(", ")}`
  );
}

if (strict) {
  if (incompleteBlockers.length > 0) {
    failures.push(
      `strict commercial check has incomplete blockers: ${incompleteBlockers.join(", ")}`
    );
  }
  if (commercialComponents.length !== products.length) {
    failures.push(
      `strict commercial check requires ${products.length}/${products.length} commercial components, received ${commercialComponents.length}`
    );
  }
  if (!candidateIsSha) failures.push("strict commercial check requires a frozen candidate SHA");
  const worktreeResult = spawnSync("git", ["status", "--porcelain"], {
    cwd: workspaceRoot,
    encoding: "utf8"
  });
  if (worktreeResult.status !== 0 || worktreeResult.stdout.trim()) {
    failures.push("strict commercial check requires a clean worktree");
  }
}

if (failures.length > 0) {
  process.stderr.write(
    `Commercial readiness gate failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`
  );
  process.exitCode = 1;
} else {
  const summary = `${commercialComponents.length}/${products.length} commercial components · ${requiredBlockers.length - incompleteBlockers.length}/${requiredBlockers.length} manual blockers complete`;
  if (strict) {
    process.stdout.write(`Commercial release candidate passed: ${summary} · ${headSha}.\n`);
  } else {
    process.stdout.write(`Commercial readiness structure passed: ${summary}.\n`);
  }
}
