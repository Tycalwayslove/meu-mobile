// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ImageViewer } from "./ImageViewer";
import { ConfigProvider } from "../ConfigProvider";
import type { ImageViewerRef } from "./types";

const embla = vi.hoisted(() => {
  type Listener = () => void;
  const listeners = new Map<string, Set<Listener>>();
  let initialized = false;
  let selected = 0;
  let loop = false;

  const emit = (event: string) => {
    const entries = listeners.get(event);
    if (entries) entries.forEach((listener) => listener());
  };
  const select = (nextIndex: number) => {
    selected = loop ? (nextIndex + 3) % 3 : Math.min(Math.max(nextIndex, 0), 2);
    emit("select");
  };
  const api = {
    off: vi.fn((event: string, listener: Listener) => {
      const entries = listeners.get(event);
      if (entries) entries.delete(listener);
      return api;
    }),
    on: vi.fn((event: string, listener: Listener) => {
      const entries = listeners.get(event) || new Set<Listener>();
      entries.add(listener);
      listeners.set(event, entries);
      return api;
    }),
    scrollNext: vi.fn(() => select(selected + 1)),
    scrollPrev: vi.fn(() => select(selected - 1)),
    scrollTo: vi.fn((index: number) => select(index)),
    selectedScrollSnap: vi.fn(() => selected)
  };

  return {
    api,
    reset() {
      initialized = false;
      selected = 0;
      loop = false;
      listeners.clear();
      Object.values(api).forEach((method) => method.mockClear());
    },
    setup(options: { loop?: boolean; startIndex?: number }) {
      loop = Boolean(options.loop);
      if (initialized) return;
      initialized = true;
      selected = options.startIndex || 0;
    }
  };
});

vi.mock("embla-carousel-react", () => ({
  default: (options: { loop?: boolean; startIndex?: number }) => {
    embla.setup(options);
    return [vi.fn(), embla.api] as const;
  }
}));

const images = [
  { alt: "商品正面", key: "front", src: "/front.svg" },
  { alt: "商品侧面", key: "side", src: "/side.svg" },
  { alt: "商品细节", key: "detail", src: "/detail.svg" }
] as const;

beforeEach(() => {
  embla.reset();
  vi.stubGlobal("scrollTo", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ImageViewer", () => {
  it("server-renders closed without browser globals", () => {
    const renderFooter = vi.fn(() => "说明");
    expect(renderToString(<ImageViewer images={images} renderFooter={renderFooter} />)).toBe("");
    expect(renderFooter).not.toHaveBeenCalled();
  });

  it("uses modal semantics, locks scroll, closes with Escape and restores focus", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "查看大图";
    document.body.append(trigger);
    trigger.focus();
    const onOpenChange = vi.fn();
    const { rerender } = render(<ImageViewer open images={images} onOpenChange={onOpenChange} />);

    const viewer = screen.getByRole("dialog", { name: "图片预览" });
    expect(viewer.getAttribute("aria-modal")).toBe("true");
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "关闭图片预览" }))
    );

    fireEvent.keyDown(document.activeElement || document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "escape" });
    rerender(<ImageViewer open={false} images={images} onOpenChange={onOpenChange} />);
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(document.body.hasAttribute("data-meu-scroll-locked")).toBe(false);
    trigger.remove();
  });

  it("keeps a controlled index authoritative and reports navigation reasons", () => {
    const onIndexChange = vi.fn();
    const { rerender } = render(
      <ImageViewer open images={images} index={0} onIndexChange={onIndexChange} />
    );
    const viewer = screen.getByRole("dialog", { name: "图片预览" });

    fireEvent.click(screen.getByRole("button", { name: "下一张图片" }));
    expect(onIndexChange).toHaveBeenCalledWith(1, { reason: "next" });
    expect(viewer.getAttribute("data-index")).toBe("0");

    rerender(<ImageViewer open images={images} index={1} onIndexChange={onIndexChange} />);
    expect(screen.getByText("2 / 3")).toBeTruthy();
    expect(screen.getByRole("group", { name: "商品侧面" }).getAttribute("aria-hidden")).toBeNull();
  });

  it("preserves zoom when a controlled owner rejects navigation", async () => {
    const onIndexChange = vi.fn();
    const { rerender } = render(
      <ImageViewer open images={images} index={0} onIndexChange={onIndexChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: "放大图片" }));
    expect(screen.getByRole("dialog").getAttribute("data-scale")).toBe("1.5");
    fireEvent.click(screen.getByRole("button", { name: "下一张图片" }));
    expect(onIndexChange).toHaveBeenCalledWith(1, { reason: "next" });
    expect(screen.getByRole("dialog").getAttribute("data-index")).toBe("0");
    expect(screen.getByRole("dialog").getAttribute("data-scale")).toBe("1.5");

    rerender(<ImageViewer open images={images} index={1} onIndexChange={onIndexChange} />);
    await waitFor(() => expect(screen.getByRole("dialog").getAttribute("data-scale")).toBe("1"));
  });

  it("atomically resets zoom when the active item identity changes A to B to A", () => {
    const first = [{ alt: "A", key: "a", src: "/a.svg" }] as const;
    const second = [{ alt: "B", key: "b", src: "/b.svg" }] as const;
    const { rerender } = render(<ImageViewer open images={first} />);
    const viewer = screen.getByRole("dialog", { name: "图片预览" });
    const carousel = screen.getByRole("group", { name: "图片预览" });

    fireEvent.click(screen.getByRole("button", { name: "放大图片" }));
    expect(viewer.getAttribute("data-scale")).toBe("1.5");

    rerender(<ImageViewer open images={second} />);
    expect(viewer.getAttribute("data-scale")).toBe("1");
    expect(carousel.getAttribute("data-drag-enabled")).toBe("true");
    const activeMedia = document.querySelector(
      '[data-meu-carousel-slide][data-active="true"] [data-meu-image-viewer-media]'
    );
    expect(activeMedia && activeMedia.getAttribute("data-scale")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: "放大图片" }));
    rerender(<ImageViewer open images={first} />);
    expect(viewer.getAttribute("data-scale")).toBe("1");
    expect(carousel.getAttribute("data-drag-enabled")).toBe("true");
  });

  it("resets zoom when a stable item key changes its responsive source", () => {
    const first = [{ alt: "A", key: "stable", src: "/a.svg", srcSet: "/a-2x.svg 2x" }] as const;
    const second = [{ alt: "B", key: "stable", src: "/b.svg", srcSet: "/b-2x.svg 2x" }] as const;
    const { rerender } = render(<ImageViewer open images={first} />);

    fireEvent.click(screen.getByRole("button", { name: "放大图片" }));
    expect(screen.getByRole("dialog").getAttribute("data-scale")).toBe("1.5");
    rerender(<ImageViewer open images={second} />);
    expect(screen.getByRole("dialog").getAttribute("data-scale")).toBe("1");
    rerender(<ImageViewer open images={first} />);
    expect(screen.getByRole("dialog").getAttribute("data-scale")).toBe("1");
  });

  it("supports button and keyboard zoom, reset, and disables gallery drag while zoomed", () => {
    const onScaleChange = vi.fn();
    render(<ImageViewer open images={images} maxZoom={2} onScaleChange={onScaleChange} />);
    const viewer = screen.getByRole("dialog", { name: "图片预览" });
    const carousel = screen.getByRole("group", { name: "图片预览" });

    fireEvent.click(screen.getByRole("button", { name: "放大图片" }));
    expect(viewer.getAttribute("data-scale")).toBe("1.5");
    expect(carousel.getAttribute("data-drag-enabled")).toBe("false");
    expect(onScaleChange).toHaveBeenLastCalledWith(1.5, { index: 0, reason: "zoom-in" });

    fireEvent.keyDown(screen.getByRole("button", { name: "关闭图片预览" }), { key: "+" });
    expect(viewer.getAttribute("data-scale")).toBe("2");
    expect(screen.getByRole("button", { name: "放大图片" })).toHaveProperty("disabled", true);

    fireEvent.keyDown(screen.getByRole("button", { name: "关闭图片预览" }), { key: "0" });
    expect(viewer.getAttribute("data-scale")).toBe("1");
    expect(carousel.getAttribute("data-drag-enabled")).toBe("true");
  });

  it("supports double-tap and pinch zoom without using image clicks for dismissal", () => {
    const onOpenChange = vi.fn();
    const onScaleChange = vi.fn();
    render(
      <ImageViewer
        open
        images={images}
        maxZoom={3}
        onOpenChange={onOpenChange}
        onScaleChange={onScaleChange}
      />
    );
    const stage = document.querySelector('[data-meu-image-viewer-stage="true"]');
    if (!(stage instanceof HTMLElement)) throw new Error("Expected active image stage");

    fireEvent.doubleClick(stage);
    expect(screen.getByRole("dialog").getAttribute("data-scale")).toBe("2");
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("button", { name: "关闭图片预览" }), { key: "0" });

    fireEvent.touchStart(stage, {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 100, clientY: 0 }
      ]
    });
    fireEvent.touchMove(stage, {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 200, clientY: 0 }
      ]
    });
    expect(screen.getByRole("dialog").getAttribute("data-scale")).toBe("2");
    expect(onScaleChange).toHaveBeenLastCalledWith(2, { index: 0, reason: "pinch" });
  });

  it("cleans up mouse pan state when pointer capture is lost", () => {
    render(<ImageViewer open images={images.slice(0, 1)} />);
    fireEvent.click(screen.getByRole("button", { name: "放大图片" }));
    const stage = document.querySelector<HTMLElement>('[data-meu-image-viewer-stage="true"]');
    const media = document.querySelector<HTMLElement>('[data-meu-image-viewer-media="true"]');
    if (!stage || !media) throw new Error("Expected image gesture elements");
    Object.defineProperties(stage, {
      hasPointerCapture: { configurable: true, value: vi.fn(() => true) },
      releasePointerCapture: { configurable: true, value: vi.fn() },
      setPointerCapture: { configurable: true, value: vi.fn() }
    });

    fireEvent.pointerDown(stage, {
      button: 0,
      clientX: 20,
      clientY: 20,
      pointerId: 7,
      pointerType: "mouse"
    });
    expect(media.getAttribute("data-interacting")).toBe("true");
    fireEvent.lostPointerCapture(stage, { pointerId: 7, pointerType: "mouse" });
    expect(media.getAttribute("data-interacting")).toBe("false");
  });

  it("does not start mouse pan when pointer capture cannot be acquired", () => {
    render(<ImageViewer open images={images.slice(0, 1)} />);
    fireEvent.click(screen.getByRole("button", { name: "放大图片" }));
    const stage = document.querySelector<HTMLElement>('[data-meu-image-viewer-stage="true"]');
    const media = document.querySelector<HTMLElement>('[data-meu-image-viewer-media="true"]');
    if (!stage || !media) throw new Error("Expected image gesture elements");
    Object.defineProperty(stage, "setPointerCapture", {
      configurable: true,
      value: vi.fn(() => {
        throw new DOMException("capture unavailable", "InvalidStateError");
      })
    });

    fireEvent.pointerDown(stage, {
      button: 0,
      clientX: 20,
      clientY: 20,
      pointerId: 8,
      pointerType: "mouse"
    });
    expect(media.getAttribute("data-interacting")).toBe("false");
  });

  it("exposes imperative navigation and zoom reset through platform-neutral methods", () => {
    const ref = createRef<ImageViewerRef>();
    const onIndexChange = vi.fn();
    render(<ImageViewer ref={ref} open images={images} onIndexChange={onIndexChange} />);

    const handle = ref.current;
    if (!handle) throw new Error("Expected ImageViewer ref");
    act(() => handle.goTo(2));
    expect(onIndexChange).toHaveBeenCalledWith(2, { reason: "imperative" });
    const updatedHandle = ref.current;
    if (!updatedHandle) throw new Error("Expected updated ImageViewer ref");
    expect(updatedHandle.nativeElement).toBe(screen.getByRole("dialog", { name: "图片预览" }));
    fireEvent.click(screen.getByRole("button", { name: "放大图片" }));
    act(() => updatedHandle.resetZoom());
    expect(screen.getByRole("dialog").getAttribute("data-scale")).toBe("1");
  });

  it("renders localized errors, announces the final failure, and restores drag at 1x", () => {
    const { rerender } = render(<ImageViewer open images={[]} />);
    expect(screen.getByText("暂无可预览图片")).toBeTruthy();
    expect(screen.getByRole("button", { name: "关闭图片预览" })).toBeTruthy();

    rerender(<ImageViewer open images={images.slice(0, 1)} />);
    fireEvent.click(screen.getByRole("button", { name: "放大图片" }));
    const image = screen.getByAltText("商品正面");
    fireEvent.error(image);
    expect(screen.getByText("图片加载失败")).toBeTruthy();
    expect(screen.getByText("商品正面：图片加载失败").getAttribute("role")).toBe("status");
    expect(screen.getByRole("dialog").getAttribute("data-scale")).toBe("1");
    expect(screen.getByRole("group", { name: "图片预览" }).getAttribute("data-drag-enabled")).toBe(
      "true"
    );
  });

  it("associates footer content with its image through figure and figcaption", () => {
    render(<ImageViewer open images={images.slice(0, 1)} renderFooter={() => "商品说明"} />);
    const caption = screen.getByText("商品说明");
    expect(caption.tagName).toBe("FIGCAPTION");
    const figure = caption.closest("figure");
    expect(figure).toBeTruthy();
    expect(figure && figure.contains(screen.getByAltText("商品正面"))).toBe(true);
  });

  it("copies explicit motion, locale, direction, and theme to the portal boundary", () => {
    render(
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <ImageViewer open images={images.slice(0, 1)} />
      </ConfigProvider>
    );
    const layer = document.querySelector<HTMLElement>('[data-meu-overlay-layer="image-viewer"]');
    expect(layer && layer.getAttribute("data-meu-motion")).toBe("reduced");
    expect(layer && layer.getAttribute("data-meu-theme")).toBe("dark");
    expect(layer && layer.getAttribute("dir")).toBe("rtl");
    expect(layer && layer.getAttribute("lang")).toBe("en-US");
  });

  it("supports minimal controls and explicit close-button reasons", () => {
    const onOpenChange = vi.fn();
    render(<ImageViewer open images={images} controls="minimal" onOpenChange={onOpenChange} />);
    expect(screen.queryByRole("group", { name: "缩放控制" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "关闭图片预览" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "close-button" });
  });

  it("maps physical arrow keys to visual navigation in RTL", () => {
    const onIndexChange = vi.fn();
    render(
      <ConfigProvider dir="rtl">
        <ImageViewer open images={images} index={1} onIndexChange={onIndexChange} />
      </ConfigProvider>
    );
    const close = screen.getByRole("button", { name: "关闭图片预览" });
    fireEvent.keyDown(close, { key: "ArrowLeft" });
    expect(onIndexChange).toHaveBeenLastCalledWith(2, { reason: "next" });
    fireEvent.keyDown(close, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenLastCalledWith(0, { reason: "previous" });
  });
});
