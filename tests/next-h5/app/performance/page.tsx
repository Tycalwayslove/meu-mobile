import { PerformanceScenario } from "./PerformanceScenario";

export default function PerformancePage() {
  return (
    <main className="integration-shell">
      <header className="integration-header">
        <p className="integration-eyebrow">Meu Mobile / Runtime Budget</p>
        <h1>运行时性能与恢复门禁</h1>
        <p>隔离验证大集合虚拟化、高频手势、取消恢复与可控网络故障。</p>
      </header>
      <PerformanceScenario />
    </main>
  );
}
