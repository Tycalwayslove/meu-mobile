import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const workspaceRoot = resolve(import.meta.dirname, "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(workspaceRoot, relativePath), "utf8"));
}

const failures = [];

function expectEqual(actual, expected, label) {
  if (actual !== expected)
    failures.push(`${label}: expected ${expected}, received ${String(actual)}`);
}

function expectIncludes(actual, expected, label) {
  if (typeof actual !== "string" || !actual.includes(expected)) {
    failures.push(`${label}: expected ${JSON.stringify(actual)} to include ${expected}`);
  }
}

const root = await readJson("package.json");
expectEqual(root.private, true, "workspace private flag");
expectEqual(root.packageManager, "pnpm@10.19.0", "workspace package manager");
expectEqual(root.engines?.node, ">=20.19.0", "workspace Node engine");

const packagePeers = {
  "packages/form-react/package.json": {
    react: ">=19.0.0 <20.0.0",
    "react-dom": ">=19.0.0 <20.0.0",
    "react-hook-form": ">=7.55.0 <8.0.0",
    zod: ">=4.0.0 <5.0.0"
  },
  "packages/icons-react/package.json": {
    react: ">=19.0.0 <20.0.0"
  },
  "packages/mobile/package.json": {
    react: ">=19.0.0 <20.0.0",
    "react-dom": ">=19.0.0 <20.0.0"
  },
  "packages/primitives-react/package.json": {
    react: ">=19.0.0 <20.0.0",
    "react-dom": ">=19.0.0 <20.0.0"
  }
};

for (const [manifestPath, expectedPeers] of Object.entries(packagePeers)) {
  const manifest = await readJson(manifestPath);
  expectEqual(manifest.private, true, `${manifest.name} private flag`);
  if (manifest.publishConfig !== undefined) {
    failures.push(
      `${manifest.name}: publishConfig must remain absent while npm publishing is disabled`
    );
  }
  if (manifest.dependencies?.next || manifest.peerDependencies?.next) {
    failures.push(`${manifest.name}: component packages must not depend on Next.js at runtime`);
  }
  for (const [name, range] of Object.entries(expectedPeers)) {
    expectEqual(manifest.peerDependencies?.[name], range, `${manifest.name} peer ${name}`);
  }
}

const reactConsumers = [
  "apps/docs/package.json",
  "apps/playground/package.json",
  "apps/storybook/package.json",
  "tests/next-h5/package.json"
];
for (const manifestPath of reactConsumers) {
  const manifest = await readJson(manifestPath);
  expectEqual(manifest.dependencies?.react, "19.2.8", `${manifest.name} tested React`);
  expectEqual(manifest.dependencies?.["react-dom"], "19.2.8", `${manifest.name} tested React DOM`);
}

for (const manifestPath of ["apps/docs/package.json", "tests/next-h5/package.json"]) {
  const manifest = await readJson(manifestPath);
  expectEqual(manifest.dependencies?.next, "16.3.3", `${manifest.name} tested Next.js`);
}

const installedNext = await readJson("apps/docs/node_modules/next/package.json");
expectEqual(installedNext.version, "16.3.3", "installed Next.js version");
expectIncludes(installedNext.peerDependencies?.react, "^19.0.0", "Next.js React 19 peer support");
expectIncludes(
  installedNext.peerDependencies?.["react-dom"],
  "^19.0.0",
  "Next.js React DOM 19 peer support"
);

const installedReactHookForm = await readJson(
  "packages/form-react/node_modules/react-hook-form/package.json"
);
expectEqual(installedReactHookForm.version, "7.86.0", "tested React Hook Form version");
expectIncludes(
  installedReactHookForm.peerDependencies?.react,
  "^19",
  "React Hook Form React 19 peer support"
);

const installedZod = await readJson("packages/form-react/node_modules/zod/package.json");
expectEqual(installedZod.version, "4.4.3", "tested Zod version");

if (failures.length > 0) {
  process.stderr.write(
    "Runtime support matrix drifted:\n" + failures.map((failure) => `- ${failure}`).join("\n")
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    "Runtime support matrix passed: React/DOM 19.2.8, Next 16.3.3 App Router, React Hook Form 7.86.0, Zod 4.4.3, Node >=20.19.0.\n"
  );
}
