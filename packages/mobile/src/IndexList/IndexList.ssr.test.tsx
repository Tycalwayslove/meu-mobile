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
  });
});
