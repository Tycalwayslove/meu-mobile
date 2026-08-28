import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import componentManifest from "../_generated/component-manifest.json";

export type ComponentManifestExport = {
  kind: "type" | "value";
  name: string;
};

export type ComponentManifestProduct = {
  declaredExports: string[];
  description: string;
  docsIssues: string[];
  docsPath: string;
  hasDocs: boolean;
  name: string;
  packageName: string;
  priority: string;
  publicExports: ComponentManifestExport[];
  slug: string;
  sourcePath: string;
  storyId?: string;
};

export type ComponentDocumentFrontmatter = {
  exports: string[];
  figma?: {
    fileKey?: string;
    nodeId?: string;
  };
  implementedVersion?: string;
  lastReviewed?: string;
  name?: string;
  packageName?: string;
  priority?: string;
  since?: string;
  slug?: string;
  source?: string;
  status?: string;
  storyIds: string[];
};

export type ComponentDocumentBlock =
  | { language: string; type: "code"; value: string }
  | { depth: 3; id: string; text: string; type: "heading" }
  | { items: string[]; ordered: boolean; type: "list" }
  | { text: string; type: "paragraph" }
  | { headers: string[]; rows: string[][]; type: "table" };

export type ComponentDocumentSection = {
  blocks: ComponentDocumentBlock[];
  id: string;
  title: string;
};

export type ComponentDocument = {
  frontmatter: ComponentDocumentFrontmatter;
  product: ComponentManifestProduct;
  sections: ComponentDocumentSection[];
};

type FrontmatterValue = null | string | string[] | Record<string, null | string | string[]>;

const products = (componentManifest.products as ComponentManifestProduct[]).map((product) => ({
  ...product,
  declaredExports: [...product.declaredExports],
  docsIssues: [...product.docsIssues],
  publicExports: [...product.publicExports]
}));

const productsBySlug = new Map(products.map((product) => [product.slug, product]));
const documentCache = new Map<string, ComponentDocument>();

function stripQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseArray(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  return trimmed.slice(1, -1).split(",").map(stripQuotes).filter(Boolean);
}

function parseScalar(value: string): null | string | string[] {
  const trimmed = value.trim();
  if (trimmed === "null" || trimmed === "~") return null;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return parseArray(trimmed);
  return stripQuotes(trimmed);
}

function parseFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { body: source, values: {} as Record<string, FrontmatterValue> };

  const values: Record<string, FrontmatterValue> = {};
  const lines = match[1]!.split(/\r?\n/);
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]!;
    const topLevel = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!topLevel) {
      index += 1;
      continue;
    }

    const key = topLevel[1]!;
    let rawValue = topLevel[2]!.trim();

    if (rawValue.startsWith("[") && !rawValue.includes("]")) {
      index += 1;
      while (index < lines.length) {
        rawValue += ` ${lines[index]!.trim()}`;
        if (lines[index]!.includes("]")) break;
        index += 1;
      }
      values[key] = parseScalar(rawValue);
      index += 1;
      continue;
    }

    if (rawValue === "") {
      const following = (lines[index + 1] || "").trim();
      if (following.startsWith("[")) {
        rawValue = following;
        index += 2;
        while (index < lines.length && !rawValue.includes("]")) {
          rawValue += ` ${lines[index]!.trim()}`;
          index += 1;
        }
        values[key] = parseScalar(rawValue);
        continue;
      }

      const nested: Record<string, null | string | string[]> = {};
      index += 1;
      while (index < lines.length) {
        const nestedLine = lines[index]!;
        if (!/^\s+/.test(nestedLine)) break;
        const nestedMatch = nestedLine.match(/^\s+([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
        if (nestedMatch) nested[nestedMatch[1]!] = parseScalar(nestedMatch[2]!);
        index += 1;
      }
      values[key] = nested;
      continue;
    }

    values[key] = parseScalar(rawValue);
    index += 1;
  }

  return { body: source.slice(match[0].length), values };
}

function readString(values: Record<string, FrontmatterValue>, key: string) {
  const value = values[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readArray(values: Record<string, FrontmatterValue>, key: string) {
  const value = values[key];
  return Array.isArray(value) ? value : [];
}

function headingId(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("zh-CN")
    .replace(/[\s/]+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]/gu, "")
    .replace(/-+/g, "-");
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string) {
  const cells = parseTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function beginsBlock(lines: string[], index: number) {
  const line = lines[index] || "";
  const nextLine = lines[index + 1] || "";
  return (
    /^#{2,3}\s+/.test(line) ||
    /^```/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    (line.trim().startsWith("|") && isTableDivider(nextLine))
  );
}

function parseSections(body: string) {
  const lines = body.split(/\r?\n/);
  const sections: ComponentDocumentSection[] = [];
  let current: ComponentDocumentSection | undefined;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]!;
    if (line.trim() === "" || /^#\s+/.test(line)) {
      index += 1;
      continue;
    }

    const sectionHeading = line.match(/^##\s+(.+?)\s*$/);
    if (sectionHeading) {
      current = {
        blocks: [],
        id: headingId(sectionHeading[1]!),
        title: sectionHeading[1]!.trim()
      };
      sections.push(current);
      index += 1;
      continue;
    }

    if (!current) {
      index += 1;
      continue;
    }

    const subheading = line.match(/^###\s+(.+?)\s*$/);
    if (subheading) {
      current.blocks.push({
        depth: 3,
        id: headingId(`${current.title}-${subheading[1]!}`),
        text: subheading[1]!.trim(),
        type: "heading"
      });
      index += 1;
      continue;
    }

    const codeFence = line.match(/^```([^\s]*)\s*$/);
    if (codeFence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index]!)) {
        codeLines.push(lines[index]!);
        index += 1;
      }
      current.blocks.push({
        language: codeFence[1] || "text",
        type: "code",
        value: codeLines.join("\n")
      });
      index += 1;
      continue;
    }

    if (line.trim().startsWith("|") && isTableDivider(lines[index + 1] || "")) {
      const headers = parseTableRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index]!.trim().startsWith("|")) {
        rows.push(parseTableRow(lines[index]!));
        index += 1;
      }
      current.blocks.push({ headers, rows, type: "table" });
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      const items: string[] = [];
      const pattern = isOrdered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/;
      while (index < lines.length) {
        const item = lines[index]!.match(pattern);
        if (!item) break;
        items.push(item[1]!);
        index += 1;
      }
      current.blocks.push({ items, ordered: isOrdered, type: "list" });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index]!.trim() !== "" && !beginsBlock(lines, index)) {
      paragraph.push(lines[index]!.trim());
      index += 1;
    }
    if (paragraph.length > 0) {
      current.blocks.push({ text: paragraph.join(" "), type: "paragraph" });
      continue;
    }

    index += 1;
  }

  return sections;
}

export function parseComponentDocumentSource(
  source: string,
  product: ComponentManifestProduct
): ComponentDocument {
  const { body, values } = parseFrontmatter(source);
  const figmaValue = values.figma;
  const figma =
    figmaValue && !Array.isArray(figmaValue) && typeof figmaValue === "object"
      ? {
          ...(typeof figmaValue.fileKey === "string" ? { fileKey: figmaValue.fileKey } : {}),
          ...(typeof figmaValue.nodeId === "string" ? { nodeId: figmaValue.nodeId } : {})
        }
      : undefined;

  const frontmatter: ComponentDocumentFrontmatter = {
    exports: readArray(values, "exports"),
    storyIds: readArray(values, "storyIds")
  };
  if (figma && Object.keys(figma).length > 0) frontmatter.figma = figma;
  const implementedVersion = readString(values, "implementedVersion");
  const lastReviewed = readString(values, "lastReviewed");
  const name = readString(values, "name");
  const packageName = readString(values, "package");
  const priority = readString(values, "priority");
  const since = readString(values, "since");
  const slug = readString(values, "slug");
  const sourcePath = readString(values, "source");
  const status = readString(values, "status");
  if (implementedVersion) frontmatter.implementedVersion = implementedVersion;
  if (lastReviewed) frontmatter.lastReviewed = lastReviewed;
  if (name) frontmatter.name = name;
  if (packageName) frontmatter.packageName = packageName;
  if (priority) frontmatter.priority = priority;
  if (since) frontmatter.since = since;
  if (slug) frontmatter.slug = slug;
  if (sourcePath) frontmatter.source = sourcePath;
  if (status) frontmatter.status = status;

  return {
    frontmatter,
    product,
    sections: parseSections(body)
  };
}

export function getComponentManifestProduct(slug: string) {
  return productsBySlug.get(slug);
}

export function getDocumentedComponentSlugs() {
  return products.filter((product) => product.hasDocs).map((product) => product.slug);
}

export function getUndocumentedComponentSlugs() {
  return products.filter((product) => !product.hasDocs).map((product) => product.slug);
}

export function getComponentDocument(slug: string) {
  const cached = documentCache.get(slug);
  if (cached) return cached;

  const product = getComponentManifestProduct(slug);
  if (!product || !product.hasDocs) return undefined;
  if (product.docsIssues.length > 0) {
    throw new Error(
      `Invalid component documentation for ${slug}: ${product.docsIssues.join("; ")}`
    );
  }

  if (!product.docsPath.startsWith("packages/")) {
    throw new Error(`Component documentation escaped the workspace: ${product.docsPath}`);
  }
  const packagesRoot = path.resolve(process.cwd(), "../../packages");
  const absolutePath = path.resolve(packagesRoot, product.docsPath.slice("packages/".length));
  const packagesPrefix = `${packagesRoot}${path.sep}`;
  if (!absolutePath.startsWith(packagesPrefix)) {
    throw new Error(`Component documentation escaped the packages directory: ${product.docsPath}`);
  }
  if (!existsSync(absolutePath)) {
    throw new Error(`Manifest documentation is missing: ${product.docsPath}`);
  }

  const document = parseComponentDocumentSource(readFileSync(absolutePath, "utf8"), product);
  documentCache.set(slug, document);
  return document;
}
