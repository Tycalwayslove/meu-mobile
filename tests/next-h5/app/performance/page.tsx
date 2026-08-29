import { PerformanceScenario } from "./PerformanceScenario";

export default function PerformancePage() {
  return (
    <main className="integration-shell">
      <header className="integration-header">
        <p className="integration-eyebrow">Meu Mobile / Runtime Budget</p>
        <h1>运行时性能门禁</h1>
        <p>隔离验证大集合虚拟化、树形筛选与高频手势事件成本。</p>
      </header>
      <PerformanceScenario />
    </main>
  );
}
