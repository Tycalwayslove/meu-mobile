import type { ComponentApiReference } from "../_data/api-reference";
import { CodeBlock } from "./CodeBlock";

const kindLabels = { type: "Type", value: "Value" } as const;

export function ApiReference({
  entries,
  packageName
}: {
  entries: ComponentApiReference[];
  packageName: string;
}) {
  if (entries.length === 0) return null;

  return (
    <section
      className="component-section api-reference"
      id="api-reference"
      aria-labelledby="api-reference-title"
    >
      <div className="api-reference__heading">
        <div>
          <p className="docs-eyebrow">Generated from source</p>
          <h2 id="api-reference-title">API 参考</h2>
          <p>
            以下声明由 API Extractor 从 <code>{packageName}</code> 当前公开入口生成，不是手写副本。
            Props、Events 和辅助类型变更后会随代码同步。
          </p>
        </div>
        <span>{entries.length} exports</span>
      </div>
      <div className="api-reference__list">
        {entries.map((entry, index) => (
          <details
            className="api-reference__entry"
            key={`${entry.kind}-${entry.name}`}
            open={index < 3 || entry.name.endsWith("Props")}
          >
            <summary>
              <code>{entry.name}</code>
              <span>{kindLabels[entry.kind]}</span>
            </summary>
            <div className="api-reference__content">
              {entry.description ? <p>{entry.description}</p> : null}
              <CodeBlock label="typescript">{entry.signature}</CodeBlock>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
