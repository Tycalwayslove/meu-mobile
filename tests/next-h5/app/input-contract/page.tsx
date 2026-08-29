import Link from "next/link";

import { InputContractScenario } from "./InputContractScenario";

export default function InputContractPage() {
  return (
    <main className="integration-shell input-contract-shell">
      <header className="integration-header">
        <p className="integration-eyebrow">Meu Mobile / Input Contract</p>
        <h1>移动输入生命周期门禁</h1>
        <p>隔离验证外部表单、IME、粘贴、请求竞态、受控拒绝和响应式自动高度。</p>
        <nav className="verification-links" aria-label="输入门禁相关页面">
          <Link href="/">完整组件消费场景</Link>
          <Link href="/verification">真机验收工作台</Link>
        </nav>
      </header>
      <InputContractScenario />
    </main>
  );
}
