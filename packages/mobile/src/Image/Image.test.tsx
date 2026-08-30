// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Image } from "./Image";

afterEach(() => vi.restoreAllMocks());

describe("Image", () => {
  it("moves from loading to loaded while preserving native request semantics", () => {
    const onLoad = vi.fn();
    render(
      <Image
        src=" /product.jpg "
        srcSet=" /product-480.jpg 480w, /product-960.jpg 960w "
        sizes="(max-width: 480px) 100vw, 480px"
        alt="商品主图"
        loading="lazy"
        decoding="sync"
        fetchPriority="high"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onLoad={onLoad}
      />
    );

    const image = screen.getByRole("img", { name: "商品主图" });
    const root = image.closest('[data-meu-component="image"]');
    expect(root).toBeTruthy();
    expect(root!.getAttribute("data-state")).toBe("loading");
    expect(root!.getAttribute("aria-busy")).toBe("true");
    expect(image.getAttribute("src")).toBe("/product.jpg");
    expect(image.getAttribute("srcset")).toBe("/product-480.jpg 480w, /product-960.jpg 960w");
    expect(image.getAttribute("sizes")).toBe("(max-width: 480px) 100vw, 480px");
    expect(image.getAttribute("loading")).toBe("lazy");
    expect(image.getAttribute("decoding")).toBe("sync");
    expect(image.getAttribute("fetchpriority")).toBe("high");
    expect(image.getAttribute("crossorigin")).toBe("anonymous");
    expect(image.getAttribute("referrerpolicy")).toBe("no-referrer");

    fireEvent.load(image);
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(root!.getAttribute("data-state")).toBe("loaded");
    expect(root!.hasAttribute("aria-busy")).toBe(false);
  });

  it("reserves responsive geometry and merges native image customization", () => {
    render(
      <Image
        src="/crop.jpg"
        alt="裁切预览"
        width={320}
        height={180}
        aspectRatio="16 / 9"
        intrinsicWidth={640}
        intrinsicHeight={360}
        fit="contain"
        position="left 25%"
        radius="surface"
        data-testid="root"
        imageProps={{
          "aria-describedby": "crop-help",
          className: "consumer-image",
          style: { filter: "contrast(1.1)" },
          title: "原生标题"
        }}
      />
    );

    const root = screen.getByTestId("root");
    const image = screen.getByRole("img", { name: "裁切预览" });
    expect(root.style.width).toBe("320px");
    expect(root.style.height).toBe("");
    expect(root.style.aspectRatio).toBe("16 / 9");
    expect(image.getAttribute("width")).toBe("640");
    expect(image.getAttribute("height")).toBe("360");
    expect(image.getAttribute("aria-describedby")).toBe("crop-help");
    expect(image.getAttribute("title")).toBe("原生标题");
    expect(image.classList.contains("consumer-image")).toBe(true);
    expect(image.style.objectFit).toBe("contain");
    expect(image.style.objectPosition).toBe("left 25%");
    expect(image.style.filter).toBe("contrast(1.1)");
  });

  it("uses one fallback source before exposing the visual fallback", () => {
    const onError = vi.fn();
    const onLoad = vi.fn();
    render(
      <Image
        src="/primary.jpg"
        srcSet="/primary-2x.jpg 2x"
        fallbackSrc="/backup.jpg"
        alt="有备份的图片"
        fallback="最终不可用"
        onError={onError}
        onLoad={onLoad}
      />
    );

    const primary = screen.getByRole("img", { name: "有备份的图片" });
    fireEvent.error(primary);
    const backup = screen.getByRole("img", { name: "有备份的图片" });
    const root = backup.closest('[data-meu-component="image"]');
    expect(root).toBeTruthy();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(root!.getAttribute("data-state")).toBe("loading");
    expect(root!.getAttribute("data-source")).toBe("fallback");
    expect(backup.getAttribute("src")).toBe("/backup.jpg");
    expect(backup.hasAttribute("srcset")).toBe(false);

    fireEvent.load(backup);
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(root!.getAttribute("data-state")).toBe("loaded");
  });

  it("reports the final error when both primary and fallback requests fail", () => {
    const onError = vi.fn();
    render(
      <Image
        src="/primary.jpg"
        fallbackSrc="/backup.jpg"
        alt="加载失败"
        fallback="最终不可用"
        onError={onError}
      />
    );

    fireEvent.error(screen.getByRole("img", { name: "加载失败" }));
    fireEvent.error(screen.getByRole("img", { name: "加载失败" }));

    expect(onError).toHaveBeenCalledTimes(2);
    const fallbackRoot = screen.queryByRole("img", { name: "加载失败" });
    expect(fallbackRoot).toBeTruthy();
    expect(fallbackRoot!.tagName).toBe("DIV");
    expect(screen.getByText("最终不可用").closest('[data-state="error"]')).toBeTruthy();
  });

  it("uses fallbackSrc immediately when the primary source is absent", () => {
    render(<Image src="  " fallbackSrc=" /backup.jpg " alt="备份图片" />);
    const image = screen.getByRole("img", { name: "备份图片" });
    expect(image.getAttribute("src")).toBe("/backup.jpg");
    expect(image.closest('[data-source="fallback"]')).toBeTruthy();
  });

  it("resets the lifecycle when responsive sources change", () => {
    const { rerender } = render(<Image src="/first.jpg" alt="动态图片" />);
    const first = screen.getByRole("img", { name: "动态图片" });
    fireEvent.load(first);
    expect(first.closest('[data-state="loaded"]')).toBeTruthy();

    rerender(<Image src="/second.jpg" alt="动态图片" />);
    const second = screen.getByRole("img", { name: "动态图片" });
    expect(second.getAttribute("src")).toBe("/second.jpg");
    expect(second.closest('[data-state="loading"]')).toBeTruthy();
  });

  it("does not revive stale error state when a source key returns before the next source loads", () => {
    const { rerender } = render(<Image src="/first.jpg" alt="回环图片" />);
    let image = screen.getByRole("img", { name: "回环图片" });
    fireEvent.error(image);
    expect(screen.getByRole("img", { name: "回环图片" }).tagName).toBe("DIV");

    rerender(<Image src="/second.jpg" alt="回环图片" />);
    image = screen.getByRole("img", { name: "回环图片" });
    expect(image.getAttribute("src")).toBe("/second.jpg");

    rerender(<Image src="/first.jpg" alt="回环图片" />);
    image = screen.getByRole("img", { name: "回环图片" });
    expect(image.tagName).toBe("IMG");
    expect(image.getAttribute("src")).toBe("/first.jpg");
    expect(image.closest('[data-state="loading"]')).toBeTruthy();
  });

  it("does not revive stale loaded state when a source key returns before the next source loads", () => {
    const { rerender } = render(<Image src="/first.jpg" alt="回环图片" />);
    let image = screen.getByRole("img", { name: "回环图片" });
    fireEvent.load(image);
    expect(image.closest('[data-state="loaded"]')).toBeTruthy();

    rerender(<Image src="/second.jpg" alt="回环图片" />);
    image = screen.getByRole("img", { name: "回环图片" });
    expect(image.getAttribute("src")).toBe("/second.jpg");
    expect(image.closest('[data-state="loading"]')).toBeTruthy();

    rerender(<Image src="/first.jpg" alt="回环图片" />);
    image = screen.getByRole("img", { name: "回环图片" });
    expect(image.getAttribute("src")).toBe("/first.jpg");
    expect(image.closest('[data-state="loading"]')).toBeTruthy();
  });

  it("detects an image that completed from browser cache before the effect runs", () => {
    const onLoad = vi.fn();
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(640);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    render(<Image src="/cached.jpg" alt="缓存图片" onLoad={onLoad} />);

    expect(
      screen.getByRole("img", { name: "缓存图片" }).closest('[data-state="loaded"]')
    ).toBeTruthy();
    expect(onLoad).not.toHaveBeenCalled();
  });

  it("recovers a cached primary failure through fallbackSrc without synthesizing events", () => {
    const onError = vi.fn();
    vi.spyOn(HTMLImageElement.prototype, "complete", "get")
      .mockReturnValueOnce(true)
      .mockReturnValue(false);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(0);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    render(
      <Image
        src="/cached-broken.jpg"
        fallbackSrc="/backup.jpg"
        alt="缓存失败图片"
        onError={onError}
      />
    );

    const backup = screen.getByRole("img", { name: "缓存失败图片" });
    expect(backup.getAttribute("src")).toBe("/backup.jpg");
    expect(backup.closest('[data-source="fallback"][data-state="loading"]')).toBeTruthy();
    expect(onError).not.toHaveBeenCalled();
  });

  it("treats srcSet as a requestable primary source and keeps fallback request controls", () => {
    render(
      <Image
        srcSet=" /product.webp 1x, /product-2x.webp 2x "
        sizes="50vw"
        fallbackSrc=" /backup.webp "
        alt="响应式图片"
        crossOrigin="use-credentials"
        loading="lazy"
        referrerPolicy="same-origin"
      />
    );

    const primary = screen.getByRole("img", { name: "响应式图片" });
    expect(primary.hasAttribute("src")).toBe(false);
    expect(primary.getAttribute("srcset")).toBe("/product.webp 1x, /product-2x.webp 2x");
    expect(primary.getAttribute("sizes")).toBe("50vw");

    fireEvent.error(primary);
    const backup = screen.getByRole("img", { name: "响应式图片" });
    expect(backup.getAttribute("src")).toBe("/backup.webp");
    expect(backup.hasAttribute("srcset")).toBe(false);
    expect(backup.hasAttribute("sizes")).toBe(false);
    expect(backup.getAttribute("crossorigin")).toBe("use-credentials");
    expect(backup.getAttribute("loading")).toBe("lazy");
    expect(backup.getAttribute("referrerpolicy")).toBe("same-origin");
  });

  it("guards the informative and decorative naming contract from unsafe imageProps", () => {
    const { rerender } = render(
      <Image
        src="/named.jpg"
        alt="商品图片"
        imageProps={
          {
            "aria-hidden": true,
            "aria-label": "错误覆盖",
            role: "presentation"
          } as never
        }
      />
    );
    const informative = screen.getByRole("img", { name: "商品图片" });
    expect(informative.getAttribute("aria-hidden")).toBeNull();
    expect(informative.getAttribute("aria-label")).toBeNull();
    expect(informative.getAttribute("role")).toBeNull();

    rerender(
      <Image
        src="/decorative.jpg"
        alt=""
        imageProps={{ "aria-label": "不应暴露", role: "img" } as never}
      />
    );
    expect(screen.queryByRole("img")).toBeNull();
    const decorativeImage = document.querySelector("img");
    expect(decorativeImage && decorativeImage.getAttribute("aria-hidden")).toBe("true");
  });

  it("keeps failed decorative images out of the accessibility tree", () => {
    const { rerender } = render(<Image src="" alt="" fallback="装饰占位" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("装饰占位").closest('[aria-hidden="true"]')).toBeTruthy();

    rerender(<Image src="/broken.jpg" alt="" fallback="装饰失败" />);
    fireEvent.error(document.querySelector("img")!);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("装饰失败").closest('[aria-hidden="true"]')).toBeTruthy();
  });

  it("normalizes unsafe numeric geometry without changing CSS string dimensions", () => {
    const { rerender } = render(
      <Image src="/size.jpg" alt="尺寸" width={Number.NaN} height={-24} data-testid="root" />
    );
    let image = screen.getByRole("img", { name: "尺寸" });
    expect(screen.getByTestId("root").style.width).toBe("0px");
    expect(screen.getByTestId("root").style.height).toBe("0px");
    expect(image.getAttribute("width")).toBe("0");
    expect(image.getAttribute("height")).toBe("0");

    rerender(<Image src="/size.jpg" alt="尺寸" width="100%" height="12rem" data-testid="root" />);
    image = screen.getByRole("img", { name: "尺寸" });
    expect(screen.getByTestId("root").style.width).toBe("100%");
    expect(screen.getByTestId("root").style.height).toBe("12rem");
    expect(image.hasAttribute("width")).toBe(false);
    expect(image.hasAttribute("height")).toBe(false);
  });

  it("lets explicit empty CSS dimensions override root style dimensions", () => {
    render(
      <Image
        src="/size.jpg"
        alt="空尺寸"
        width=""
        height=""
        style={{ width: 320, height: 180 }}
        data-testid="root"
      />
    );

    const root = screen.getByTestId("root");
    expect(root.style.width).toBe("");
    expect(root.style.height).toBe("");
  });

  it("preserves localized long fallback content and direction without adding interaction", () => {
    const longFallback =
      "تعذر تحميل صورة المنتج MEU-2026-SUPER-LONG-UNBROKEN-IDENTIFIER، يرجى المحاولة لاحقًا";
    render(
      <Image
        src=""
        alt="صورة المنتج"
        fallback={longFallback}
        dir="rtl"
        lang="ar"
        data-testid="root"
      />
    );

    const root = screen.getByTestId("root");
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(root.getAttribute("lang")).toBe("ar");
    expect(root.getAttribute("tabindex")).toBeNull();
    expect(screen.getByRole("img", { name: "صورة المنتج" })).toBe(root);
    expect(screen.getByText(longFallback)).toBeTruthy();
  });

  it("keeps root and native image refs separate and clears imageRef after failure", () => {
    const rootRef = createRef<HTMLDivElement>();
    const imageRef = vi.fn();
    render(<Image ref={rootRef} imageRef={imageRef} src="/broken.jpg" alt="ref 图片" />);

    const image = screen.getByRole("img", { name: "ref 图片" });
    expect(rootRef.current).toBeTruthy();
    expect(rootRef.current!.dataset.meuComponent).toBe("image");
    expect(imageRef).toHaveBeenLastCalledWith(image);
    fireEvent.error(image);
    expect(imageRef).toHaveBeenLastCalledWith(null);
  });

  it("runs React 19 image callback-ref cleanup without a legacy null call", () => {
    const cleanup = vi.fn();
    const imageRef = vi.fn(() => cleanup);
    const { unmount } = render(
      <Image imageRef={imageRef} src="/ref-cleanup.jpg" alt="cleanup 图片" />
    );

    expect(imageRef).toHaveBeenCalledTimes(1);
    expect(imageRef).toHaveBeenCalledWith(screen.getByRole("img", { name: "cleanup 图片" }));
    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
    expect(imageRef).toHaveBeenCalledTimes(1);
  });
});
