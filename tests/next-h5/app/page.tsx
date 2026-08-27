import { ConsumerScenario } from "./ConsumerScenario";

export default function IntegrationPage() {
  return (
    <main className="integration-shell">
      <header className="integration-header">
        <p className="integration-eyebrow">Meu Mobile / Isolated Consumer</p>
        <h1>Next H5 集成测试</h1>
        <p>在独立应用中验证 SSR、hydration、主题、组件样式和完整表单绑定。</p>
      </header>
      <ConsumerScenario />
    </main>
  );
}
