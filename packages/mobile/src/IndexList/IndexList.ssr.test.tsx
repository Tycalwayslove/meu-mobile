// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { IndexList } from "./IndexList";

describe("IndexList SSR", () => {
  it("renders deterministic section and rail semantics without browser globals", () => {
    const markup = renderToString(
      <IndexList
        aria-label="Contacts"
        sections={[
          { key: "a", ariaLabel: "A contacts", brief: "A", content: "Ada", title: "A" },
          { key: "b", ariaLabel: "B contacts", brief: "B", content: "Bob", title: "B" }
        ]}
      />
    );
    expect(markup).toContain('data-meu-component="index-list"');
    expect(markup).toContain('aria-label="A contacts"');
    expect(markup).toContain('aria-current="location"');
    const control = markup.match(/aria-controls="([^"]+-section-61)"/);
    expect(control).not.toBeNull();
    expect(markup).toContain(`id="${control ? control[1] : "missing"}"`);
  });

  it("deduplicates section identity and normalizes controlled keys during SSR", () => {
    const markup = renderToString(
      <IndexList
        activeKey="missing"
        sections={[
          { key: "a", content: "First A", title: "A" },
          { key: "b", content: "B", title: "B" },
          { key: "a", content: "Duplicate A", title: "Duplicate" }
        ]}
      />
    );

    expect(markup).toContain("First A");
    expect(markup).not.toContain("Duplicate A");
    expect(markup.match(/data-index-key=/g)).toHaveLength(2);
    expect(markup.match(/aria-current="location"/g)).toHaveLength(1);
  });

  it("omits an empty index landmark and active semantics", () => {
    const markup = renderToString(<IndexList sections={[]} />);
    expect(markup).toContain('data-empty="true"');
    expect(markup).not.toContain("<nav");
    expect(markup).not.toContain("aria-current");
  });
});
