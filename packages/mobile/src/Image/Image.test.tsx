// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Image } from "./Image";

describe("Image", () => {
  it("moves from loading to loaded while preserving native image props", () => {
    const onLoad = vi.fn();
    render(
      <Image
        src="/product.jpg"
        srcSet="/product@2x.jpg 2x"
        alt="商品主图"
        loading="lazy"
        onLoad={onLoad}
      />
    );
    const image = screen.getByRole("img", { name: "商品主图" });
    expect(image.getAttribute("loading")).toBe("lazy");
    expect(image.getAttribute("srcset")).toBe("/product@2x.jpg 2x");
    fireEvent.load(image);
    expect(onLoad).toHaveBeenCalledTimes(1);
    const root = image.closest('[data-meu-component="image"]');
    expect(root && root.getAttribute("data-state")).toBe("loaded");
  });

  it("shows an accessible fallback for missing and failed sources", () => {
    const { rerender } = render(<Image src="" alt="缺失图片" fallback="暂无图片" />);
    expect(screen.getByRole("img", { name: "缺失图片" })).toBeTruthy();
    expect(screen.getByText("暂无图片")).toBeTruthy();

    rerender(<Image src="/broken.jpg" alt="加载失败" fallback="加载失败" />);
    fireEvent.error(screen.getByRole("img", { name: "加载失败" }));
    expect(screen.getByText("加载失败").closest('[data-state="error"]')).toBeTruthy();
  });

  it("server-renders stable native markup and normalizes unsafe numeric geometry", () => {
    const markup = renderToString(
      <Image src="/ssr.jpg" alt="服务端图片" width={Number.NaN} height={-24} />
    );
    expect(markup).toContain('data-meu-component="image"');
    expect(markup).toContain("width:0px");
    expect(markup).toContain("height:0px");
    expect(markup).not.toContain("NaN");
  });
});
