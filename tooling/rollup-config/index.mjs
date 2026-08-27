/* global process */

import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { vanillaExtractPlugin } from "@vanilla-extract/rollup-plugin";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import preserveDirectives from "rollup-preserve-directives";

export function createLibraryConfig({
  input = "src/index.ts",
  external = [],
  styles = false
} = {}) {
  const packageDirectory = process.cwd();
  const packageJson = JSON.parse(
    readFileSync(resolve(packageDirectory, "package.json"), "utf8")
  );
  const declaredPackages = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {})
  ]);
  const explicitMatchers = Array.isArray(external) ? external : [external];
  const isExternal = (id) => {
    const declared = [...declaredPackages].some(
      (packageName) => id === packageName || id.startsWith(`${packageName}/`)
    );
    const explicit = explicitMatchers.some((matcher) => {
      if (typeof matcher === "string") return id === matcher || id.startsWith(`${matcher}/`);
      return matcher instanceof RegExp ? matcher.test(id) : false;
    });
    return declared || explicit;
  };
  const plugins = [
    {
      name: "meu-clean-dist",
      buildStart() {
        rmSync(resolve(packageDirectory, "dist"), { recursive: true, force: true });
      }
    },
    peerDepsExternal(),
    nodeResolve({ extensions: [".mjs", ".js", ".json", ".ts", ".tsx"] }),
    commonjs()
  ];

  if (styles) {
    plugins.push(
      vanillaExtractPlugin({
        identifiers: process.env.NODE_ENV === "production" ? "short" : "debug",
        extract: { name: "styles.css", sourcemap: true }
      })
    );
  }

  plugins.push(
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationMap: false,
      noEmit: false
    }),
    preserveDirectives()
  );

  return {
    input,
    external: isExternal,
    plugins,
    output: {
      dir: "dist",
      format: "esm",
      preserveModules: true,
      preserveModulesRoot: "src",
      sourcemap: true,
      assetFileNames: "[name][extname]"
    }
  };
}
