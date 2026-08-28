import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { componentDocs } from "../apps/docs/app/_data/components";
import {
  buildComponentManifest,
  parseComponentDocs,
  parseModuleExports,
  requiredDocsSections,
  serializeManifest,
  type ProductComponent
} from "./lib/component-manifest";

test("parseModuleExports distinguishes values, types and wildcard exports", () => {
  const parsed = parseModuleExports(`
    export { Button, type ButtonProps, Original as Alias } from "./Button";
    export type { Theme } from "./theme";
    export * from "react-hook-form";
  `);

  assert.deepEqual(parsed, {
    exports: [
      {
        importedName: "Button",
        kind: "value",
        moduleSpecifier: "./Button",
        name: "Button"
      },
      {
        importedName: "ButtonProps",
        kind: "type",
        moduleSpecifier: "./Button",
        name: "ButtonProps"
      },
      {
        importedName: "Original",
        kind: "value",
        moduleSpecifier: "./Button",
        name: "Alias"
      },
      {
        importedName: "Theme",
        kind: "type",
        moduleSpecifier: "./theme",
        name: "Theme"
      }
    ],
    starModules: ["react-hook-form"]
  });
});

test("parseComponentDocs validates metadata, public values and required sections", () => {
  const validHeadings = requiredDocsSections.map((section) => `## ${section}`).join("\n\n");
  const valid = parseComponentDocs(
    `---
name: Button
slug: button
package: "@meu/example"
exports: [MeuButton]
status: audit
priority: P0
since: 0.1.0
lastReviewed: 2026-08-28
source: packages/example/src/Button
---
# Button

${validHeadings}
`,
    {
      name: "Button",
      packageName: "@meu/example",
      slug: "button",
      sourcePath: "packages/example/src/Button"
    },
    [{ kind: "value", name: "MeuButton" }]
  );
  assert.deepEqual(valid, { declaredExports: ["MeuButton"], issues: [] });

  const invalid = parseComponentDocs(
    `---
name: WrongButton
slug: button
package: "@meu/example"
exports: [MissingButton]
status: audit
priority: P0
since: 0.1.0
lastReviewed: 2026-08-28
source: packages/example/src/Button
---
# Button
`,
    {
      name: "Button",
      packageName: "@meu/example",
      slug: "button",
      sourcePath: "packages/example/src/Button"
    },
    [{ kind: "value", name: "MeuButton" }]
  );
  assert.equal(
    invalid.issues.some((issue) => issue.includes("frontmatter name")),
    true
  );
  assert.equal(
    invalid.issues.some((issue) => issue.includes("non-public value")),
    true
  );
  assert.equal(
    invalid.issues.some((issue) => issue.includes("当前能力")),
    true
  );
});

test("buildComponentManifest maps shared modules to product-specific documents", () => {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), "meu-manifest-"));
  try {
    mkdirSync(path.join(fixtureRoot, "packages/example/src/Button"), { recursive: true });
    writeFileSync(
      path.join(fixtureRoot, "packages/example/src/index.ts"),
      'export { MeuButton } from "./Button";\nexport type { MeuButtonProps } from "./Button";\n'
    );
    writeFileSync(
      path.join(fixtureRoot, "packages/example/src/Button/index.ts"),
      "export const MeuButton = 1; export type MeuButtonProps = {};\n"
    );
    writeFileSync(
      path.join(fixtureRoot, "packages/example/src/Button/Button.docs.mdx"),
      "# Button\n"
    );
    writeFileSync(
      path.join(fixtureRoot, "packages/example/src/Button/ThemeButton.docs.mdx"),
      "# ThemeButton\n"
    );
    const products: ProductComponent[] = [
      {
        category: "actions",
        description: "Action",
        highlights: [],
        name: "Button",
        packageName: "@meu/example",
        priority: "P0",
        slug: "button",
        sourcePath: "packages/example/src/Button"
      },
      {
        category: "actions",
        description: "Themed action",
        highlights: [],
        name: "ThemeButton",
        packageName: "@meu/example",
        priority: "P0",
        slug: "theme-button",
        sourcePath: "packages/example/src/Button"
      }
    ];
    const manifest = buildComponentManifest(fixtureRoot, products, [
      { entryPath: "packages/example/src/index.ts", packageName: "@meu/example" }
    ]);

    assert.equal(manifest.summary.documentedProducts, 2);
    const product = manifest.products[0];
    assert.ok(product);
    assert.deepEqual(product.publicExports, [
      { kind: "value", name: "MeuButton" },
      { kind: "type", name: "MeuButtonProps" }
    ]);
    assert.equal(product.docsPath, "packages/example/src/Button/Button.docs.mdx");
    const themeProduct = manifest.products[1];
    assert.ok(themeProduct);
    assert.equal(themeProduct.docsPath, "packages/example/src/Button/ThemeButton.docs.mdx");
  } finally {
    rmSync(fixtureRoot, { force: true, recursive: true });
  }
});

test("workspace manifest covers the four packages and all declared product entries", () => {
  const workspaceRoot = path.resolve(import.meta.dirname, "..");
  const manifest = buildComponentManifest(workspaceRoot, componentDocs);

  assert.equal(manifest.packages.length, 4);
  assert.equal(manifest.products.length, 68);
  const button = manifest.products.find((item) => item.slug === "button");
  const form = manifest.products.find((item) => item.slug === "form");
  assert.ok(button);
  assert.ok(form);
  assert.equal(
    button.publicExports.some((item) => item.name === "Button" && item.kind === "value"),
    true
  );
  assert.equal(
    form.publicExports.some((item) => item.name === "MeuForm" && item.kind === "value"),
    true
  );
  assert.equal(
    serializeManifest(manifest),
    serializeManifest(buildComponentManifest(workspaceRoot, componentDocs))
  );
});
