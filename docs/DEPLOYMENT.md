# Meu Mobile 文档部署

官网与组件实验室分开部署，代码仍保持在同一个 monorepo：

- Vercel：托管 `apps/docs` 的 Next.js 官网。
- Chromatic：托管 `apps/storybook` 的静态 Storybook，并保留视觉回归历史。
- GitHub Actions：持续执行质量检查；线上发布只在里程碑验收时手动触发。

## 当前发布策略

组件集中开发期间不为每次提交创建 Vercel 或 Chromatic 部署：

- `.github/workflows/quality.yml` 仍在 pull request 和 `main` 推送时执行代码质量、单元测试、构建、兼容性与 Next H5 E2E 门禁，但不发布任何站点。
- `.github/workflows/storybook.yml` 只允许从 GitHub Actions 手动运行，不再响应 pull request 或普通推送。
- `apps/docs/vercel.json` 通过 `git.deploymentEnabled: false` 关闭所有分支的 Vercel Git 自动部署。
- 日常预览使用本地官网和 Storybook；全部组件完成后再执行一次完整测试并统一发布。

本地开发预览：

```sh
pnpm docs
pnpm storybook
```

提交前按改动范围运行相关测试；阶段验收运行完整门禁：

```sh
pnpm check
pnpm storybook:check-links
pnpm test:storybook:a11y
```

## Vercel

1. 在 Vercel 导入 `Tycalwayslove/meu-mobile`。
2. Root Directory 选择 `apps/docs`，并允许读取根目录外的工作区文件。
3. Framework Preset 选择 Next.js。构建命令由 `apps/docs/vercel.json` 提供。
4. 默认生产域名为 `https://meu-mobile-docs.vercel.app`；绑定自定义域名后，再用 `NEXT_PUBLIC_SITE_URL` 覆盖。
5. 配置 `NEXT_PUBLIC_STORYBOOK_URL=https://main--6a9133bdbb1019a4752cf46f.chromatic.com`。
6. 在 Project Settings → Git → Deploy Hooks 为 `main` 创建名为 `Release Meu Mobile Docs` 的 Deploy Hook。Hook URL 属于敏感凭证，不提交到仓库。

普通 Git 推送不会生成 Vercel 部署。里程碑验收通过后，调用上述 Deploy Hook 发布 `main` 的最新提交；也可以使用 Vercel Dashboard 从 Git reference 创建部署。发布完成后无需修改仓库配置。

## Chromatic

1. 在 Chromatic 中从同一个 GitHub 仓库创建项目。
2. 将项目 token 保存为仓库 Secret：`CHROMATIC_PROJECT_TOKEN`。
3. 里程碑验收通过后，打开 GitHub 仓库的 Actions → Publish Storybook，点击 Run workflow 并选择 `main`。
4. 官网使用 `main` 分支固定地址：`https://main--6a9133bdbb1019a4752cf46f.chromatic.com`。

## 统一发布顺序

1. 确认待发布代码已经合并到 `main`，工作树无未提交变更。
2. 本地运行 `pnpm check`、`pnpm storybook:check-links` 和 `pnpm test:storybook:a11y`；最后一项会在 390×844 视口逐一扫描全部 Story 的 Light / Dark WCAG A/AA，不会上传 Chromatic。
3. 确认 GitHub 的 `Quality` workflow 全部通过。
4. 手动运行 `Publish Storybook`，检查 Chromatic 构建并处理需要人工确认的视觉差异。
5. Chromatic 地址稳定后，触发 Vercel 的 `Release Meu Mobile Docs` Deploy Hook。
6. 验证官网、组件页面、Storybook 跳转和移动端视口，再记录本次发布地址。

只验证站点构建时可运行：

```sh
pnpm build:packages
pnpm --filter @meu/storybook build
pnpm --filter @meu/docs build
```

当前不执行 npm 发布；线上站点只发布文档产物，不改变包的私有状态。
