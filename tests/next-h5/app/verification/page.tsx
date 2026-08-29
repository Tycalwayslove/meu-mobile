import Link from "next/link";

import { ManualVerificationScenario } from "./ManualVerificationScenario";

export default function VerificationPage() {
  return (
    <main className="integration-shell verification-shell">
      <header className="integration-header">
        <p className="integration-eyebrow">Meu Mobile / Release Candidate</p>
        <h1>真机商用验收工作台</h1>
        <p>
          用于候选版本的 60 秒持续性能、网络恢复、设备环境与 D-01～D-06
          人工结果留证。自动采样不能替代人工判断。
        </p>
        <nav className="verification-links" aria-label="验收相关页面">
          <Link href="/">完整组件消费场景</Link>
          <Link href="/performance">自动性能与恢复门禁</Link>
        </nav>
      </header>
      <ManualVerificationScenario />
    </main>
  );
}
