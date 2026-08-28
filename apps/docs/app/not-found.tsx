import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div>
        <p className="docs-eyebrow">Not found</p>
        <h1>404</h1>
        <p>这个页面还没有进入 Meu 的组件地图。</p>
        <Link href="/components">返回组件目录 →</Link>
      </div>
    </main>
  );
}
