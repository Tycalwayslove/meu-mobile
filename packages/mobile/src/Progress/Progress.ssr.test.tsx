// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Progress } from "./Progress";

describe("Progress SSR", () => {
  it("renders deterministic determinate and indeterminate semantics without browser globals", () => {
    expect(typeof window).toBe("undefined");
    const determinate = renderToString(
      <Progress aria-label="Upload" value={125} valueText="Done" />
    );
    const indeterminate = renderToString(<Progress aria-label="Syncing" indeterminate />);
    expect(determinate).toContain('aria-valuenow="100"');
    expect(determinate).toContain('aria-valuetext="Done"');
    expect(indeterminate).not.toContain("aria-valuenow");
  });
});
