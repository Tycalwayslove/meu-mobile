// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Result } from "./Result";

describe("Result SSR", () => {
  it("renders a semantic heading and state-specific live region", () => {
    const error = renderToString(
      <Result status="error" headingLevel={3} role="alert" title="Failed" />
    );
    const pending = renderToString(<Result status="pending" title="Waiting" />);
    expect(error).toContain('role="alert"');
    expect(error).toContain("<h3");
    expect(pending).toContain('role="status"');
    expect(pending).toContain('data-status="pending"');
  });
});
