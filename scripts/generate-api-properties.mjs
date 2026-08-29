/* global console, process */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(workspaceRoot, "apps/docs/app/_generated/api-properties.json");
const packageEntries = [
  ["@meu/mobile", "packages/mobile/src/index.ts"],
  ["@meu/form-react", "packages/form-react/src/index.ts"],
  ["@meu/icons-react", "packages/icons-react/src/index.ts"],
  ["@meu/primitives-react", "packages/primitives-react/src/index.ts"]
];
const check = new Set(process.argv.slice(2)).has("--check");
const strict = new Set(process.argv.slice(2)).has("--strict");

function normalizedPath(filePath) {
  return path.resolve(filePath).split(path.sep).join("/");
}

function isWorkspaceDeclaration(declaration) {
  const fileName = normalizedPath(declaration.getSourceFile().fileName);
  return fileName.startsWith(`${normalizedPath(path.join(workspaceRoot, "packages"))}/`);
}

function displayParts(parts) {
  return ts.displayPartsToString(parts || []).trim();
}

function tagText(tag) {
  if (!tag || !tag.text) return undefined;
  const value = displayParts(tag.text);
  return value || undefined;
}

function propertyModel(checker, property, context) {
  const declarations = (property.declarations || []).filter(isWorkspaceDeclaration);
  if (declarations.length === 0) return undefined;
  const declaration = declarations[0];
  const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration || context);
  const type = checker.typeToString(
    propertyType,
    declaration || context,
    ts.TypeFormatFlags.NoTruncation |
      ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
      ts.TypeFormatFlags.WriteArrowStyleSignature
  );
  const tags = property.getJsDocTags(checker);
  const defaultValue = tagText(tags.find((tag) => tag.name === "defaultValue"));
  const description = displayParts(property.getDocumentationComment(checker));
  const name = property.getName();

  return {
    name,
    type,
    required: (property.flags & ts.SymbolFlags.Optional) === 0,
    event: /^on[A-Z]/.test(name),
    ...(description ? { description } : {}),
    ...(defaultValue ? { defaultValue } : {})
  };
}

function exportedTypeProperties(checker, exportedSymbol) {
  const symbol =
    (exportedSymbol.flags & ts.SymbolFlags.Alias) !== 0
      ? checker.getAliasedSymbol(exportedSymbol)
      : exportedSymbol;
  const declaration = (symbol.declarations || []).find(
    (candidate) => ts.isTypeAliasDeclaration(candidate) || ts.isInterfaceDeclaration(candidate)
  );
  if (!declaration) return [];

  let declaredType;
  try {
    declaredType = checker.getDeclaredTypeOfSymbol(symbol);
  } catch {
    return [];
  }

  return checker
    .getPropertiesOfType(declaredType)
    .map((property) => propertyModel(checker, property, declaration))
    .filter(Boolean)
    .sort((left, right) => {
      if (left.event !== right.event) return left.event ? 1 : -1;
      return left.name.localeCompare(right.name);
    });
}

const rootNames = packageEntries.map(([, entryPath]) => path.join(workspaceRoot, entryPath));
const program = ts.createProgram({
  rootNames,
  options: {
    allowJs: false,
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022
  }
});
const checker = program.getTypeChecker();
const packages = {};
let exportedTypes = 0;
let exportedTypesWithFields = 0;
let fields = 0;
let documentedFields = 0;
let eventFields = 0;
const missingDocumentation = [];

for (const [packageName, entryPath] of packageEntries) {
  const sourceFile = program.getSourceFile(path.join(workspaceRoot, entryPath));
  if (!sourceFile) throw new Error(`Unable to load ${entryPath}`);
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) throw new Error(`Unable to resolve exports for ${entryPath}`);

  const entries = {};
  for (const exportedSymbol of checker.getExportsOfModule(moduleSymbol)) {
    const properties = exportedTypeProperties(checker, exportedSymbol);
    const symbol =
      (exportedSymbol.flags & ts.SymbolFlags.Alias) !== 0
        ? checker.getAliasedSymbol(exportedSymbol)
        : exportedSymbol;
    const isType = (symbol.declarations || []).some(
      (candidate) => ts.isTypeAliasDeclaration(candidate) || ts.isInterfaceDeclaration(candidate)
    );
    if (!isType) continue;
    exportedTypes += 1;
    if (properties.length === 0) continue;
    exportedTypesWithFields += 1;
    fields += properties.length;
    documentedFields += properties.filter((property) => property.description).length;
    eventFields += properties.filter((property) => property.event).length;
    for (const property of properties) {
      if (!property.description) {
        missingDocumentation.push(`${packageName}:${exportedSymbol.getName()}.${property.name}`);
      }
    }
    entries[exportedSymbol.getName()] = properties;
  }
  packages[packageName] = entries;
}

const output = {
  schemaVersion: 1,
  packages,
  summary: {
    documentedFields,
    eventFields,
    exportedTypes,
    exportedTypesWithFields,
    fields,
    packages: packageEntries.length
  }
};
const serialized = `${JSON.stringify(output, null, 2)}\n`;

if (check) {
  if (!existsSync(outputPath) || readFileSync(outputPath, "utf8") !== serialized) {
    console.error(
      "Generated API property model is stale. Run `pnpm api:properties` and commit the result."
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(outputPath, serialized);
  console.log(`Wrote ${path.relative(workspaceRoot, outputPath)}.`);
}

console.log(
  [
    `${exportedTypes} exported types`,
    `${exportedTypesWithFields} structured types`,
    `${fields} fields`,
    `${documentedFields} documented fields`,
    `${eventFields} events`
  ].join(" · ")
);

if (strict && missingDocumentation.length > 0) {
  console.error(
    [
      `Public API documentation is incomplete: ${missingDocumentation.length} field(s) are missing TSDoc.`,
      ...missingDocumentation.map((entry) => `- ${entry}`)
    ].join("\n")
  );
  process.exitCode = 1;
}
