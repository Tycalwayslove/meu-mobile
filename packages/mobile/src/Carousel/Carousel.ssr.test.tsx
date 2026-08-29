// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Carousel } from "./Carousel";

describe("Carousel SSR", () => {
  it("renders stable inactive-slide, control, and position semantics without browser globals", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    const markup = renderToString(
      <ConfigProvider locale="en-US">
        <Carousel
          aria-label="Featured products"
          defaultIndex={1}
          items={[
            { key: "one", ariaLabel: "First product", content: <a href="/one">First</a> },
            { key: "two", ariaLabel: "Second product", content: <a href="/two">Second</a> }
          ]}
        />
      </ConfigProvider>
    );

    expect(markup).toContain('data-meu-component="carousel"');
    expect(markup).toContain('data-autoplay="false"');
    expect(markup).toContain('data-index="1"');
    expect(markup).toContain('aria-label="Previous slide"');
    expect(markup).toContain('aria-label="Next slide"');
    expect(markup).toContain('aria-hidden="true" inert=""');
    expect(markup).toContain('data-meu-carousel-status="true"');
    expect(markup).toContain("Second product, slide 2 of 2");
    expect(markup).not.toContain("Pause slide rotation");
  });
});
