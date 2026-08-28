import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "../_components/CodeBlock";

export const metadata: Metadata = {
  title: "开始使用",
  description: "在 Next.js H5 工作区中接入 Meu Mobile。"
};

const installCode = `pnpm add '@meu/mobile@workspace:*' '@meu/form-react@workspace:*' '@meu/primitives-react@workspace:*'`;
const layoutCode = `import "@meu/tokens/css";
import "@meu/primitives-react/styles.css";
import "@meu/mobile/styles.css";
import { ConfigProvider } from "@meu/mobile";

export default function RootLayout({ children }) {
  return <ConfigProvider theme="system">{children}</ConfigProvider>;
}`;
const formCode = `import { MeuForm, MeuFormTextInput } from "@meu/form-react";
import { z } from "zod";

const schema = z.object({ mobile: z.string().min(11, "请输入手机号") });

<MeuForm schema={schema} onSubmit={save}>
  <MeuFormTextInput name="mobile" label="手机号" inputMode="tel" />
</MeuForm>`;

export default function GettingStartedPage() {
  return (
    <main className="content-page">
      <header className="content-page__header">
        <p className="docs-eyebrow">Getting started</p>
        <h1>在 Next.js H5 中开始使用。</h1>
        <p>
          当前组件库只在 monorepo 工作区内消费，不发布 npm，也不接入现有 hybrid 工程做真实链路验证。
        </p>
      </header>

      <section className="content-section">
        <h2>1. 加入工作区依赖</h2>
        <p>使用 pnpm 的 workspace 协议锁定本地包，避免误装同名公开包。</p>
        <CodeBlock label="shell">{installCode}</CodeBlock>
      </section>

      <section className="content-section">
        <h2>2. 引入样式与主题</h2>
        <p>在 App Router 根布局引入 Token 和组件样式，并只放置一个顶层 ConfigProvider。</p>
        <CodeBlock>{layoutCode}</CodeBlock>
      </section>

      <section className="content-section">
        <h2>3. 使用内置表单集成</h2>
        <p>表单适配以 React Hook Form 为状态事实源，并通过 Zod 统一校验与错误消息。</p>
        <CodeBlock>{formCode}</CodeBlock>
      </section>

      <section className="content-section">
        <h2>验证边界</h2>
        <div className="content-grid">
          <article className="content-card">
            <h3>独立 Next 测试站</h3>
            <p>在 tests/next-h5 验证 SSR、hydration、主题、Portal 与完整表单提交。</p>
          </article>
          <article className="content-card">
            <h3>兼容基线</h3>
            <p>
              完整支持 iOS/WKWebView 15+ 与 Android Chrome/WebView 89+；更早环境属于观察档，
              静态语法门禁不等同于运行时支持承诺。
            </p>
          </article>
        </div>
        <p>
          <Link href="/components">继续浏览组件 →</Link>
        </p>
      </section>
    </main>
  );
}
