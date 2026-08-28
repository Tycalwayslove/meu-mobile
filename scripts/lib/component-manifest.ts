import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

export type PublicExportKind = "type" | "value";

export type PublicExport = {
  kind: PublicExportKind;
  name: string;
  sourcePath: string;
};

export type ProductComponent = {
  category: string;
  description: string;
  highlights: readonly string[];
  name: string;
  packageName: string;
  priority: string;
  slug: string;
  sourcePath: string;
  /** Additional source prefixes whose public exports belong to this product document. */
  sourcePathPrefixes?: readonly string[];
  storyId?: string;
};

export type PackageConfig = {
  entryPath: string;
  packageName: string;
};

export const packageConfigs: readonly PackageConfig[] = [
  { packageName: "@meu/mobile", entryPath: "packages/mobile/src/index.ts" },
  { packageName: "@meu/form-react", entryPath: "packages/form-react/src/index.ts" },
  { packageName: "@meu/icons-react", entryPath: "packages/icons-react/src/index.ts" },
  {
    packageName: "@meu/primitives-react",
    entryPath: "packages/primitives-react/src/index.ts"
  }
] as const;

type ParsedExport = {
  importedName: string;
  kind: PublicExportKind;
  name: string;
  moduleSpecifier?: string;
};

type ParsedModule = {
  exports: ParsedExport[];
  starModules: string[];
};

type PackageManifest = {
  entryPath: string;
  exports: PublicExport[];
  externalWildcardExports: string[];
  packageName: string;
  stats: {
    total: number;
    types: number;
    values: number;
  };
};

type ProductManifest = ProductComponent & {
  declaredExports: string[];
  docsIssues: string[];
  docsPath: string;
  hasDocs: boolean;
  publicExports: Array<Pick<PublicExport, "kind" | "name">>;
};

export type ComponentManifest = {
  packages: PackageManifest[];
  products: ProductManifest[];
  schemaVersion: 1;
  summary: {
    documentedProducts: number;
    externalWildcardExports: number;
    packages: number;
    products: number;
    productsWithoutPublicExports: number;
    publicExports: number;
    publicTypes: number;
    publicValues: number;
    undocumentedPublicExports: number;
    unclaimedPublicValues: number;
  };
  undocumentedPublicExports: Array<PublicExport & { packageName: string }>;
  unclaimedPublicValues: Array<PublicExport & { packageName: string }>;
};

export const requiredDocsSections = [
  "当前能力",
  "何时使用",
  "何时不要使用",
  "结构与状态",
  "基础用法",
  "受控与非受控",
  "表单集成",
  "Props",
  "Events",
  "Ref 与命令式方法",
  "键盘操作",
  "触摸与手势",
  "无障碍",
  "动效",
  "主题与定制",
  "SSR 与 Next.js",
  "RTL 与国际化",
  "浏览器与 WebView",
  "边界情况与已知限制",
  "性能预算",
  "测试证据",
  "V2 优化记录",
  "变更记录"
] as const;

function hasExportModifier(node: ts.Node) {
  return ts.canHaveModifiers(node)
    ? (ts.getModifiers(node) || []).some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
    : false;
}

function bindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : bindingNames(element.name)
  );
}

export function parseModuleExports(sourceText: string, fileName = "index.ts"): ParsedModule {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const exports: ParsedExport[] = [];
  const starModules: string[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement)) {
      const moduleSpecifier =
        statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
          ? statement.moduleSpecifier.text
          : undefined;

      if (!statement.exportClause) {
        if (moduleSpecifier) starModules.push(moduleSpecifier);
        continue;
      }

      if (!ts.isNamedExports(statement.exportClause)) continue;
      for (const element of statement.exportClause.elements) {
        exports.push({
          importedName: element.propertyName ? element.propertyName.text : element.name.text,
          kind: statement.isTypeOnly || element.isTypeOnly ? "type" : "value",
          name: element.name.text,
          ...(moduleSpecifier ? { moduleSpecifier } : {})
        });
      }
      continue;
    }

    if (!hasExportModifier(statement)) continue;
    if (
      ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEnumDeclaration(statement)
    ) {
      if (!statement.name) continue;
      exports.push({
        importedName: statement.name.text,
        kind:
          ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)
            ? "type"
            : "value",
        name: statement.name.text
      });
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        for (const name of bindingNames(declaration.name)) {
          exports.push({ importedName: name, kind: "value", name });
        }
      }
    }
  }

  return { exports, starModules };
}

function stripModuleExtension(filePath: string) {
  return filePath.replace(/\.(?:[cm]?[jt]sx?)$/, "").replace(/\/index$/, "");
}

function relativeSourcePath(workspaceRoot: string, filePath: string) {
  return stripModuleExtension(path.relative(workspaceRoot, filePath).split(path.sep).join("/"));
}

function resolveLocalModule(importerPath: string, moduleSpecifier: string) {
  const candidate = path.resolve(path.dirname(importerPath), moduleSpecifier);
  const candidates = [
    candidate,
    `${candidate}.ts`,
    `${candidate}.tsx`,
    `${candidate}.mts`,
    `${candidate}.cts`,
    path.join(candidate, "index.ts"),
    path.join(candidate, "index.tsx")
  ];
  return candidates.find((entry) => existsSync(entry) && statSync(entry).isFile());
}

function collectModuleExports(
  workspaceRoot: string,
  modulePath: string,
  seen: Set<string>,
  externalWildcardExports: Set<string>
): PublicExport[] {
  if (seen.has(modulePath)) return [];
  seen.add(modulePath);

  const parsed = parseModuleExports(readFileSync(modulePath, "utf8"), modulePath);
  const exports = parsed.exports.map((item) => {
    let sourcePath = relativeSourcePath(workspaceRoot, modulePath);
    if (item.moduleSpecifier && item.moduleSpecifier.startsWith(".")) {
      const resolved = resolveLocalModule(modulePath, item.moduleSpecifier);
      sourcePath = resolved
        ? relativeSourcePath(workspaceRoot, resolved)
        : stripModuleExtension(
            path
              .relative(workspaceRoot, path.resolve(path.dirname(modulePath), item.moduleSpecifier))
              .split(path.sep)
              .join("/")
          );
    }
    return { kind: item.kind, name: item.name, sourcePath };
  });

  for (const starModule of parsed.starModules) {
    if (!starModule.startsWith(".")) {
      externalWildcardExports.add(starModule);
      continue;
    }
    const resolved = resolveLocalModule(modulePath, starModule);
    if (resolved) {
      exports.push(...collectModuleExports(workspaceRoot, resolved, seen, externalWildcardExports));
    }
  }

  return exports;
}

function sortExports(exports: PublicExport[]) {
  return [...exports].sort(
    (left, right) =>
      left.name.localeCompare(right.name) ||
      left.kind.localeCompare(right.kind) ||
      left.sourcePath.localeCompare(right.sourcePath)
  );
}

export function collectPackageManifest(
  workspaceRoot: string,
  config: PackageConfig
): PackageManifest {
  const entryPath = path.resolve(workspaceRoot, config.entryPath);
  const externalWildcardExports = new Set<string>();
  const collected = collectModuleExports(
    workspaceRoot,
    entryPath,
    new Set<string>(),
    externalWildcardExports
  );
  const unique = new Map<string, PublicExport>();
  for (const item of collected) unique.set(`${item.kind}:${item.name}`, item);
  const exports = sortExports([...unique.values()]);

  return {
    entryPath: config.entryPath,
    exports,
    externalWildcardExports: [...externalWildcardExports].sort(),
    packageName: config.packageName,
    stats: {
      total: exports.length,
      types: exports.filter((item) => item.kind === "type").length,
      values: exports.filter((item) => item.kind === "value").length
    }
  };
}

function expectedDocsPath(workspaceRoot: string, sourcePath: string, productName: string) {
  const absoluteSource = path.resolve(workspaceRoot, sourcePath);
  if (existsSync(absoluteSource) && statSync(absoluteSource).isDirectory()) {
    const productDocument = `${sourcePath}/${productName}.docs.mdx`;
    if (existsSync(path.resolve(workspaceRoot, productDocument))) return productDocument;
    return `${sourcePath}/${path.basename(sourcePath)}.docs.mdx`;
  }
  return `${sourcePath}.docs.mdx`;
}

function productOwnsSource(component: ProductComponent, sourcePath: string) {
  if (component.sourcePath === sourcePath) return true;
  return Boolean(
    component.sourcePathPrefixes &&
    component.sourcePathPrefixes.some((prefix) => sourcePath.startsWith(prefix))
  );
}

type ParsedDocs = {
  declaredExports: string[];
  issues: string[];
};

function parseInlineList(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  return trimmed
    .slice(1, -1)
    .split(",")
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

export function parseComponentDocs(
  sourceText: string,
  expected: Pick<ProductComponent, "name" | "packageName" | "slug" | "sourcePath">,
  publicExports: Array<Pick<PublicExport, "kind" | "name">>
): ParsedDocs {
  const issues: string[] = [];
  const frontmatterMatch = sourceText.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatterMatch) {
    return { declaredExports: [], issues: ["missing YAML frontmatter"] };
  }

  const frontmatter = new Map<string, string>();
  const frontmatterLines = frontmatterMatch[1]!.split(/\r?\n/);
  for (let index = 0; index < frontmatterLines.length; index += 1) {
    const line = frontmatterLines[index]!;
    const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!match) continue;
    const key = match[1]!;
    let value = match[2]!.trim();
    const nextCandidate = frontmatterLines[index + 1];
    if (value === "" && nextCandidate !== undefined && nextCandidate.trim().startsWith("[")) {
      const continuation: string[] = [];
      do {
        index += 1;
        const nextLine = frontmatterLines[index];
        if (nextLine === undefined) break;
        continuation.push(nextLine.trim());
      } while (!continuation[continuation.length - 1]!.endsWith("]"));
      value = continuation.join(" ");
    }
    frontmatter.set(key, value.replace(/^['"]|['"]$/g, ""));
  }

  const requiredFields = [
    "name",
    "slug",
    "package",
    "exports",
    "status",
    "priority",
    "since",
    "lastReviewed",
    "source"
  ];
  for (const field of requiredFields) {
    if (!frontmatter.has(field) || frontmatter.get(field) === "") {
      issues.push(`missing frontmatter field: ${field}`);
    }
  }

  const expectedFields = {
    name: expected.name,
    package: expected.packageName,
    slug: expected.slug,
    source: expected.sourcePath
  };
  for (const [field, value] of Object.entries(expectedFields)) {
    const actual = frontmatter.get(field);
    if (actual !== undefined && actual !== value) {
      issues.push(`frontmatter ${field} is ${actual}; expected ${value}`);
    }
  }

  const declaredExports = parseInlineList(frontmatter.get("exports") || "");
  if (declaredExports.length === 0) issues.push("frontmatter exports must not be empty");
  const publicValues = new Set(
    publicExports.filter((item) => item.kind === "value").map((item) => item.name)
  );
  for (const item of declaredExports) {
    if (!publicValues.has(item))
      issues.push(`frontmatter exports contains non-public value: ${item}`);
  }

  const headings = new Set(
    [...sourceText.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1]!.trim())
  );
  for (const section of requiredDocsSections) {
    if (!headings.has(section)) issues.push(`missing required section: ${section}`);
  }

  return { declaredExports, issues };
}

export function buildComponentManifest(
  workspaceRoot: string,
  components: readonly ProductComponent[],
  configs: readonly PackageConfig[] = packageConfigs
): ComponentManifest {
  const packages = configs.map((config) => collectPackageManifest(workspaceRoot, config));
  const packageByName = new Map(packages.map((entry) => [entry.packageName, entry]));
  const products = [...components]
    .sort((left, right) => left.slug.localeCompare(right.slug))
    .map((component): ProductManifest => {
      const packageManifest = packageByName.get(component.packageName);
      const publicExports = packageManifest
        ? packageManifest.exports
            .filter((item) => productOwnsSource(component, item.sourcePath))
            .map(({ kind, name }) => ({ kind, name }))
        : [];
      const docsPath = expectedDocsPath(workspaceRoot, component.sourcePath, component.name);
      const absoluteDocsPath = path.resolve(workspaceRoot, docsPath);
      const hasDocs = existsSync(absoluteDocsPath) && statSync(absoluteDocsPath).isFile();
      const parsedDocs = hasDocs
        ? parseComponentDocs(readFileSync(absoluteDocsPath, "utf8"), component, publicExports)
        : { declaredExports: [], issues: [] };
      return {
        ...component,
        declaredExports: parsedDocs.declaredExports,
        docsIssues: parsedDocs.issues,
        docsPath,
        hasDocs,
        publicExports
      };
    });

  const undocumentedPublicExports = packages.flatMap((packageManifest) =>
    packageManifest.exports
      .filter(
        (item) =>
          !components.some(
            (component) =>
              component.packageName === packageManifest.packageName &&
              productOwnsSource(component, item.sourcePath)
          )
      )
      .map((item) => ({ ...item, packageName: packageManifest.packageName }))
  );
  const claimedPublicValues = new Set(
    products.flatMap((product) =>
      product.declaredExports.map((name) => `${product.packageName}:${name}`)
    )
  );
  const unclaimedPublicValues = packages.flatMap((packageManifest) =>
    packageManifest.exports
      .filter(
        (item) =>
          item.kind === "value" &&
          components.some(
            (component) =>
              component.packageName === packageManifest.packageName &&
              productOwnsSource(component, item.sourcePath)
          ) &&
          !claimedPublicValues.has(`${packageManifest.packageName}:${item.name}`)
      )
      .map((item) => ({ ...item, packageName: packageManifest.packageName }))
  );
  const publicValues = packages.reduce((total, item) => total + item.stats.values, 0);
  const publicTypes = packages.reduce((total, item) => total + item.stats.types, 0);

  return {
    packages,
    products,
    schemaVersion: 1,
    summary: {
      documentedProducts: products.filter((item) => item.hasDocs).length,
      externalWildcardExports: packages.reduce(
        (total, item) => total + item.externalWildcardExports.length,
        0
      ),
      packages: packages.length,
      products: products.length,
      productsWithoutPublicExports: products.filter((item) => item.publicExports.length === 0)
        .length,
      publicExports: publicValues + publicTypes,
      publicTypes,
      publicValues,
      undocumentedPublicExports: undocumentedPublicExports.length,
      unclaimedPublicValues: unclaimedPublicValues.length
    },
    undocumentedPublicExports,
    unclaimedPublicValues
  };
}

export function manifestIssues(manifest: ComponentManifest) {
  const issues: string[] = [];
  const duplicateSlugs = manifest.products
    .map((item) => item.slug)
    .filter((slug, index, values) => values.indexOf(slug) !== index);
  for (const slug of [...new Set(duplicateSlugs)].sort()) {
    issues.push(`duplicate product slug: ${slug}`);
  }
  for (const product of manifest.products) {
    if (!product.hasDocs) issues.push(`missing docs: ${product.docsPath}`);
    for (const issue of product.docsIssues) {
      issues.push(`invalid docs: ${product.docsPath}: ${issue}`);
    }
    if (product.publicExports.length === 0) {
      issues.push(
        `product has no public export from declared source: ${product.packageName}/${product.name} (${product.sourcePath})`
      );
    }
  }
  for (const item of manifest.undocumentedPublicExports) {
    issues.push(
      `public export has no product docs source: ${item.packageName}/${item.name} (${item.sourcePath})`
    );
  }
  for (const item of manifest.unclaimedPublicValues) {
    issues.push(
      `public value is not declared by colocated docs: ${item.packageName}/${item.name} (${item.sourcePath})`
    );
  }
  for (const packageManifest of manifest.packages) {
    for (const source of packageManifest.externalWildcardExports) {
      issues.push(
        `external wildcard export cannot be enumerated: ${packageManifest.packageName} -> ${source}`
      );
    }
  }
  return [...new Set(issues)].sort();
}

export function serializeManifest(manifest: ComponentManifest) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
