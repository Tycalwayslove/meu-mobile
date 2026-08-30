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
          Meu Mobile 源码目前可公开读取，但仓库尚未授予 Meu
          自有代码的使用、复制、修改或再分发许可；下列第三方实现和图形继续适用各自的开源许可证与署名要求。
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
        <h2>定位、样式与轮播能力</h2>
        <p>
          浮层定位使用 <code>@floating-ui/react@0.27.20</code>，样式配方使用
          <code>@vanilla-extract/recipes@0.5.7</code>，轮播能力使用
          <code>embla-carousel-react@8.6.0</code>；三者均适用 MIT License。
        </p>
        <ul className="license-links">
          <li>
            <a href="/licenses/floating-ui-mit.txt">查看 Floating UI MIT License</a>
          </li>
          <li>
            <a href="/licenses/vanilla-extract-mit.txt">查看 Vanilla Extract MIT License</a>
          </li>
          <li>
            <a href="/licenses/embla-carousel-mit.txt">查看 Embla Carousel MIT License</a>
          </li>
        </ul>
      </section>

      <section className="content-section">
        <h2>表单与数据校验</h2>
        <p>
          表单集成使用 <code>@hookform/resolvers@5.9.1</code>，并要求调用方提供
          <code>react-hook-form@7</code> 与 <code>zod@4</code>
          兼容版本；当前审计解析版本分别为 7.86.0 与 4.4.3。这些依赖均适用 MIT License。
        </p>
        <ul className="license-links">
          <li>
            <a href="/licenses/react-hook-form-mit.txt">
              查看 React Hook Form 与 Resolvers MIT License
            </a>
          </li>
          <li>
            <a href="/licenses/zod-mit.txt">查看 Zod MIT License</a>
          </li>
        </ul>
      </section>

      <section className="content-section">
        <h2>React 运行时</h2>
        <p>
          React 组件包要求调用方提供 <code>react@19</code> 与 <code>react-dom@19</code>
          兼容运行时；当前审计解析版本均为 19.2.8，两者适用同一份 MIT License。
        </p>
        <p>
          <a href="/licenses/react-mit.txt">查看 React 与 React DOM MIT License</a>
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
          组件包构建会将声明的 dependency 与 peer dependency 保持为外部包，不会嵌入 Meu JavaScript
          输出。直接运行时依赖的声明范围、当前锁定版本、许可证与许可副本由机器可读清单和
          <code>pnpm legal:check</code> 持续核对；依赖包自身携带的许可证仍是权威文本。
        </p>
        <p>
          本页用于披露工程来源与许可证文本，不构成法律意见。任何正式外部分发仍需由项目负责人或法务按实际交付方式确认。
        </p>
      </section>
    </main>
  );
}
