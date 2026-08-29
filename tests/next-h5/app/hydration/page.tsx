import { HydrationScenario } from "./HydrationScenario";

type HydrationPageProps = {
  searchParams: Promise<{ case?: string }>;
};

export default async function HydrationPage({ searchParams }: HydrationPageProps) {
  const { case: requestedCase = "virtual-list" } = await searchParams;
  return (
    <main className="integration-shell">
      <header className="integration-header">
        <p className="integration-eyebrow">Meu Mobile / SSR Boundary</p>
        <h1>专项 Hydration 门禁</h1>
      </header>
      <HydrationScenario initialFormName="Server default" kind={requestedCase} />
    </main>
  );
}
