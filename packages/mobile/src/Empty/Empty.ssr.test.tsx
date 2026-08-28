// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Empty } from "./Empty";

describe("Empty SSR", () => {
  it("renders stable labelled empty-state markup without requiring an action", () => {
    const markup = renderToString(
      <Empty reason="not-configured" title="Not configured" description="Complete setup first." />
    );
    expect(markup).toContain('role="group"');
    expect(markup).toContain('data-reason="not-configured"');
    expect(markup).toContain("Not configured");
    expect(markup).not.toContain('data-meu-slot="actions"');
  });
});
