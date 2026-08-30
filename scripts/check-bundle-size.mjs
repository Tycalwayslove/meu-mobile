/* global console, process */

import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { Buffer } from "node:buffer";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { brotliCompressSync, gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { rollup } from "rollup";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(workspaceRoot, "apps/docs/app/_generated/component-manifest.json");
const baselinePath = path.join(workspaceRoot, "docs/v2/bundle-size.json");
const check = new Set(process.argv.slice(2)).has("--check");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const packageDirectories = {
  "@meu/form-react": "packages/form-react",
  "@meu/icons-react": "packages/icons-react",
  "@meu/mobile": "packages/mobile",
  "@meu/primitives-react": "packages/primitives-react"
};
const complexProducts = new Set([
  "Calendar",
  "Carousel",
  "CascadePicker",
  "DatePicker",
  "DateRangePicker",
  "ImageUploader",
  "ImageViewer",
  "Picker",
  "Popover",
  "TimePicker",
  "TreeSelect"
]);

function productBudget(product) {
  if (product.name === "Form") return 113 * 1024;
  if (complexProducts.has(product.name)) return 48 * 1024;
  return 32 * 1024;
}

function valueBudget(product) {
  if (product.name === "Form") return 64 * 1024;
  return complexProducts.has(product.name) ? 48 * 1024 : 32 * 1024;
}

function compressedSize(source) {
  const bytes = Buffer.from(source);
  return {
    brotliBytes: brotliCompressSync(bytes).byteLength,
    gzipBytes: gzipSync(bytes, { level: 9 }).byteLength,
    rawBytes: bytes.byteLength
  };
}

async function measureBundle(product, values) {
  const packageDirectory = packageDirectories[product.packageName];
  if (!packageDirectory) throw new Error(`Unknown package ${product.packageName}`);
  const packageRoot = path.join(workspaceRoot, packageDirectory);
  const packageJson = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));
  const peerDependencies = Object.keys(packageJson.peerDependencies || {});
  const entry = `virtual:meu-size:${product.slug}:${values.join("-")}`;
  const source = `export { ${values.join(", ")} } from ${JSON.stringify(
    path.join(packageRoot, "dist/index.js")
  )};`;
  const bundle = await rollup({
    input: entry,
    external(id) {
      return peerDependencies.some(
        (dependency) => id === dependency || id.startsWith(`${dependency}/`)
      );
    },
    onwarn(warning) {
      if (warning.code !== "MODULE_LEVEL_DIRECTIVE") {
        console.warn(`[bundle-size] ${product.name}: ${warning.message}`);
      }
    },
    plugins: [
      {
        name: "meu-size-entry",
        resolveId(id) {
          return id === entry ? id : null;
        },
        load(id) {
          return id === entry ? source : null;
        }
      },
      nodeResolve({ extensions: [".mjs", ".js", ".json"] }),
      commonjs(),
      terser({ format: { comments: false } })
    ],
    treeshake: { moduleSideEffects: false }
  });

  try {
    const generated = await bundle.generate({ compact: true, format: "esm" });
    const code = generated.output
      .filter((output) => output.type === "chunk")
      .map((output) => output.code)
      .join("\n");
    const sizes = compressedSize(code);
    return sizes;
  } finally {
    await bundle.close();
  }
}

async function measureProduct(product) {
  const sizes = await measureBundle(product, product.declaredExports);
  const budgetBytes = productBudget(product);
  const perValueBudget = valueBudget(product);
  const valueBundles =
    product.declaredExports.length === 1
      ? [
          {
            budgetBytes: perValueBudget,
            ...sizes,
            name: product.declaredExports[0],
            passesBudget: sizes.gzipBytes <= perValueBudget
          }
        ]
      : await mapWithConcurrency(product.declaredExports, 2, async (name) => {
          const valueSizes = await measureBundle(product, [name]);
          return {
            budgetBytes: perValueBudget,
            ...valueSizes,
            name,
            passesBudget: valueSizes.gzipBytes <= perValueBudget
          };
        });
  return {
    budgetBytes,
    ...sizes,
    docsPath: product.docsPath,
    name: product.name,
    packageName: product.packageName,
    passesBudget: sizes.gzipBytes <= budgetBytes,
    slug: product.slug,
    valueBundles
  };
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await mapper(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}

const products = (
  await mapWithConcurrency(
    [...manifest.products].sort(
      (left, right) =>
        left.packageName.localeCompare(right.packageName) || left.name.localeCompare(right.name)
    ),
    3,
    measureProduct
  )
).filter(Boolean);

const cssFiles = [
  ["@meu/tokens", "packages/tokens/dist/theme.css"],
  ["@meu/primitives-react", "packages/primitives-react/dist/styles.css"],
  ["@meu/mobile", "packages/mobile/dist/styles.css"]
];
const cssSource = cssFiles
  .map(([, filePath]) => readFileSync(path.join(workspaceRoot, filePath), "utf8"))
  .join("\n");
const cssSizes = compressedSize(cssSource);
const cssBudgetBytes = 32 * 1024;
const overBudget = products.filter((product) => !product.passesBudget);
const overBudgetValues = products.flatMap((product) =>
  product.valueBundles
    .filter((value) => !value.passesBudget)
    .map((value) => ({ ...value, packageName: product.packageName, productName: product.name }))
);
const output = {
  schemaVersion: 1,
  assumptions: {
    compression:
      "Committed gzip and Brotli figures use the generating Node zlib; checks compare deterministic raw output and independently enforce the current runtime gzip budget so zlib-version drift cannot stale otherwise identical evidence.",
    css: "Required token, primitive and mobile styles imported once per application.",
    javascript:
      "Rollup tree-shaken compact ESM production bundle for each documented product; package peer dependencies remain external."
  },
  css: {
    budgetBytes: cssBudgetBytes,
    ...cssSizes,
    files: cssFiles.map(([packageName, filePath]) => ({ filePath, packageName })),
    passesBudget: cssSizes.gzipBytes <= cssBudgetBytes
  },
  products,
  summary: {
    documentedProducts: products.length,
    overBudgetProducts: overBudget.length,
    overBudgetValues: overBudgetValues.length,
    productsWithinBudget: products.length - overBudget.length,
    publicValues: products.reduce((count, product) => count + product.valueBundles.length, 0)
  }
};
const serialized = `${JSON.stringify(output, null, 2)}\n`;
const staleDocs = [];

function stableEvidence(bundleOutput) {
  return {
    schemaVersion: bundleOutput.schemaVersion,
    assumptions: bundleOutput.assumptions,
    css: {
      budgetBytes: bundleOutput.css.budgetBytes,
      files: bundleOutput.css.files,
      rawBytes: bundleOutput.css.rawBytes
    },
    products: bundleOutput.products.map((product) => ({
      budgetBytes: product.budgetBytes,
      docsPath: product.docsPath,
      name: product.name,
      packageName: product.packageName,
      rawBytes: product.rawBytes,
      slug: product.slug,
      valueBundles: product.valueBundles.map((value) => ({
        budgetBytes: value.budgetBytes,
        name: value.name,
        rawBytes: value.rawBytes
      }))
    })),
    summary: {
      documentedProducts: bundleOutput.summary.documentedProducts,
      publicValues: bundleOutput.summary.publicValues
    }
  };
}

let baseline;
if (check && existsSync(baselinePath)) {
  baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
}

function bundleEvidence(product) {
  const largestValue = [...product.valueBundles].sort(
    (left, right) => right.gzipBytes - left.gzipBytes
  )[0];
  const valueDetail =
    product.valueBundles.length === 1
      ? `单一公开值 gzip ${largestValue.gzipBytes} B / ${largestValue.budgetBytes} B 预算`
      : `${product.valueBundles.length} 个公开值组合 gzip ${product.gzipBytes} B / ${product.budgetBytes} B 预算；最大单值 \`${largestValue.name}\` 为 ${largestValue.gzipBytes} B / ${largestValue.budgetBytes} B 预算`;
  return `- Bundle：Rollup tree-shaken ESM（React 与包 peer dependencies external）${valueDetail}，组合 Brotli ${product.brotliBytes} B；共享样式由应用单独导入一次。`;
}

for (const product of products) {
  const docsPath = path.join(workspaceRoot, product.docsPath);
  const baselineProduct = baseline
    ? baseline.products.find(
        (candidate) =>
          candidate.name === product.name && candidate.packageName === product.packageName
      )
    : undefined;
  const expected = bundleEvidence(baselineProduct || product);
  const source = readFileSync(docsPath, "utf8");
  if (check) {
    if (!source.includes(expected)) staleDocs.push(product.docsPath);
    continue;
  }
  const nextSource = /^- Bundle：.*$/m.test(source)
    ? source.replace(/^- Bundle：.*$/m, expected)
    : source.replace(/^(- 官网 Next 运行时：.*)$/m, `$1\n${expected}`);
  if (nextSource === source && !source.includes(expected)) {
    throw new Error(`Unable to place bundle evidence in ${product.docsPath}`);
  }
  writeFileSync(docsPath, nextSource);
}

if (check) {
  if (
    !baseline ||
    JSON.stringify(stableEvidence(baseline)) !== JSON.stringify(stableEvidence(output))
  ) {
    console.error(
      "Bundle-size evidence is stale. Run `pnpm bundle:size:update` and review the diff."
    );
    process.exitCode = 1;
  }
  if (staleDocs.length > 0) {
    console.error(
      `Bundle-size evidence is stale in ${staleDocs.length} component document(s):\n${staleDocs
        .map((filePath) => `- ${filePath}`)
        .join("\n")}`
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(baselinePath, serialized);
  console.log(`Wrote ${path.relative(workspaceRoot, baselinePath)}.`);
}

if (!output.css.passesBudget || overBudget.length > 0 || overBudgetValues.length > 0) {
  console.error(
    [
      ...(output.css.passesBudget
        ? []
        : [`- shared CSS: ${output.css.gzipBytes}/${output.css.budgetBytes} gzip bytes`]),
      ...overBudget.map(
        (product) =>
          `- ${product.packageName}/${product.name}: ${product.gzipBytes}/${product.budgetBytes} gzip bytes`
      ),
      ...overBudgetValues.map(
        (value) =>
          `- ${value.packageName}/${value.productName}.${value.name}: ${value.gzipBytes}/${value.budgetBytes} gzip bytes`
      )
    ].join("\n")
  );
  process.exitCode = 1;
}

console.log(
  `Bundle size: ${products.length} products / ${output.summary.publicValues} public values · ${products.length - overBudget.length} products within budget · CSS ${output.css.gzipBytes}/${output.css.budgetBytes} gzip bytes.`
);
