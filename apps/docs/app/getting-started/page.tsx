import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "../_components/CodeBlock";

export const metadata: Metadata = {
  title: "开始使用",
  description: "在 Next.js H5 工作区中接入 Meu Mobile。"
};

const installCode = `pnpm add '@meu/mobile@workspace:*' '@meu/form-react@workspace:*' '@meu/primitives-react@workspace:*'`;
const nextConfigCode = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@meu/form-react",
    "@meu/icons-react",
    "@meu/mobile",
    "@meu/primitives-react",
    "@tanstack/react-virtual",
    "@tanstack/virtual-core"
  ]
};

export default nextConfig;`;
const layoutCode = `import "@meu/tokens/css";
import "@meu/primitives-react/styles.css";
import "@meu/mobile/styles.css";
import { ConfigProvider } from "@meu/mobile";

export default function RootLayout({ children }) {
  return <ConfigProvider theme="system">{children}</ConfigProvider>;
}`;
const formCode = `"use client";

import { MeuForm, MeuFormTextInput, useMeuForm } from "@meu/form-react";
import { z } from "zod";

const schema = z.object({ mobile: z.string().min(11, "请输入手机号") });
type Values = z.infer<typeof schema>;

export function MobileForm({ onSave }: { onSave: (values: Values) => void | Promise<void> }) {
  const form = useMeuForm<Values>({ schema, defaultValues: { mobile: "" } });

  return (
    <MeuForm form={form} onSubmit={onSave}>
      <MeuFormTextInput<Values> name="mobile" label="手机号" inputMode="tel" required />
      <button type="submit">保存</button>
    </MeuForm>
  );
}`;
const serverErrorsCode = `"use client";

import { MeuForm, MeuFormTextInput, useMeuForm } from "@meu/form-react";
import { applyMeuFormErrors } from "@meu/form-react/server";

type Values = { contact: string; storeName: string };
type SaveResult =
  | { ok: true }
  | { ok: false; fieldErrors: Partial<Record<keyof Values, string>> };

export function StoreForm({ saveStore }: { saveStore: (values: Values) => Promise<SaveResult> }) {
  const form = useMeuForm<Values>({ defaultValues: { contact: "", storeName: "" } });

  async function submit(values: Values) {
    const result = await saveStore(values);
    if (!result.ok) {
      // 先写入全部服务端错误，再按当前 MeuForm 内的 DOM 顺序聚焦首项。
      applyMeuFormErrors(form, result.fieldErrors);
    }
  }

  return (
    <MeuForm form={form} onSubmit={submit}>
      <MeuFormTextInput<Values> name="storeName" label="店铺名称" />
      <MeuFormTextInput<Values> name="contact" label="联系人" />
      <button type="submit">保存</button>
    </MeuForm>
  );
}`;
const complexFormDataCode = `import { MeuFormDateRangePicker } from "@meu/form-react";

type Values = { deliveryWindow: [Date, Date] | null };

export function DeliveryWindowField() {
  return (
    <MeuFormDateRangePicker<Values>
      name="deliveryWindow"
      label="配送日期"
      // 默认提交两个同名 YYYY-MM-DD；这里改成服务端约定的单个 JSON 值。
      serializeValue={([start, end], { adapter }) =>
        JSON.stringify({
          end: adapter.format(end, "YYYY-MM-DD"),
          start: adapter.format(start, "YYYY-MM-DD")
        })
      }
    />
  );
}

export function readDefaultPayload(formElement: HTMLFormElement) {
  return new FormData(formElement).getAll("deliveryWindow");
}`;

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
        <h2>1. 确认支持版本</h2>
        <p>
          V2 Web 首发支持 React 19 与 Next.js 16 App Router；当前验证版本为 React 19.2.8 和 Next.js
          16.3.3。React 18、Next.js 14–15 与 Pages Router 尚未进入支持矩阵。
        </p>
      </section>

      <section className="content-section">
        <h2>2. 加入工作区依赖</h2>
        <p>使用 pnpm 的 workspace 协议锁定本地包，避免误装同名公开包。</p>
        <CodeBlock label="shell">{installCode}</CodeBlock>
      </section>

      <section className="content-section">
        <h2>3. 配置 Next.js 转译</h2>
        <p>在应用的 next.config.ts 中转译 Meu 包及虚拟列表运行时依赖。</p>
        <CodeBlock>{nextConfigCode}</CodeBlock>
      </section>

      <section className="content-section">
        <h2>4. 引入样式与主题</h2>
        <p>在 App Router 根布局引入 Token 和组件样式，并只放置一个顶层 ConfigProvider。</p>
        <CodeBlock>{layoutCode}</CodeBlock>
      </section>

      <section className="content-section">
        <h2>5. 使用内置表单集成</h2>
        <p>表单适配以 React Hook Form 为状态事实源，并通过 Zod 统一校验与错误消息。</p>
        <CodeBlock>{formCode}</CodeBlock>
      </section>

      <section className="content-section">
        <h2>6. 映射服务端字段错误</h2>
        <p>
          `applyMeuFormErrors` 会把后端字段错误写入对应 RHF 实例，并将焦点限制在所属
          `MeuForm`；同一页面存在多个同名字段表单时也不会串焦点。
        </p>
        <CodeBlock>{serverErrorsCode}</CodeBlock>
      </section>

      <section className="content-section">
        <h2>7. 明确复杂值的提交格式</h2>
        <p>
          Picker、日期、树和上传 adapter 都生成原生 successful controls。数组默认使用同名重复条目；
          后端需要 JSON 或其他单值协议时，通过同步 `serializeValue` 显式声明。
        </p>
        <CodeBlock>{complexFormDataCode}</CodeBlock>
        <p>
          原生 <code>type="reset"</code> 会同步恢复 RHF 的值、dirty、touched 与错误；消费方在
          <code>onReset</code> 中调用 <code>preventDefault()</code> 可取消重置。
        </p>
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
