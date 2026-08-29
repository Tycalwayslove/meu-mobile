// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SearchField } from "./SearchField";

describe("SearchField SSR", () => {
  it("preserves a caller ARIA invalid token on the native searchbox", () => {
    const markup = renderToString(
      <SearchField aria-invalid="grammar" aria-label="Search products" defaultValue="Meu" />
    );

    expect(markup).toContain('type="search"');
    expect(markup).toContain('aria-invalid="grammar"');
    expect(markup.match(/aria-invalid=/g)).toHaveLength(1);
  });
});
