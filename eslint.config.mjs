import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/.test-results/**",
      "**/playwright-report/**",
      "packages/tokens/src/generated.ts"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      "jsx-a11y": jsxA11y,
      "react-hooks": reactHooks
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
      "@typescript-eslint/no-restricted-types": "off",
      "no-restricted-syntax": [
        "error",
        {
          "selector": "ChainExpression",
          "message": "客户端源码需兼容 Android Chrome/WebView 70，请使用显式判空。"
        },
        {
          "selector": "LogicalExpression[operator='??']",
          "message": "客户端源码需兼容 Android Chrome/WebView 70，请使用显式判空。"
        },
        {
          "selector": "AssignmentExpression[operator='??='], AssignmentExpression[operator='||='], AssignmentExpression[operator='&&=']",
          "message": "客户端源码需兼容 Android Chrome/WebView 70，请使用显式赋值。"
        },
        {
          "selector": "PrivateIdentifier",
          "message": "客户端源码禁止 class 私有字段，以保持旧 WebView 兼容。"
        }
      ]
    }
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked
  },
  {
    files: ["**/scripts/**/*.ts", "**/*.config.ts"],
    ...tseslint.configs.disableTypeChecked
  }
);
