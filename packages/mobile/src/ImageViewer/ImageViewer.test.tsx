// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ImageViewer } from "./ImageViewer";
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
    expect(renderToString(<ImageViewer images={images} />)).toBe("");
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

  it("renders localized empty and image error states while keeping a close action", () => {
    const { rerender } = render(<ImageViewer open images={[]} />);
    expect(screen.getByText("暂无可预览图片")).toBeTruthy();
    expect(screen.getByRole("button", { name: "关闭图片预览" })).toBeTruthy();

    rerender(<ImageViewer open images={images.slice(0, 1)} />);
    const image = screen.getByAltText("商品正面");
    fireEvent.error(image);
    expect(screen.getByText("图片加载失败")).toBeTruthy();
  });

  it("supports minimal controls and explicit close-button reasons", () => {
    const onOpenChange = vi.fn();
    render(<ImageViewer open images={images} controls="minimal" onOpenChange={onOpenChange} />);
    expect(screen.queryByRole("group", { name: "缩放控制" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "关闭图片预览" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "close-button" });
  });
});
