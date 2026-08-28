import { readFileSync } from "node:fs";
import path from "node:path";

import type { ComponentManifestExport, ComponentManifestProduct } from "./component-document";

type ApiToken = { text: string };
type ApiMember = {
  docComment?: string;
  excerptTokens?: ApiToken[];
  kind: string;
  members?: ApiMember[];
  name: string;
};
type ApiModel = { members?: ApiMember[] };

export type ComponentApiReference = {
  description?: string;
  kind: "type" | "value";
  name: string;
  signature: string;
};

const apiFiles: Record<string, string> = {
  "@meu/form-react": "form-react.api.json",
  "@meu/icons-react": "icons-react.api.json",
  "@meu/mobile": "mobile.api.json",
  "@meu/primitives-react": "primitives-react.api.json"
};

const modelCache = new Map<string, ApiModel>();

function cleanDocComment(comment: string | undefined) {
  if (!comment) return undefined;
  const cleaned = comment
    .replace(/^\/\*\*\s*/, "")
    .replace(/\s*\*\/$/, "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter((line) => line && !line.startsWith("@"))
    .join(" ")
    .replace(/\{@link\s+([^}|]+)(?:\|([^}]+))?\}/g, (_, target: string, label?: string) =>
      (label || target).trim()
    )
    .trim();
  return cleaned || undefined;
}

function referencePriority(entry: ComponentManifestExport, productName: string) {
  if (entry.name === productName) return 0;
  if (entry.name === `${productName}Props` || entry.name.endsWith("Props")) return 1;
  if (/(?:Event|Change|Details|Reason)/.test(entry.name)) return 2;
  if (entry.kind === "value") return 3;
  return 4;
}

export function parseApiReferenceModel(
  model: ApiModel,
  publicExports: ComponentManifestExport[],
  productName: string
) {
  const entryPoint = (model.members || []).find((member) => member.kind === "EntryPoint");
  const members = entryPoint && entryPoint.members ? entryPoint.members : [];
  const references: ComponentApiReference[] = [];

  for (const publicExport of publicExports) {
    const escapedName = publicExport.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const declarationPattern = new RegExp(
      `\\b(?:function|const|let|var|class|type|interface|enum)\\s+${escapedName}\\b`
    );
    const member = members.find((candidate) => {
      if (candidate.name === publicExport.name) return true;
      const excerpt = candidate.excerptTokens
        ? candidate.excerptTokens.map((token) => token.text).join("")
        : "";
      return declarationPattern.test(excerpt);
    });
    if (!member || !member.excerptTokens) {
      references.push({
        kind: publicExport.kind,
        name: publicExport.name,
        signature: `${publicExport.kind === "type" ? "export type" : "export"} { ${publicExport.name} };`
      });
      continue;
    }
    const signature = member.excerptTokens
      .map((token) => token.text)
      .join("")
      .trim();
    if (!signature) continue;
    const description = cleanDocComment(member.docComment);
    references.push({
      ...(description ? { description } : {}),
      kind: publicExport.kind,
      name: publicExport.name,
      signature
    });
  }

  return references.sort(
    (left, right) =>
      referencePriority(left, productName) - referencePriority(right, productName) ||
      left.name.localeCompare(right.name)
  );
}

function readApiModel(packageName: string) {
  const cached = modelCache.get(packageName);
  if (cached) return cached;
  const fileName = apiFiles[packageName];
  if (!fileName) return undefined;
  const apiRoot = path.resolve(process.cwd(), "../../etc/api");
  const model = JSON.parse(readFileSync(path.join(apiRoot, fileName), "utf8")) as ApiModel;
  modelCache.set(packageName, model);
  return model;
}

export function getComponentApiReference(product: ComponentManifestProduct) {
  const model = readApiModel(product.packageName);
  return model ? parseApiReferenceModel(model, product.publicExports, product.name) : [];
}
