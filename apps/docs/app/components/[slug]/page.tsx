import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CodeBlock } from "../../_components/CodeBlock";
import { ComponentPreview } from "../../_components/ComponentPreview";
import { ComponentSidebar } from "../../_components/ComponentSidebar";
import {
  componentDocs,
  getAdjacentComponents,
  getCategory,
  getComponentDoc
} from "../../_data/components";

export function generateStaticParams() {
  return componentDocs.map((component) => ({ slug: component.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const component = getComponentDoc(slug);
  if (!component) return {};
  return {
    title: component.name,
    description: component.description
  };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getComponentDoc(slug);
  if (!component) notFound();

  const category = getCategory(component.category);
  const adjacent = getAdjacentComponents(component.slug);
  const storybookBase = process.env.NEXT_PUBLIC_STORYBOOK_URL;
  const storybookUrl =
    storybookBase && component.storyId
      ? `${storybookBase.replace(/\/$/, "")}/?path=/story/${component.storyId}`
      : undefined;
  const importExample = `import { ${component.name} } from "${component.packageName}";\n\nexport function Example() {\n  return <${component.name} />;\n}`;

  return (
    <main className="component-layout">
      <ComponentSidebar currentSlug={component.slug} />
      <article className="component-article">
        <header className="component-heading">
          <div>
            <p className="docs-eyebrow">{category ? category.label : "Component"}</p>
            <h1>{component.name}</h1>
            <p>{component.description}</p>
          </div>
          <div className="component-heading__meta" aria-label="组件元数据">
            <span className="meta-pill">{component.priority}</span>
            <span className="meta-pill">React</span>
          </div>
        </header>

        <section className="component-section" aria-labelledby="preview-title">
          <h2 id="preview-title">交互预览</h2>
          <p>下方由真实组件渲染，可直接操作并切换站点主题。</p>
          <div className="preview-frame">
            <ComponentPreview slug={component.slug} />
          </div>
        </section>

        <section className="component-section" aria-labelledby="contract-title">
          <h2 id="contract-title">核心契约</h2>
          <ul className="component-highlights">
            {component.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </section>

        <section className="component-section" aria-labelledby="usage-title">
          <h2 id="usage-title">工作区用法</h2>
          <p>
            当前版本保持私有，不发布 npm。应用通过 pnpm workspace
            直接消费对应包，并在入口引入全局样式。
          </p>
          <CodeBlock>{importExample}</CodeBlock>
        </section>

        <section className="component-section" aria-labelledby="resources-title">
          <h2 id="resources-title">设计与源码</h2>
          <div className="component-links">
            <a
              href={`https://github.com/Tycalwayslove/meu-mobile/tree/main/${component.sourcePath}`}
              target="_blank"
              rel="noreferrer"
            >
              查看源码 ↗
            </a>
            <a
              href="https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v"
              target="_blank"
              rel="noreferrer"
            >
              查看 Figma ↗
            </a>
            {storybookUrl ? (
              <a href={storybookUrl} target="_blank" rel="noreferrer">
                在 Storybook 打开 ↗
              </a>
            ) : (
              <Link href="/lab">Storybook 发布说明 →</Link>
            )}
          </div>
        </section>

        <nav className="component-pager" aria-label="相邻组件">
          {adjacent.previous ? (
            <Link href={`/components/${adjacent.previous.slug}`}>← {adjacent.previous.name}</Link>
          ) : (
            <span />
          )}
          {adjacent.next ? (
            <Link href={`/components/${adjacent.next.slug}`}>{adjacent.next.name} →</Link>
          ) : null}
        </nav>
      </article>
    </main>
  );
}
