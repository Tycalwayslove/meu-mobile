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
  const validHeadings = requiredDocsSections
    .map((section) => {
      if (section === "基础用法") return `## ${section}\n\n\`\`\`tsx\n<MeuButton />\n\`\`\``;
      if (section === "Props" || section === "Events") {
        return `## ${section}\n\n| 名称 | 说明 |\n| --- | --- |\n| \`value\` | 已说明 |`;
      }
      return `## ${section}\n\n已记录。`;
    })
    .join("\n\n");
  const valid = parseComponentDocs(
    `---
name: Button
slug: button
package: "@meu/example"
exports:
  [
    MeuButton
  ]
status: audit
localVerification: complete
localGapIds: []
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
  assert.deepEqual(valid, {
    declaredExports: ["MeuButton"],
    issues: [],
    localGapIds: [],
    localVerification: "complete"
  });

  const invalid = parseComponentDocs(
    `---
name: WrongButton
slug: button
package: "@meu/example"
exports: [MissingButton]
status: audit
localVerification: pending
localGapIds: [LOC-WRONG-01]
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
  assert.equal(
    invalid.issues.some((issue) => issue.includes("another component")),
    true
  );
});

test("parseComponentDocs blocks commercial status until local verification is complete", () => {
  const headings = requiredDocsSections
    .map((section) => {
      if (section === "基础用法") return `## ${section}\n\n\`\`\`tsx\n<MeuButton />\n\`\`\``;
      return `## ${section}\n\n\`value\` 已记录。`;
    })
    .join("\n\n");
  const parsed = parseComponentDocs(
    `---
name: Button
slug: button
package: "@meu/example"
exports: [MeuButton]
status: commercial
localVerification: pending
localGapIds: [LOC-BUTTON-01]
priority: P0
since: 0.1.0
lastReviewed: 2026-08-30
source: packages/example/src/Button
---
# Button

${headings}
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
    parsed.issues.includes("frontmatter status commercial requires localVerification complete"),
    true
  );
});

test("buildComponentManifest maps shared modules to product-specific documents", () => {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), "meu-manifest-"));
  try {
    mkdirSync(path.join(fixtureRoot, "packages/example/src/Button"), { recursive: true });
    writeFileSync(
      path.join(fixtureRoot, "packages/example/src/index.ts"),
      'export { MeuButton, ThemeButton } from "./Button";\nexport type { MeuButtonProps, ThemeButtonProps } from "./Button";\n'
    );
    writeFileSync(
      path.join(fixtureRoot, "packages/example/src/Button/index.ts"),
      "export const MeuButton = 1; export const ThemeButton = 2; export type MeuButtonProps = {}; export type ThemeButtonProps = {};\n"
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
        publicExportNames: ["MeuButton", "MeuButtonProps"],
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
        publicExportNames: ["ThemeButton", "ThemeButtonProps"],
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
    assert.deepEqual(themeProduct.publicExports, [
      { kind: "value", name: "ThemeButton" },
      { kind: "type", name: "ThemeButtonProps" }
    ]);
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
  assert.equal(
    manifest.summary.locallyVerifiedProducts,
    manifest.products.filter((item) => item.localVerification === "complete").length
  );
  assert.equal(
    manifest.summary.productsWithLocalGaps,
    manifest.products.filter((item) => item.localVerification === "pending").length
  );
  const button = manifest.products.find((item) => item.slug === "button");
  const cell = manifest.products.find((item) => item.slug === "cell");
  const configProvider = manifest.products.find((item) => item.slug === "config-provider");
  const form = manifest.products.find((item) => item.slug === "form");
  const list = manifest.products.find((item) => item.slug === "list");
  const themeProvider = manifest.products.find((item) => item.slug === "theme-provider");
  assert.ok(button);
  assert.ok(cell);
  assert.ok(configProvider);
  assert.ok(form);
  assert.ok(list);
  assert.ok(themeProvider);
  assert.equal(
    button.publicExports.some((item) => item.name === "Button" && item.kind === "value"),
    true
  );
  assert.equal(
    form.publicExports.some((item) => item.name === "MeuForm" && item.kind === "value"),
    true
  );
  assert.equal(
    form.publicExports.some((item) => item.name === "MeuFormTextInput" && item.kind === "value"),
    true
  );
  assert.equal(
    form.publicExports.some((item) => item.name === "useMeuForm" && item.kind === "value"),
    true
  );
  assert.deepEqual(
    cell.publicExports.map((item) => item.name),
    ["Cell", "CellProps", "CellRef"]
  );
  assert.deepEqual(
    list.publicExports.map((item) => item.name),
    ["List", "ListDivider", "ListMode", "ListProps"]
  );
  assert.deepEqual(
    configProvider.publicExports.map((item) => item.name),
    ["ConfigProvider", "ConfigProviderProps", "MeuConfig", "MeuLocale", "MeuTheme", "useMeuConfig"]
  );
  assert.deepEqual(
    themeProvider.publicExports.map((item) => item.name),
    ["ThemeProvider"]
  );
  assert.equal(
    serializeManifest(manifest),
    serializeManifest(buildComponentManifest(workspaceRoot, componentDocs))
  );
});
