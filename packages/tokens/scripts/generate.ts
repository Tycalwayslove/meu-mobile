import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type TokenLeaf = {
  $type?: string;
  $value: unknown;
};

type TokenTree = Record<string, TokenLeaf | TokenTree>;

const sourcePath = process.env.MEU_DESIGN_TOKENS_PATH
  ? resolve(process.env.MEU_DESIGN_TOKENS_PATH)
  : resolve(import.meta.dirname, "../../../meu-design/tokens.json");
const outputDirectory = resolve(import.meta.dirname, "../src");
const committedSnapshotPath = resolve(outputDirectory, "figma.generated.json");

async function readTokenSource(): Promise<string> {
  try {
    return await readFile(sourcePath, "utf8");
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return readFile(committedSnapshotPath, "utf8");
    }
    throw error;
  }
}

function isTokenLeaf(value: unknown): value is TokenLeaf {
  return typeof value === "object" && value !== null && "$value" in value;
}

function lookup(root: TokenTree, path: string): TokenLeaf {
  const segments = path.split(".");
  if (segments[0] === "meu") {
    segments.shift();
  }
  let current: TokenLeaf | TokenTree = root;

  for (const segment of segments) {
    if (isTokenLeaf(current) || !(segment in current)) {
      throw new Error(`Unknown token reference: ${path}`);
    }
    current = current[segment] as TokenLeaf | TokenTree;
  }

  if (!isTokenLeaf(current)) {
    throw new Error(`Token reference does not point to a value: ${path}`);
  }

  return current;
}

function quoteFontFamily(value: string): string {
  if (value === "sans-serif" || value === "serif" || value === "monospace") {
    return value;
  }
  return value.includes(" ") ? `"${value}"` : value;
}

function cssValue(value: unknown, root: TokenTree): string {
  if (typeof value === "string") {
    const reference = value.match(/^\{(.+)\}$/);
    if (reference && reference[1]) {
      return cssValue(lookup(root, reference[1]).$value, root);
    }
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "number") && value.length === 4) {
      return `cubic-bezier(${value.join(", ")})`;
    }
    return value.map((item) => quoteFontFamily(String(item))).join(", ");
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    if ("offsetX" in record && "offsetY" in record && "blur" in record && "color" in record) {
      const spread = "spread" in record ? String(record.spread) : "0px";
      return `${String(record.offsetX)} ${String(record.offsetY)} ${String(record.blur)} ${spread} ${String(record.color)}`;
    }
  }

  throw new Error(`Unsupported CSS token value: ${JSON.stringify(value)}`);
}

function variableName(path: string[]): string {
  return `--meu-${path.join("-")}`;
}

function collectDeclarations(
  tree: TokenTree,
  root: TokenTree,
  path: string[] = []
): Array<[string, string]> {
  const declarations: Array<[string, string]> = [];

  for (const [key, value] of Object.entries(tree)) {
    const nextPath = [...path, key];
    if (!isTokenLeaf(value)) {
      declarations.push(...collectDeclarations(value, root, nextPath));
      continue;
    }

    if (value.$type === "typography" && typeof value.$value === "object" && value.$value !== null) {
      for (const [property, propertyValue] of Object.entries(value.$value)) {
        const cssProperty = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        declarations.push([
          variableName([...nextPath, cssProperty]),
          cssValue(propertyValue, root)
        ]);
      }
      continue;
    }

    declarations.push([variableName(nextPath), cssValue(value.$value, root)]);
  }

  return declarations;
}

function declarationBlock(selector: string, declarations: Array<[string, string]>): string {
  const body = declarations.map(([name, value]) => `  ${name}: ${value};`).join("\n");
  return `${selector} {\n${body}\n}`;
}

function buildCss(tokens: TokenTree): string {
  const colorTree = tokens.color as TokenTree;
  const lightColors = collectDeclarations(colorTree.light as TokenTree, tokens, ["color"]);
  const darkColors = collectDeclarations(colorTree.dark as TokenTree, tokens, ["color"]);
  const nonColorTokens: TokenTree = Object.fromEntries(
    Object.entries(tokens).filter(([key]) => key !== "color")
  );
  const shared = collectDeclarations(nonColorTokens, tokens);
  const light = [...shared, ...lightColors];

  return [
    declarationBlock(":root, [data-meu-theme='light'], [data-meu-theme='system']", light),
    "",
    declarationBlock("[data-meu-theme='dark']", darkColors),
    "",
    "@media (prefers-color-scheme: dark) {",
    declarationBlock("  [data-meu-theme='system']", darkColors)
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n"),
    "}",
    ""
  ].join("\n");
}

async function generate(): Promise<void> {
  const source = await readTokenSource();
  const parsed = JSON.parse(source) as { meu: TokenTree };
  const hash = createHash("sha256").update(source).digest("hex");
  const generatedTs = [
    "// Generated from meu-design/tokens.json. Do not edit by hand.",
    `export const meuTokens = ${JSON.stringify(parsed.meu, null, 2)} as const;`,
    "",
    "export type MeuTokens = typeof meuTokens;",
    ""
  ].join("\n");
  const lock = JSON.stringify(
    {
      source: "meu-design/tokens.json",
      sha256: hash
    },
    null,
    2
  );

  await Promise.all([
    writeFile(resolve(outputDirectory, "generated.ts"), generatedTs, "utf8"),
    writeFile(resolve(outputDirectory, "theme.css"), buildCss(parsed.meu), "utf8"),
    writeFile(resolve(outputDirectory, "figma.generated.json"), `${source.trim()}\n`, "utf8"),
    writeFile(resolve(outputDirectory, "tokens.lock.json"), `${lock}\n`, "utf8")
  ]);
}

await generate();
