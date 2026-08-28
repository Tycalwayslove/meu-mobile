# Meu Mobile 文档部署

官网与组件实验室分开部署，代码仍保持在同一个 monorepo：

- Vercel：托管 `apps/docs` 的 Next.js 官网。
- Chromatic：托管 `apps/storybook` 的静态 Storybook，并保留视觉回归历史。
- GitHub Actions：在 `main` 与 pull request 上执行发布任务；未配置 Chromatic token 时安全跳过发布。

## Vercel

1. 在 Vercel 导入 `Tycalwayslove/meu-mobile`。
2. Root Directory 选择 `apps/docs`，并允许读取根目录外的工作区文件。
3. Framework Preset 选择 Next.js。构建命令由 `apps/docs/vercel.json` 提供。
4. 默认生产域名为 `https://meu-mobile-docs.vercel.app`；绑定自定义域名后，再用 `NEXT_PUBLIC_SITE_URL` 覆盖。
5. 配置 `NEXT_PUBLIC_STORYBOOK_URL=https://main--6a9133bdbb1019a4752cf46f.chromatic.com` 并重新部署。

Vercel 会为 `main` 生成生产部署，并为 pull request 生成 Preview Deployment。

## Chromatic

1. 在 Chromatic 中从同一个 GitHub 仓库创建项目。
2. 将项目 token 保存为仓库 Secret：`CHROMATIC_PROJECT_TOKEN`。
3. push 到 `main` 或创建 pull request；`.github/workflows/storybook.yml` 会构建并发布 Storybook。
4. 官网使用 `main` 分支固定地址：`https://main--6a9133bdbb1019a4752cf46f.chromatic.com`。

本地构建验证：

```sh
pnpm build:packages
pnpm --filter @meu/storybook build
pnpm --filter @meu/docs build
```

当前不执行 npm 发布；线上站点只发布文档产物，不改变包的私有状态。
