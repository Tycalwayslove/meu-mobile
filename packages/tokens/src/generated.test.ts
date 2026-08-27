import { describe, expect, it } from "vitest";

import { meuTokens } from "./generated";

describe("generated design tokens", () => {
  it("keeps the Meu accent colors from the design source", () => {
    expect(meuTokens.color.light.accent.$value).toBe("#176B5B");
    expect(meuTokens.color.dark.accent.$value).toBe("#62B89D");
    expect(meuTokens.color.light["accent-contrast"].$value).toBe("#FFFFFF");
    expect(meuTokens.color.dark["accent-contrast"].$value).toBe("#161A17");
  });

  it("keeps the 44px minimum medium control size", () => {
    expect(meuTokens.size["control-medium"].$value).toBe("44px");
  });
});
