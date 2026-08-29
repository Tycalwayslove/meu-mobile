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

  it("server-renders responsive image hints and normalized geometry", () => {
    const html = renderToString(
      <Avatar
        src="/avatar.jpg"
        srcSet="/avatar.jpg 1x, /avatar@2x.jpg 2x"
        sizes="56px"
        alt="Grace Hopper"
        size={Number.NaN}
        objectPosition="center 25%"
      />
    );
    expect(html).toContain('srcSet="/avatar.jpg 1x, /avatar@2x.jpg 2x"');
    expect(html).toContain('sizes="56px"');
    expect(html).toContain("--meu-avatar-size:44px");
    expect(html).toContain("--meu-avatar-object-position:center 25%");
    expect(html).not.toContain("NaN");
  });
});
