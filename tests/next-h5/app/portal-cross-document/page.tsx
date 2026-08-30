import { PortalCrossDocumentScenario } from "./PortalCrossDocumentScenario";

export default function PortalCrossDocumentPage() {
  return (
    <main className="integration-shell portal-contract-shell">
      <header className="integration-header">
        <p className="integration-eyebrow">Meu Mobile / Portal Boundary</p>
        <h1>Portal cross-document contract</h1>
        <p>真实同源 iframe 中验证容器归属、Provider、事件、焦点与卸载清理。</p>
      </header>
      <PortalCrossDocumentScenario />
    </main>
  );
}
