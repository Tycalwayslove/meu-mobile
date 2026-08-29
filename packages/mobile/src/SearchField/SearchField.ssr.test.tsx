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

  it("renders loading and disabled states without client-only branches", () => {
    const loading = renderToString(
      <SearchField aria-label="Search orders" defaultValue="Meu" loading />
    );
    const disabled = renderToString(
      <SearchField aria-label="Disabled search" defaultValue="Meu" disabled name="query" />
    );

    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('role="status"');
    expect(loading).toContain('data-state="loading"');
    expect(disabled).toContain("disabled");
    expect(disabled).toContain('data-state="disabled"');
  });
});
