import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CodeBlock } from "../../_components/CodeBlock";
import { ApiReference } from "../../_components/ApiReference";
import { ComponentDocument } from "../../_components/ComponentDocument";
import { ComponentPreview } from "../../_components/ComponentPreview";
import { ComponentSidebar } from "../../_components/ComponentSidebar";
import { getComponentDocument, getComponentManifestProduct } from "../../_data/component-document";
import { getComponentApiReference } from "../../_data/api-reference";
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

  const manifestProduct = getComponentManifestProduct(component.slug);
  const apiReference = manifestProduct ? getComponentApiReference(manifestProduct) : [];
  const v2Document = getComponentDocument(component.slug);
  const category = getCategory(component.category);
  const adjacent = getAdjacentComponents(component.slug);
  const storybookBase = process.env.NEXT_PUBLIC_STORYBOOK_URL;
  const documentedStoryIds = v2Document ? v2Document.frontmatter.storyIds : [];
  const storyIds =
    documentedStoryIds.length > 0
      ? documentedStoryIds
      : manifestProduct && manifestProduct.storyId
        ? [manifestProduct.storyId]
        : component.storyId
          ? [component.storyId]
          : [];
  const storybookUrls = storybookBase
    ? storyIds.map((storyId) => ({
        href: `${storybookBase.replace(/\/$/, "")}/?path=/story/${storyId}`,
        storyId
      }))
    : [];
  const sourcePath = manifestProduct ? manifestProduct.sourcePath : component.sourcePath;
  const figma = v2Document ? v2Document.frontmatter.figma : undefined;
  const figmaFileKey = figma ? figma.fileKey : undefined;
  const figmaNodeId = figma ? figma.nodeId : undefined;
  const figmaUrl = figmaFileKey
    ? `https://www.figma.com/design/${figmaFileKey}${
        figmaNodeId ? `?node-id=${figmaNodeId.replace(":", "-")}` : ""
      }`
    : "https://www.figma.com/design/1EjHFQkfyM4FNsfIuhFF1v";
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
            <span className="meta-pill">
              {manifestProduct ? manifestProduct.priority : component.priority}
            </span>
            <span className="meta-pill">React</span>
            {v2Document ? <span className="meta-pill">V2 文档</span> : null}
          </div>
        </header>

        <section className="component-section" aria-labelledby="preview-title">
          <h2 id="preview-title">交互预览</h2>
          <p>下方由真实组件渲染，可直接操作并切换站点主题。</p>
          <div className="preview-frame">
            <ComponentPreview slug={component.slug} />
          </div>
        </section>

        {v2Document ? (
          <ComponentDocument document={v2Document} />
        ) : (
          <>
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
          </>
        )}

        <ApiReference entries={apiReference} packageName={component.packageName} />

        <section className="component-section" aria-labelledby="resources-title">
          <h2 id="resources-title">设计与源码</h2>
          <div className="component-links">
            <a
              href={`https://github.com/Tycalwayslove/meu-mobile/tree/main/${sourcePath}`}
              target="_blank"
              rel="noreferrer"
            >
              查看源码 ↗
            </a>
            <a href={figmaUrl} target="_blank" rel="noreferrer">
              查看 Figma ↗
            </a>
            {storybookUrls.length > 0 ? (
              storybookUrls.map(({ href, storyId }, index) => (
                <a href={href} target="_blank" rel="noreferrer" key={storyId}>
                  {storybookUrls.length > 1 ? `Story ${index + 1}` : "在 Storybook 打开"} ↗
                </a>
              ))
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
