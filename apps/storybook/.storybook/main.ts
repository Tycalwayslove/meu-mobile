import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";

const config: StorybookConfig = {
  stories: [
    "../../../packages/mobile/src/**/*.stories.@(ts|tsx)",
    "../../../packages/form-react/src/**/*.stories.@(ts|tsx)",
    "../src/**/*.mdx"
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins || []), vanillaExtractPlugin()];
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: [
        {
          find: /^@meu\/mobile$/,
          replacement: fileURLToPath(new URL("../../../packages/mobile/src/index.ts", import.meta.url))
        }
      ]
    };
    return viteConfig;
  }
};

export default config;
