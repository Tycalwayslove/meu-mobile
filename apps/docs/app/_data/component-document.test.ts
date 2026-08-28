import { describe, expect, it } from "vitest";

import {
  getComponentDocument,
  getComponentManifestProduct,
  getComponentSourceHref,
  getDocumentedComponentSlugs,
  getUndocumentedComponentSlugs,
  parseComponentDocumentSource,
  type ComponentManifestProduct
} from "./component-document";

const fixtureProduct: ComponentManifestProduct = {
  declaredExports: ["Button"],
  description: "A button",
  docsIssues: [],
  docsPath: "packages/mobile/src/Button/Button.docs.mdx",
  hasDocs: true,
  name: "Button",
  packageName: "@meu/mobile",
  priority: "P0",
  publicExports: [
    { kind: "value", name: "Button" },
    { kind: "type", name: "ButtonProps" }
  ],
  slug: "button",
  sourcePath: "packages/mobile/src/Button",
  storyId: "actions-button--solid"
};

describe("component document parser", () => {
  it("parses maintained metadata and the supported static Markdown blocks", () => {
    const document = parseComponentDocumentSource(
      `---
name: Button
slug: button
package: "@meu/mobile"
exports: [Button]
status: audit
since: 0.1.0
lastReviewed: 2026-08-28
figma:
  fileKey: example
  nodeId: "10:20"
storyIds:
  [actions-button--solid, actions-button--loading]
---
# Button

## 基础用法

Use \`tone\` to set the action hierarchy.

\`\`\`tsx
<Button>Save</Button>
\`\`\`

## 键盘操作

| Key | Result |
| --- | --- |
| Enter | Activate |

### Note

- Native button
- Keyboard equivalent
`,
      fixtureProduct
    );

    expect(document.frontmatter).toMatchObject({
      exports: ["Button"],
      figma: { fileKey: "example", nodeId: "10:20" },
      lastReviewed: "2026-08-28",
      packageName: "@meu/mobile",
      since: "0.1.0",
      status: "audit",
      storyIds: ["actions-button--solid", "actions-button--loading"]
    });
    expect(document.sections.map((section) => section.title)).toEqual(["基础用法", "键盘操作"]);
    expect(document.sections[0] && document.sections[0].blocks.map((block) => block.type)).toEqual([
      "paragraph",
      "code"
    ]);
    expect(document.sections[1] && document.sections[1].blocks.map((block) => block.type)).toEqual([
      "table",
      "heading",
      "list"
    ]);
  });

  it("keeps union pipes inside inline code when parsing tables", () => {
    const document = parseComponentDocumentSource(
      `# Button

## Props

| Prop | Type | Description |
| --- | --- | --- |
| inputMode | \`"numeric" | "text"\` | Keyboard mode |
| status | \`"default" \\| "error"\` | Validation state |
`,
      fixtureProduct
    );
    const firstSection = document.sections[0];
    const table = firstSection ? firstSection.blocks[0] : undefined;
    expect(table && table.type === "table" ? table.rows : []).toEqual([
      ["inputMode", '`"numeric" | "text"`', "Keyboard mode"],
      ["status", '`"default" | "error"`', "Validation state"]
    ]);
  });

  it("links source directories and extensionless source modules correctly", () => {
    expect(getComponentSourceHref("packages/mobile/src/Button")).toContain(
      "/tree/main/packages/mobile/src/Button"
    );
    expect(getComponentSourceHref("packages/form-react/src/MeuForm")).toContain(
      "/blob/main/packages/form-react/src/MeuForm.tsx"
    );
    expect(getComponentSourceHref("packages/icons-react/src/MeuIcon")).toContain(
      "/blob/main/packages/icons-react/src/MeuIcon.tsx"
    );
  });
});

describe("generated manifest integration", () => {
  const maintainedSlugs = getDocumentedComponentSlugs();

  it("discovers every maintained document from the manifest", () => {
    expect(maintainedSlugs).toEqual(
      expect.arrayContaining(["button", "text-input", "popup", "carousel", "number-keyboard"])
    );
  });

  it.each(maintainedSlugs)("loads %s from its colocated document", (slug) => {
    const document = getComponentDocument(slug);
    expect(document).toBeDefined();
    if (!document) throw new Error(`Expected maintained documentation for ${slug}`);
    expect(document.frontmatter.slug).toBe(slug);
    expect(document.frontmatter.storyIds.length).toBeGreaterThan(0);
    expect(document.product.publicExports.length).toBeGreaterThan(0);
    expect(document.sections.map((section) => section.title)).toEqual(
      expect.arrayContaining(["基础用法", "Props", "Events", "无障碍", "变更记录"])
    );
  });

  it("keeps undocumented catalog entries on the legacy page path", () => {
    const undocumentedSlug = getUndocumentedComponentSlugs()[0];
    if (undocumentedSlug === undefined) return;

    const product = getComponentManifestProduct(undocumentedSlug);
    expect(product && product.hasDocs).toBe(false);
    expect(getComponentDocument(undocumentedSlug)).toBeUndefined();
  });
});
