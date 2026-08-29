// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TextInput } from "./TextInput";

describe("TextInput SSR", () => {
  it("preserves a caller ARIA invalid token on the native input", () => {
    const markup = renderToString(
      <TextInput aria-invalid="spelling" aria-label="Store name" defaultValue="Meu" />
    );

    expect(markup).toContain('data-meu-component="text-input"');
    expect(markup).toContain('aria-invalid="spelling"');
    expect(markup.match(/aria-invalid=/g)).toHaveLength(1);
  });
});
