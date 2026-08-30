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
  ["licenses/tanstack-virtual-mit.txt", "apps/docs/public/licenses/tanstack-virtual-mit.txt"],
  ["licenses/floating-ui-mit.txt", "apps/docs/public/licenses/floating-ui-mit.txt"],
  ["licenses/vanilla-extract-mit.txt", "apps/docs/public/licenses/vanilla-extract-mit.txt"],
  ["licenses/embla-carousel-mit.txt", "apps/docs/public/licenses/embla-carousel-mit.txt"],
  ["licenses/react-hook-form-mit.txt", "apps/docs/public/licenses/react-hook-form-mit.txt"],
  ["licenses/zod-mit.txt", "apps/docs/public/licenses/zod-mit.txt"],
  ["licenses/react-mit.txt", "apps/docs/public/licenses/react-mit.txt"]
];

for (const [canonicalPath, distributedPath] of licenseCopies) {
  const [canonical, distributed] = await Promise.all([read(canonicalPath), read(distributedPath)]);
  expect(
    canonical === distributed,
    `${distributedPath}: must exactly match canonical ${canonicalPath}`
  );
}

const [
  rootNotices,
  iconPackage,
  iconManifest,
  licensePage,
  footer,
  sitemap,
  mobilePackage,
  runtimeInventory,
  rollupConfig
] = await Promise.all([
  read("THIRD_PARTY_NOTICES.md"),
  readJson("packages/icons-core/package.json"),
  readJson("packages/icons-core/src/icons.manifest.json"),
  read("apps/docs/app/licenses/page.tsx"),
  read("apps/docs/app/_components/SiteFooter.tsx"),
  read("apps/docs/app/sitemap.ts"),
  readJson("packages/mobile/package.json"),
  readJson("docs/v2/runtime-dependencies.json"),
  read("tooling/rollup-config/index.mjs")
]);

expectIncludes(rootNotices, "Lucide Icons 1.34.0", "root third-party notices");
expectIncludes(rootNotices, "Feather Icons", "root third-party notices");
expectIncludes(rootNotices, "@tanstack/react-virtual` 3.14.10", "root third-party notices");
expectIncludes(rootNotices, "@tanstack/virtual-core` 3.17.8", "root third-party notices");

const shippingPackagePaths = [
  "packages/date-adapter",
  "packages/form-react",
  "packages/icons-core",
  "packages/icons-react",
  "packages/mobile",
  "packages/primitives-react",
  "packages/tokens"
];
const packagePathByName = new Map();
const declaredRuntime = new Map();
const dependencySections = [
  ["dependencies", "dependency"],
  ["peerDependencies", "peerDependency"],
  ["optionalDependencies", "optionalDependency"]
];

for (const packagePath of shippingPackagePaths) {
  const packageJson = await readJson(`${packagePath}/package.json`);
  packagePathByName.set(packageJson.name, packagePath);

  for (const [section, kind] of dependencySections) {
    for (const [name, range] of Object.entries(packageJson[section] ?? {})) {
      if (name.startsWith("@meu/")) continue;
      const declarations = declaredRuntime.get(name) ?? [];
      declarations.push({ package: packageJson.name, kind, range });
      declaredRuntime.set(name, declarations);
    }
  }
}

const sortDeclarations = (declarations) =>
  [...declarations].sort((left, right) =>
    `${left.package}:${left.kind}:${left.range}`.localeCompare(
      `${right.package}:${right.kind}:${right.range}`
    )
  );
const expectedRuntimeNames = [...declaredRuntime.keys()].sort();
const inventoryNames = (runtimeInventory.entries ?? []).map((entry) => entry.name);

expect(runtimeInventory.schemaVersion === 1, "runtime dependency inventory schema drifted");
expect(
  runtimeInventory.deliveryModel === "external-package",
  "runtime dependency delivery model must remain external-package"
);
expect(
  JSON.stringify(inventoryNames) === JSON.stringify(expectedRuntimeNames),
  `runtime dependency inventory names drifted: expected ${expectedRuntimeNames.join(", ")}`
);
expectIncludes(
  rollupConfig,
  "Object.keys(packageJson.dependencies ?? {})",
  "Rollup dependency externalization"
);
expectIncludes(
  rollupConfig,
  "Object.keys(packageJson.peerDependencies ?? {})",
  "Rollup peer dependency externalization"
);
expectIncludes(
  rollupConfig,
  "Object.keys(packageJson.optionalDependencies ?? {})",
  "Rollup optional dependency externalization"
);

for (const entry of runtimeInventory.entries ?? []) {
  const expectedDeclarations = sortDeclarations(declaredRuntime.get(entry.name) ?? []);
  expect(
    JSON.stringify(sortDeclarations(entry.declarations ?? [])) ===
      JSON.stringify(expectedDeclarations),
    `${entry.name}: declaration list drifted`
  );
  expect(entry.license === "MIT", `${entry.name}: expected reviewed MIT license`);
  expect(entry.bundled === false, `${entry.name}: must remain external to Meu JavaScript output`);
  expect(
    typeof entry.sourceLicenseUrl === "string" && entry.sourceLicenseUrl.startsWith("https://"),
    `${entry.name}: missing authoritative license source URL`
  );

  const declaration = expectedDeclarations[0];
  if (!declaration) continue;
  const installedPackage = JSON.parse(
    await readFile(
      resolve(
        workspaceRoot,
        packagePathByName.get(declaration.package),
        "node_modules",
        entry.name,
        "package.json"
      ),
      "utf8"
    )
  );
  expect(
    installedPackage.version === entry.resolvedVersion,
    `${entry.name}: resolved version ${installedPackage.version} != ${entry.resolvedVersion}`
  );
  expect(installedPackage.license === entry.license, `${entry.name}: installed license drifted`);

  const canonicalLicense = await read(entry.licenseFile);
  expectIncludes(canonicalLicense, "MIT License", `${entry.name} canonical license`);
  expectIncludes(rootNotices, `\`${entry.name}\``, "root third-party notices");
  expectIncludes(rootNotices, entry.resolvedVersion, "root third-party notices");
  expectIncludes(
    licensePage,
    `/licenses/${entry.licenseFile.split("/").at(-1)}`,
    "docs license page"
  );

  const installedLicensePath = resolve(
    workspaceRoot,
    packagePathByName.get(declaration.package),
    "node_modules",
    entry.name,
    "LICENSE"
  );
  if (entry.name === "embla-carousel-react") {
    expectIncludes(canonicalLicense, "Copyright (c) David Jerleke.", "Embla canonical license");
  } else {
    const installedLicense = await readFile(installedLicensePath, "utf8");
    expect(
      installedLicense.trim() === canonicalLicense.trim(),
      `${entry.name}: canonical license differs from installed package`
    );
  }
}

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
  "/licenses/tanstack-virtual-mit.txt",
  "/licenses/floating-ui-mit.txt",
  "/licenses/vanilla-extract-mit.txt",
  "/licenses/embla-carousel-mit.txt",
  "/licenses/react-hook-form-mit.txt",
  "/licenses/zod-mit.txt",
  "/licenses/react-mit.txt"
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
    "Third-party notice gate passed: direct runtime inventory, externalization, canonical license copies, 5 icon provenance records, docs disclosure, and packed notices verified.\n"
  );
}
