import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Image } from "./Image";

describe("Image SSR", () => {
  it("renders deterministic loading markup with native dimensions and responsive hints", () => {
    const html = renderToString(
      <Image
        src="/hero.jpg"
        srcSet="/hero-480.jpg 480w, /hero-960.jpg 960w"
        sizes="100vw"
        alt="服务端主图"
        width="100%"
        aspectRatio="16 / 9"
        intrinsicWidth={960}
        intrinsicHeight={540}
        loading="lazy"
      />
    );

    expect(html).toContain('data-meu-component="image"');
    expect(html).toContain('data-state="loading"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('width="960"');
    expect(html).toContain('height="540"');
    expect(html).toContain('srcSet="/hero-480.jpg 480w, /hero-960.jpg 960w"');
    expect(html).toContain('sizes="100vw"');
    expect(html).not.toContain("NaN");
  });

  it("renders an accessible fallback without an img when no requestable source exists", () => {
    const informative = renderToString(<Image src=" " alt="图片缺失" fallback="暂无图片" />);
    const decorative = renderToString(<Image alt="" fallback="装饰占位" />);

    expect(informative).toContain('role="img"');
    expect(informative).toContain('aria-label="图片缺失"');
    expect(informative).not.toContain("<img");
    expect(decorative).toContain('aria-hidden="true"');
  });

  it("starts with fallbackSrc when the primary source is absent", () => {
    const html = renderToString(
      <Image src="" fallbackSrc="/backup.jpg" alt="服务端备份图片" loading="lazy" />
    );

    expect(html).toContain('data-source="fallback"');
    expect(html).toContain('src="/backup.jpg"');
    expect(html).toContain('alt="服务端备份图片"');
  });

  it("renders a srcSet-only primary source without inventing a src", () => {
    const html = renderToString(
      <Image srcSet="/hero.webp 1x, /hero-2x.webp 2x" sizes="50vw" alt="响应式主图" />
    );

    expect(html).toContain('data-source="primary"');
    expect(html).toContain('data-state="loading"');
    expect(html).toContain('srcSet="/hero.webp 1x, /hero-2x.webp 2x"');
    expect(html).toContain('sizes="50vw"');
    expect(html).not.toMatch(/<img[^>]*\ssrc=/);
  });
});
