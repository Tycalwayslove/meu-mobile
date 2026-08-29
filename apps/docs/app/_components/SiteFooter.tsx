import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Meu Mobile</strong>
        <p>面向 Next.js H5 的私有移动组件系统。</p>
      </div>
      <nav aria-label="页脚导航">
        <Link href="/components">组件</Link>
        <Link href="/foundations">设计基础</Link>
        <a
          href="https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v"
          target="_blank"
          rel="noreferrer"
        >
          Figma
        </a>
        <Link href="/licenses">第三方许可</Link>
        <Link href="/privacy">隐私</Link>
        <Link href="/terms">使用说明</Link>
      </nav>
      <small>Private workspace · 未发布 npm · Chrome 70 / iOS 13+</small>
    </footer>
  );
}
