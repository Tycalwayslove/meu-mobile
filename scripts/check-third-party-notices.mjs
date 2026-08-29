import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const workspaceRoot = resolve(import.meta.dirname, "..");
const failures = [];

async function read(relativePath) {
  return readFile(resolve(workspaceRoot, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await read(relativePath));
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function expectIncludes(source, expected, label) {
  expect(source.includes(expected), `${label}: missing ${expected}`);
}

const licenseCopies = [
  ["licenses/lucide-isc.txt", "packages/icons-core/licenses/lucide-isc.txt"],
  ["licenses/lucide-isc.txt", "apps/docs/public/licenses/lucide-isc.txt"],
  ["licenses/feather-mit.txt", "packages/icons-core/licenses/feather-mit.txt"],
  ["licenses/feather-mit.txt", "apps/docs/public/licenses/feather-mit.txt"],
  ["licenses/tanstack-virtual-mit.txt", "apps/docs/public/licenses/tanstack-virtual-mit.txt"]
];

for (const [canonicalPath, distributedPath] of licenseCopies) {
  const [canonical, distributed] = await Promise.all([read(canonicalPath), read(distributedPath)]);
  expect(
    canonical === distributed,
    `${distributedPath}: must exactly match canonical ${canonicalPath}`
  );
}

const [rootNotices, iconPackage, iconManifest, licensePage, footer, sitemap, mobilePackage] =
  await Promise.all([
    read("THIRD_PARTY_NOTICES.md"),
    readJson("packages/icons-core/package.json"),
    readJson("packages/icons-core/src/icons.manifest.json"),
    read("apps/docs/app/licenses/page.tsx"),
    read("apps/docs/app/_components/SiteFooter.tsx"),
    read("apps/docs/app/sitemap.ts"),
    readJson("packages/mobile/package.json")
  ]);

expectIncludes(rootNotices, "Lucide Icons 1.34.0", "root third-party notices");
expectIncludes(rootNotices, "Feather Icons", "root third-party notices");
expectIncludes(rootNotices, "@tanstack/react-virtual` 3.14.10", "root third-party notices");
expectIncludes(rootNotices, "@tanstack/virtual-core` 3.17.8", "root third-party notices");

expect(iconPackage.private === true, "@meu/icons-core must remain private before npm launch");
expect(
  iconPackage.license === "UNLICENSED",
  "@meu/icons-core must retain explicit UNLICENSED status"
);
for (const requiredPath of [
  "dist",
  "LICENSE",
  "README.md",
  "THIRD_PARTY_NOTICES.md",
  "icons.lock.json",
  "licenses",
  "upstream"
]) {
  expect(
    iconPackage.files?.includes(requiredPath),
    `@meu/icons-core files must include ${requiredPath}`
  );
}

expect(iconManifest.provenanceAudit?.status === "verified", "icon provenance must be verified");
expect(iconManifest.icons?.length === 5, "icon manifest must contain the five reviewed icons");
for (const icon of iconManifest.icons || []) {
  expect(icon.modified === false, `${icon.id}: modified geometry requires a separate legal path`);
  expect(
    JSON.stringify(icon.licenses) === JSON.stringify(["ISC", "MIT"]),
    `${icon.id}: licenses must remain ISC + MIT`
  );
  expect(
    JSON.stringify(icon.licenseFiles) ===
      JSON.stringify(["licenses/lucide-isc.txt", "licenses/feather-mit.txt"]),
    `${icon.id}: package-relative license files drifted`
  );
}

expect(
  mobilePackage.dependencies?.["@tanstack/react-virtual"] === "3.14.10",
  "@meu/mobile TanStack React Virtual version drifted"
);

for (const href of [
  "/licenses/lucide-isc.txt",
  "/licenses/feather-mit.txt",
  "/licenses/tanstack-virtual-mit.txt"
]) {
  expectIncludes(licensePage, href, "docs license page");
}
expectIncludes(licensePage, "不构成法律意见", "docs license disclaimer");
expectIncludes(footer, 'href="/licenses"', "docs footer");
expectIncludes(sitemap, '"/licenses"', "docs sitemap");

const packResult = spawnSync("npm", ["pack", "--dry-run", "--json"], {
  cwd: resolve(workspaceRoot, "packages/icons-core"),
  encoding: "utf8",
  maxBuffer: 2 * 1024 * 1024
});
if (packResult.status !== 0) {
  failures.push(`@meu/icons-core pack dry-run failed: ${packResult.stderr.trim()}`);
} else {
  try {
    const packReport = JSON.parse(packResult.stdout)[0];
    const packedPaths = new Set(packReport.files.map((file) => file.path));
    for (const requiredPath of [
      "LICENSE",
      "THIRD_PARTY_NOTICES.md",
      "licenses/lucide-isc.txt",
      "licenses/feather-mit.txt",
      "dist/icons.manifest.json",
      "icons.lock.json"
    ]) {
      expect(packedPaths.has(requiredPath), `packed @meu/icons-core is missing ${requiredPath}`);
    }
    for (const icon of iconManifest.icons || []) {
      expect(packedPaths.has(icon.source), `packed @meu/icons-core is missing ${icon.source}`);
    }
  } catch (error) {
    failures.push(`@meu/icons-core pack report was invalid JSON: ${String(error)}`);
  }
}

if (failures.length > 0) {
  process.stderr.write(
    `Third-party notice gate failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    "Third-party notice gate passed: canonical license copies, 5 icon provenance records, docs disclosure, and packed notices verified.\n"
  );
}
