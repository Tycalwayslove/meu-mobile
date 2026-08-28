import type { Metadata } from "next";

export const metadata: Metadata = { title: "隐私说明" };

export default function PrivacyPage() {
  return (
    <main className="content-page">
      <header className="content-page__header">
        <p className="docs-eyebrow">Privacy</p>
        <h1>隐私说明</h1>
        <p>Meu Mobile 文档站不主动收集业务数据。</p>
      </header>
      <section className="content-section">
        <h2>当前范围</h2>
        <p>
          站点示例数据均为本地静态演示。主题偏好只保存在浏览器 localStorage 中，不发送至服务端。
        </p>
      </section>
      <section className="content-section">
        <h2>托管平台</h2>
        <p>
          线上托管平台可能按照其基础设施政策记录必要的访问与安全日志；正式开放前会在此补充对应服务商及保留周期。
        </p>
      </section>
    </main>
  );
}
