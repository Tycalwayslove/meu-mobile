import { describe, expect, it } from "vitest";

import {
  getComponentDocument,
  getComponentManifestProduct,
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
});

describe("generated manifest integration", () => {
  const maintainedSlugs = ["button", "text-input", "popup", "carousel", "number-keyboard"];

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
    const iconButton = getComponentManifestProduct("icon-button");
    expect(iconButton && iconButton.hasDocs).toBe(false);
    expect(getComponentDocument("icon-button")).toBeUndefined();
  });
});
