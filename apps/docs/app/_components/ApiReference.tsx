import type { ComponentApiProperty, ComponentApiReference } from "../_data/api-reference";
import { CodeBlock } from "./CodeBlock";

const kindLabels = { type: "Type", value: "Value" } as const;

function PropertyTable({ entries, title }: { entries: ComponentApiProperty[]; title: string }) {
  if (entries.length === 0) return null;
  return (
    <div className="api-reference__properties">
      <h3>{title}</h3>
      <div
        className="component-document__table-wrap"
        role="region"
        aria-label={`${title} 表格，可横向滚动`}
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col">名称</th>
              <th scope="col">类型</th>
              <th scope="col">必填</th>
              <th scope="col">默认值</th>
              <th scope="col">说明</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((property) => (
              <tr key={property.name}>
                <td>
                  <code>{property.name}</code>
                </td>
                <td>
                  <code>{property.type}</code>
                </td>
                <td>{property.required ? "是" : "否"}</td>
                <td>{property.defaultValue ? <code>{property.defaultValue}</code> : "—"}</td>
                <td>{property.description || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
        {entries.map((entry, index) =>
          (() => {
            const properties = entry.properties || [];
            const events = properties.filter((property) => property.event);
            const fields = properties.filter((property) => !property.event);
            const fieldTitle = entry.name.endsWith("Props") ? "Props" : "字段";
            return (
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
                  <PropertyTable title={fieldTitle} entries={fields} />
                  <PropertyTable title="Events" entries={events} />
                </div>
              </details>
            );
          })()
        )}
      </div>
    </section>
  );
}
