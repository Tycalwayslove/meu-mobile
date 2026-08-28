import type { Metadata } from "next";

import { CodeBlock } from "../_components/CodeBlock";

export const metadata: Metadata = {
  title: "组件实验室",
  description: "Meu Mobile Storybook 的独立状态、视觉回归与发布说明。"
};

export default function LabPage() {
  const storybookUrl = process.env.NEXT_PUBLIC_STORYBOOK_URL;

  return (
    <main className="content-page">
      <header className="content-page__header">
        <p className="docs-eyebrow">Component lab</p>
        <h1>隔离状态，验证每一个边界。</h1>
        <p>
          官网负责解释怎么使用；Storybook
          负责穷举状态、交互和视觉回归。两者独立部署，并从组件详情页互相跳转。
        </p>
      </header>

      <section className="content-section">
        <h2>发布状态</h2>
        {storybookUrl ? (
          <p className="lab-status">
            Storybook 已配置线上地址：
            <a href={storybookUrl} target="_blank" rel="noreferrer">
              打开实验室 ↗
            </a>
          </p>
        ) : (
          <p className="lab-status">
            本地实验室可用；设置 NEXT_PUBLIC_STORYBOOK_URL 后将显示线上入口。
          </p>
        )}
      </section>

      <section className="content-section">
        <h2>本地运行</h2>
        <CodeBlock label="shell">pnpm storybook</CodeBlock>
        <p>默认访问 localhost:6006。构建产物位于 apps/storybook/storybook-static。</p>
      </section>

      <section className="content-section">
        <h2>线上职责</h2>
        <div className="content-grid">
          <article className="content-card">
            <h3>Chromatic</h3>
            <p>托管 Storybook、保留版本历史，并对组件状态执行视觉差异审查。</p>
          </article>
          <article className="content-card">
            <h3>Vercel</h3>
            <p>托管当前 Next.js 官网，承担搜索、接入文档、SEO 与组件详情导航。</p>
          </article>
        </div>
      </section>
    </main>
  );
}
