import type { Metadata } from "next";

export const metadata: Metadata = { title: "第三方许可" };

const iconCommit = "1a60fd28ed7111bbf6acedc0896f3d83cd73945a";

export default function LicensesPage() {
  return (
    <main className="content-page">
      <header className="content-page__header">
        <p className="docs-eyebrow">Licenses</p>
        <h1>第三方许可</h1>
        <p>
          Meu Mobile
          的自有代码目前保持私有；下列第三方实现和图形继续适用各自的开源许可证与署名要求。
        </p>
      </header>

      <section className="content-section">
        <h2>Lucide 与 Feather 图标</h2>
        <p>
          当前 Meu 图标集从 <code>lucide-static@1.34.0</code> 精选 5 个未修改的 SVG 几何，固定至
          Lucide commit <code>{iconCommit}</code>。这些图形由 Lucide 以 ISC License 提供，并由
          Lucide 标记为源自 Feather Icons，因此同时保留 Feather MIT License。
        </p>
        <p>
          <code>MeuIcon*</code> 与 kebab-case Meu ID 是组件库的稳定接口命名，不表示 Meu
          创作或拥有上游几何。
        </p>
        <ul className="license-links">
          <li>
            <a href="/licenses/lucide-isc.txt">查看 Lucide ISC 与内含 Feather 派生声明</a>
          </li>
          <li>
            <a href="/licenses/feather-mit.txt">查看 Feather MIT License</a>
          </li>
          <li>
            <a
              href={`https://github.com/lucide-icons/lucide/tree/${iconCommit}`}
              target="_blank"
              rel="noreferrer"
            >
              查看锁定的 Lucide 上游版本
            </a>
          </li>
        </ul>
      </section>

      <section className="content-section">
        <h2>TanStack Virtual</h2>
        <p>
          VirtualList、InfiniteList 与 TreeSelect 的虚拟化能力使用
          <code>@tanstack/react-virtual@3.14.10</code> 和<code>@tanstack/virtual-core@3.17.8</code>
          ，适用 MIT License。Meu 的公开 API 不暴露 TanStack 实现类型。
        </p>
        <p>
          <a href="/licenses/tanstack-virtual-mit.txt">查看 TanStack Virtual MIT License</a>
        </p>
      </section>

      <section className="content-section">
        <h2>工程来源记录</h2>
        <p>
          图标版本、npm 归档完整性、Git commit、逐文件与逐几何 SHA-256、Meu ID
          映射及修改状态均由仓库中的 lock、manifest、上游快照和离线漂移检查固定。许可文本也会随
          <code>@meu/icons-core</code> 的实际制品一同打包。
        </p>
        <p>
          本页用于披露工程来源与许可证文本，不构成法律意见。任何正式外部分发仍需由项目负责人或法务按实际交付方式确认。
        </p>
      </section>
    </main>
  );
}
