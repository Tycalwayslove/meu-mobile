import type { Metadata } from "next";

export const metadata: Metadata = { title: "使用说明" };

export default function TermsPage() {
  return (
    <main className="content-page">
      <header className="content-page__header">
        <p className="docs-eyebrow">Usage</p>
        <h1>使用说明</h1>
        <p>当前组件库处于私有开发阶段。</p>
      </header>
      <section className="content-section">
        <h2>分发</h2>
        <p>
          代码仅通过 meu-mobile 工作区使用，暂不发布
          npm。未经项目所有者确认，不应将包或设计资产重新分发。
        </p>
      </section>
      <section className="content-section">
        <h2>稳定性</h2>
        <p>
          P0、P1、P2 表示交付顺序而非公开 API
          稳定等级。正式版本发布前，接口可能依据集成验证结果调整。
        </p>
      </section>
    </main>
  );
}
