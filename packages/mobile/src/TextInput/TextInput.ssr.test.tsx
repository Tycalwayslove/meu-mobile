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

  it("renders deterministic password, loading and disabled states", () => {
    const password = renderToString(
      <TextInput
        aria-label="Password"
        autoComplete="current-password"
        clearable
        defaultValue="secret"
        loading
        name="password"
        type="password"
      />
    );
    const disabled = renderToString(
      <TextInput aria-label="Disabled name" defaultValue="Meu" disabled name="name" />
    );

    expect(password).toContain('type="password"');
    expect(password).toContain('autoComplete="current-password"');
    expect(password).toContain('aria-busy="true"');
    expect(password).toContain('role="status"');
    expect(password).not.toContain('type="button"');
    expect(disabled).toContain("disabled");
    expect(disabled).toContain('data-state="disabled"');
  });
});
