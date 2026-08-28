// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./Skeleton";

describe("Skeleton SSR", () => {
  it("renders stable reserved geometry and remains decorative", () => {
    const markup = renderToString(
      <Skeleton animated aspectRatio="16 / 9" height="auto" variant="rectangle" />
    );
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("--meu-skeleton-aspect-ratio:16 / 9");
    expect(markup).toContain('data-animated="true"');
  });
});
