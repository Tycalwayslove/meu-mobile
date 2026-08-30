import Link from "next/link";

export default function NavBarContractListPage() {
  return (
    <main className="integration-shell nav-bar-contract-shell">
      <header className="integration-header">
        <p className="integration-eyebrow">Meu Mobile / Router Destination</p>
        <h1>订单列表</h1>
        <p>该页面证明 NavBar 的原生 href 与 Next Router adapter 指向同一真实目的地。</p>
      </header>
      <Link href="/nav-bar-contract">返回 NavBar 合同页</Link>
    </main>
  );
}
