import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Avatar } from "./Avatar";

describe("Avatar SSR", () => {
  it("renders a deterministic accessible fallback without browser globals", () => {
    const html = renderToString(<Avatar src="" alt="Ada Lovelace" initials="AL" loading="lazy" />);
    expect(html).toContain('data-meu-component="avatar"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Ada Lovelace"');
    expect(html).toContain("AL");
  });
});
