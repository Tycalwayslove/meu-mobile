import type { ReactNode } from "react";

import type {
  ComponentDocument as ComponentDocumentModel,
  ComponentDocumentBlock
} from "../_data/component-document";
import { CodeBlock } from "./CodeBlock";

function renderInline(text: string): ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={`${token}-${index}`}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>;
    }
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2]!;
      const safeHref = /^(https?:\/\/|\/|#)/.test(href);
      return safeHref ? (
        <a key={`${token}-${index}`} href={href}>
          {link[1]}
        </a>
      ) : (
        <span key={`${token}-${index}`}>{link[1]}</span>
      );
    }
    return token;
  });
}

function DocumentBlock({ block }: { block: ComponentDocumentBlock }) {
  if (block.type === "paragraph") return <p>{renderInline(block.text)}</p>;
  if (block.type === "heading") return <h3 id={block.id}>{block.text}</h3>;
  if (block.type === "code") return <CodeBlock label={block.language}>{block.value}</CodeBlock>;
  if (block.type === "list") {
    const List = block.ordered ? "ol" : "ul";
    return (
      <List>
        {block.items.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item)}</li>
        ))}
      </List>
    );
  }
  return (
    <div
      className="component-document__table-wrap"
      role="region"
      aria-label={`${block.headers.join("、")}表格，可横向滚动`}
      tabIndex={0}
    >
      <table>
        <thead>
          <tr>
            {block.headers.map((header) => (
              <th key={header} scope="col">
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`}>{renderInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  audit: "审查中",
  commercial: "商用就绪",
  design: "设计中",
  implementation: "开发中",
  verification: "验证中"
};

export function ComponentDocument({ document }: { document: ComponentDocumentModel }) {
  const { frontmatter, product } = document;
  const status = frontmatter.status || "audit";

  return (
    <div className="component-document">
      <section className="component-document__meta" aria-labelledby="v2-document-title">
        <div>
          <p className="docs-eyebrow">V2 持续维护文档</p>
          <h2 id="v2-document-title">能力、边界与验收状态</h2>
          <p>本页正文直接来自组件源码旁的文档；组件契约变化时必须同步更新。</p>
        </div>
        <dl>
          <div>
            <dt>状态</dt>
            <dd data-status={status}>{statusLabels[status] || status}</dd>
          </div>
          <div>
            <dt>引入版本</dt>
            <dd>{frontmatter.since || "未记录"}</dd>
          </div>
          <div>
            <dt>最近审查</dt>
            <dd>{frontmatter.lastReviewed || "未记录"}</dd>
          </div>
          <div>
            <dt>包</dt>
            <dd>
              <code>{frontmatter.packageName || product.packageName}</code>
            </dd>
          </div>
        </dl>
        <div className="component-document__exports" aria-label="由组件清单生成的公开 API">
          <strong>公开 API</strong>
          <div>
            {product.publicExports.map((item) => (
              <code key={`${item.kind}-${item.name}`} data-kind={item.kind}>
                {item.name}
              </code>
            ))}
          </div>
        </div>
      </section>

      {document.sections.map((section) => (
        <section
          className="component-section component-document__section"
          id={section.id}
          key={section.id}
          aria-labelledby={`${section.id}-title`}
        >
          <h2 id={`${section.id}-title`}>{section.title}</h2>
          {section.blocks.map((block, index) => (
            <DocumentBlock block={block} key={`${block.type}-${index}`} />
          ))}
        </section>
      ))}
    </div>
  );
}
