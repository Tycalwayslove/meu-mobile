import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "设计基础",
  description: "Meu Mobile 的 Token、主题、图标许可与跨平台架构。"
};

const tokens = [
  { name: "Canvas", value: "var(--meu-color-canvas)" },
  { name: "Surface", value: "var(--meu-color-surface)" },
  { name: "Ink", value: "var(--meu-color-ink)" },
  { name: "Accent", value: "var(--meu-color-accent)" }
] as const;

export default function FoundationsPage() {
  return (
    <main className="content-page">
      <header className="content-page__header">
        <p className="docs-eyebrow">Foundations</p>
        <h1>设计与工程共享同一套语义。</h1>
        <p>
          基础层不描述某个页面长什么样，而是定义颜色、尺寸、层级、动作和平台边界应如何保持一致。
        </p>
      </header>

      <section className="content-section">
        <h2>语义颜色</h2>
        <div className="token-grid">
          {tokens.map((token) => (
            <article className="token-card" key={token.name}>
              <div className="token-card__swatch" style={{ background: token.value }} />
              <h3>{token.name}</h3>
              <code>{token.value}</code>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <h2>包架构</h2>
        <div className="content-grid">
          <article className="content-card">
            <h3>@meu/tokens</h3>
            <p>从 meu-design 生成的跨主题 CSS 与类型化 Token。</p>
          </article>
          <article className="content-card">
            <h3>@meu/primitives-react</h3>
            <p>Portal、视觉隐藏和浮层状态等无视觉原语。</p>
          </article>
          <article className="content-card">
            <h3>@meu/mobile</h3>
            <p>面向 Next H5 的可组合 React 组件与 Vanilla Extract 样式。</p>
          </article>
          <article className="content-card">
            <h3>@meu/form-react</h3>
            <p>React Hook Form、Zod、服务端错误映射和复杂字段适配。</p>
          </article>
        </div>
      </section>

      <section className="content-section">
        <h2>Meu 图标体系与许可</h2>
        <p>
          对外导出统一采用 <code>MeuIcon*</code> 语义命名。底层图形优先取自 Lucide（ISC）与
          Feather（MIT）， 保留来源记录与许可文本；业务专属图标在 Figma 中绘制并作为 Meu
          原创资产维护。
        </p>
      </section>

      <section className="content-section">
        <h2>Figma 维护</h2>
        <p>
          设计文件承载变量、组件集、Light / Dark 实例与 QA 画板；代码端通过 ledger
          记录节点、绑定率和组件契约。
        </p>
        <p>
          <a
            href="https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v"
            target="_blank"
            rel="noreferrer"
          >
            打开 Meu Design System ↗
          </a>
        </p>
      </section>
    </main>
  );
}
