// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Carousel } from "./Carousel";

const embla = vi.hoisted(() => {
  type Listener = () => void;
  const listeners = new Map<string, Set<Listener>>();
  let initialized = false;
  let options: { direction?: "ltr" | "rtl"; loop?: boolean; startIndex?: number } = {};
  let selected = 0;
  let slideCount = 0;

  const emit = (event: string) => {
    const eventListeners = listeners.get(event);
    if (eventListeners) eventListeners.forEach((listener) => listener());
  };
  const select = (nextIndex: number) => {
    if (slideCount <= 0) selected = 0;
    else if (options.loop) selected = (nextIndex + slideCount) % slideCount;
    else selected = Math.min(Math.max(nextIndex, 0), slideCount - 1);
    emit("select");
  };
  const api = {
    off: vi.fn((event: string, listener: Listener) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) eventListeners.delete(listener);
      return api;
    }),
    on: vi.fn((event: string, listener: Listener) => {
      const eventListeners = listeners.get(event) || new Set<Listener>();
      eventListeners.add(listener);
      listeners.set(event, eventListeners);
      return api;
    }),
    scrollNext: vi.fn((jump?: boolean) => {
      void jump;
      select(selected + 1);
    }),
    scrollPrev: vi.fn((jump?: boolean) => {
      void jump;
      select(selected - 1);
    }),
    scrollTo: vi.fn((nextIndex: number, jump?: boolean) => {
      void jump;
      select(nextIndex);
    }),
    selectedScrollSnap: vi.fn(() => selected)
  };

  return {
    api,
    emit,
    getOptions() {
      return options;
    },
    initialize(nextOptions: typeof options) {
      options = nextOptions;
      if (initialized) return;
      initialized = true;
      selected = nextOptions.startIndex || 0;
    },
    reset() {
      initialized = false;
      listeners.clear();
      options = {};
      selected = 0;
      slideCount = 0;
      Object.values(api).forEach((method) => method.mockClear());
    },
    setSlideCount(count: number) {
      slideCount = count;
    }
  };
});

vi.mock("embla-carousel-react", () => ({
  default: (options: { loop?: boolean; startIndex?: number }) => {
    embla.initialize(options);
    return [vi.fn(), embla.api] as const;
  }
}));

const items = [
  { key: "one", ariaLabel: "春季新品", content: <button type="button">查看春季新品</button> },
  { key: "two", ariaLabel: "会员礼遇", content: <a href="#member">查看会员礼遇</a> },
  { key: "three", ariaLabel: "周末活动", content: <button type="button">查看周末活动</button> }
] as const;

function stubMotionPreference(matches: boolean) {
  const query = {
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn()
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => query)
  );
  return query;
}

beforeEach(() => {
  embla.reset();
  embla.setSlideCount(items.length);
  stubMotionPreference(false);
  Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Carousel", () => {
  it("runs React 19 callback-ref cleanup without synthesizing a legacy null call", () => {
    const cleanupRef = vi.fn();
    const callbackRef = vi.fn(() => cleanupRef);
    const { rerender, unmount } = render(<Carousel ref={callbackRef} items={items} />);

    expect(callbackRef).toHaveBeenCalledOnce();
    rerender(<Carousel ref={callbackRef} items={items} gap={12} />);
    expect(callbackRef).toHaveBeenCalledOnce();
    expect(cleanupRef).not.toHaveBeenCalled();

    unmount();
    expect(cleanupRef).toHaveBeenCalledOnce();
    expect(callbackRef).not.toHaveBeenCalledWith(null);
  });

  it("clears a legacy callback ref with null on unmount", () => {
    const callbackRef = vi.fn();
    const { unmount } = render(<Carousel ref={callbackRef} items={items} />);

    expect(callbackRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    unmount();
    expect(callbackRef).toHaveBeenLastCalledWith(null);
  });

  it("renders localized carousel semantics and removes inactive descendants from tab order", async () => {
    const { container } = render(<Carousel aria-label="营销内容" items={items} />);
    const carousel = screen.getByRole("group", { name: "营销内容" });
    expect(carousel.getAttribute("aria-roledescription")).toBe("轮播");
    expect(carousel.querySelectorAll("[data-meu-carousel-slide]")).toHaveLength(3);
    expect(screen.getByRole("group", { name: "春季新品" }).getAttribute("aria-hidden")).toBeNull();
    expect(screen.getByRole("img", { name: "第 1 页，共 3 页" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "上一张" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "下一张" }).hasAttribute("disabled")).toBe(false);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "查看会员礼遇", hidden: true }).tabIndex).toBe(-1);
    });
    expect(screen.getByRole("button", { name: "查看春季新品" }).hasAttribute("tabindex")).toBe(
      false
    );
    const track = container.querySelector("[data-meu-carousel-track]");
    expect(track && track.getAttribute("aria-live")).toBe("off");
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("春季新品，第 1 张，共 3 张");
    expect(status.getAttribute("aria-live")).toBe("polite");
  });

  it("changes an uncontrolled index through native previous and next buttons", async () => {
    const onIndexChange = vi.fn();
    render(<Carousel items={items} onIndexChange={onIndexChange} />);

    fireEvent.click(screen.getByRole("button", { name: "下一张" }));
    await waitFor(() => {
      expect(screen.getByRole("group", { name: "推荐内容" }).getAttribute("data-index")).toBe("1");
    });
    expect(onIndexChange).toHaveBeenLastCalledWith(1, { reason: "next" });
    expect(screen.getByRole("button", { name: "查看春季新品", hidden: true }).tabIndex).toBe(-1);
    expect(screen.getByRole("link", { name: "查看会员礼遇" }).hasAttribute("tabindex")).toBe(false);
    expect(screen.getByRole("status").textContent).toBe("会员礼遇，第 2 张，共 3 张");

    fireEvent.click(screen.getByRole("button", { name: "上一张" }));
    await waitFor(() => expect(onIndexChange).toHaveBeenLastCalledWith(0, { reason: "previous" }));
  });

  it("keeps dynamically changed controls inert in an inactive slide", async () => {
    function DynamicControl({ enabled }: { enabled: boolean }) {
      return (
        <button type="button" disabled={!enabled} tabIndex={enabled ? 0 : -1}>
          动态操作
        </button>
      );
    }
    const dynamicItems = (enabled: boolean) =>
      [
        items[0],
        { key: "dynamic", ariaLabel: "动态页", content: <DynamicControl enabled={enabled} /> },
        items[2]
      ] as const;
    const { rerender } = render(<Carousel items={dynamicItems(false)} />);

    const inactiveSlide = document.querySelector<HTMLElement>(
      '[data-meu-carousel-slide][aria-label="动态页"]'
    );
    if (!inactiveSlide) throw new Error("Expected inactive dynamic slide");
    const dynamicControl = screen.getByRole("button", { name: "动态操作", hidden: true });
    expect(inactiveSlide.hasAttribute("inert")).toBe(true);
    expect(dynamicControl.tabIndex).toBe(-1);

    rerender(<Carousel items={dynamicItems(true)} />);
    await waitFor(() => expect(dynamicControl).toHaveProperty("disabled", false));
    await waitFor(() => expect(dynamicControl.tabIndex).toBe(-1));

    fireEvent.click(screen.getByRole("button", { name: "下一张" }));
    await waitFor(() => expect(inactiveSlide.hasAttribute("inert")).toBe(false));
    expect(dynamicControl.tabIndex).toBe(0);
  });

  it("requests controlled changes and restores the authoritative index when it is unchanged", () => {
    const onIndexChange = vi.fn();
    render(<Carousel index={0} items={items} onIndexChange={onIndexChange} />);

    fireEvent.click(screen.getByRole("button", { name: "下一张" }));
    expect(onIndexChange).toHaveBeenCalledWith(1, { reason: "next" });
    expect(embla.api.scrollTo).toHaveBeenCalledWith(0, true);
    expect(screen.getByRole("group", { name: "推荐内容" }).getAttribute("data-index")).toBe("0");
  });

  it("keeps native control buttons as the keyboard alternative to dragging", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Carousel items={items} onIndexChange={onIndexChange} />);

    const next = screen.getByRole("button", { name: "下一张" });
    next.focus();
    await user.keyboard("{Enter}");
    expect(onIndexChange).toHaveBeenLastCalledWith(1, { reason: "next" });

    const previous = screen.getByRole("button", { name: "上一张" });
    previous.focus();
    await user.keyboard(" ");
    expect(onIndexChange).toHaveBeenLastCalledWith(0, { reason: "previous" });
  });

  it("keeps loop controls available when dragging is disabled and normalizes gap", () => {
    const onIndexChange = vi.fn();
    render(
      <Carousel
        allowDrag={false}
        defaultIndex={2}
        gap={-12}
        items={items}
        loop
        onIndexChange={onIndexChange}
      />
    );

    const carousel = screen.getByRole("group", { name: "推荐内容" });
    expect(carousel.getAttribute("data-drag-enabled")).toBe("false");
    expect(carousel.getAttribute("data-loop")).toBe("true");
    expect(carousel.style.getPropertyValue("--meu-carousel-gap")).toBe("0px");
    expect(screen.getByRole("button", { name: "上一张" }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "下一张" }).hasAttribute("disabled")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "下一张" }));
    expect(onIndexChange).toHaveBeenCalledWith(0, { reason: "next" });
  });

  it("autoplays, permanently pauses on focus and can be explicitly restarted", () => {
    vi.useFakeTimers();
    const onIndexChange = vi.fn();
    render(
      <Carousel autoplay autoplayInterval={1000} items={items} loop onIndexChange={onIndexChange} />
    );
    const carousel = screen.getByRole("group", { name: "推荐内容" });
    expect(carousel.getAttribute("data-rotating")).toBe("true");
    const track = carousel.querySelector("[data-meu-carousel-track]");
    expect(track && track.getAttribute("aria-live")).toBe("off");

    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onIndexChange).toHaveBeenLastCalledWith(1, { reason: "autoplay" });

    fireEvent.focus(screen.getByRole("link", { name: "查看会员礼遇" }));
    expect(screen.getByRole("button", { name: "播放轮播" })).toBeTruthy();
    void act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onIndexChange).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "播放轮播" }));
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onIndexChange).toHaveBeenLastCalledWith(2, { reason: "autoplay" });
  });

  it("does not restart rotation when the running pause button receives focus before click", () => {
    vi.useFakeTimers();
    const onIndexChange = vi.fn();
    render(
      <Carousel autoplay autoplayInterval={1000} items={items} loop onIndexChange={onIndexChange} />
    );

    const pause = screen.getByRole("button", { name: "暂停轮播" });
    fireEvent.focus(pause);
    expect(screen.getByRole("button", { name: "暂停轮播" })).toBe(pause);
    fireEvent.click(pause);
    expect(screen.getByRole("button", { name: "播放轮播" })).toBe(pause);
    void act(() => vi.advanceTimersByTime(2000));
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it("temporarily suspends autoplay while hovered and restarts with a full interval", () => {
    vi.useFakeTimers();
    const onIndexChange = vi.fn();
    render(
      <Carousel autoplay autoplayInterval={1000} items={items} loop onIndexChange={onIndexChange} />
    );
    const carousel = screen.getByRole("group", { name: "推荐内容" });

    fireEvent.mouseEnter(carousel);
    void act(() => vi.advanceTimersByTime(2000));
    expect(onIndexChange).not.toHaveBeenCalled();
    fireEvent.mouseLeave(carousel);
    void act(() => vi.advanceTimersByTime(999));
    expect(onIndexChange).not.toHaveBeenCalled();
    void act(() => vi.advanceTimersByTime(1));
    expect(onIndexChange).toHaveBeenCalledWith(1, { reason: "autoplay" });
  });

  it("respects reduced motion until the user explicitly starts rotation", () => {
    vi.useFakeTimers();
    stubMotionPreference(true);
    const onIndexChange = vi.fn();
    render(
      <Carousel autoplay autoplayInterval={1000} items={items} loop onIndexChange={onIndexChange} />
    );

    expect(screen.getByRole("button", { name: "播放轮播" })).toBeTruthy();
    void act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onIndexChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "播放轮播" }));
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(embla.api.scrollNext).toHaveBeenLastCalledWith(true);
    expect(onIndexChange).toHaveBeenCalledWith(1, { reason: "autoplay" });
  });

  it("honors an explicit reduced-motion provider even when the OS preference is off", () => {
    vi.useFakeTimers();
    stubMotionPreference(false);
    const onIndexChange = vi.fn();
    render(
      <ConfigProvider motion="reduced">
        <Carousel
          autoplay
          autoplayInterval={1000}
          items={items}
          loop
          onIndexChange={onIndexChange}
        />
      </ConfigProvider>
    );

    expect(screen.getByRole("button", { name: "播放轮播" })).toBeTruthy();
    void act(() => vi.advanceTimersByTime(2000));
    expect(onIndexChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "播放轮播" }));
    void act(() => vi.advanceTimersByTime(1000));
    expect(embla.api.scrollNext).toHaveBeenLastCalledWith(true);
    expect(onIndexChange).toHaveBeenCalledWith(1, { reason: "autoplay" });
  });

  it("reports drag selection and keeps rotation paused after pointer interaction", () => {
    vi.useFakeTimers();
    const onIndexChange = vi.fn();
    render(
      <Carousel autoplay autoplayInterval={1000} items={items} loop onIndexChange={onIndexChange} />
    );

    void act(() => {
      embla.emit("pointerDown");
      embla.api.scrollNext(false);
    });
    expect(onIndexChange).toHaveBeenCalledWith(1, { reason: "drag" });
    expect(screen.getByRole("button", { name: "播放轮播" })).toBeTruthy();
    void act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onIndexChange).toHaveBeenCalledTimes(1);
    void act(() => embla.emit("pointerUp"));
  });

  it("does not classify Embla reinitialization as a user drag", () => {
    const onIndexChange = vi.fn();
    render(<Carousel items={items} onIndexChange={onIndexChange} />);

    act(() => {
      embla.api.scrollTo(1, true);
      embla.emit("reInit");
    });
    expect(onIndexChange).toHaveBeenCalledTimes(1);
  });

  it("converges an uncontrolled index across empty, shrinking, and growing item sets", () => {
    embla.setSlideCount(0);
    const { rerender } = render(<Carousel defaultIndex={2} items={[]} />);
    expect(screen.getByRole("group", { name: "推荐内容" }).getAttribute("data-index")).toBe("0");

    embla.setSlideCount(3);
    rerender(<Carousel defaultIndex={2} items={items} />);
    expect(screen.getByRole("group", { name: "推荐内容" }).getAttribute("data-index")).toBe("2");

    embla.setSlideCount(1);
    rerender(<Carousel defaultIndex={2} items={items.slice(0, 1)} />);
    expect(screen.getByRole("group", { name: "推荐内容" }).getAttribute("data-index")).toBe("0");

    embla.setSlideCount(3);
    rerender(<Carousel defaultIndex={2} items={items} />);
    expect(screen.getByRole("group", { name: "推荐内容" }).getAttribute("data-index")).toBe("0");
  });

  it("normalizes a controlled index after slides shrink without emitting a change event", () => {
    const onIndexChange = vi.fn();
    const { rerender } = render(<Carousel index={2} items={items} onIndexChange={onIndexChange} />);
    expect(screen.getByRole("group", { name: "推荐内容" }).getAttribute("data-index")).toBe("2");

    embla.setSlideCount(2);
    rerender(<Carousel index={2} items={items.slice(0, 2)} onIndexChange={onIndexChange} />);

    expect(screen.getByRole("group", { name: "推荐内容" }).getAttribute("data-index")).toBe("1");
    expect(screen.getByRole("group", { name: "会员礼遇" }).hasAttribute("aria-hidden")).toBe(false);
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it("pauses in a hidden page and resumes only after the page becomes visible", () => {
    vi.useFakeTimers();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    const onIndexChange = vi.fn();
    render(
      <Carousel autoplay autoplayInterval={1000} items={items} loop onIndexChange={onIndexChange} />
    );
    expect(screen.getByRole("group", { name: "推荐内容" }).getAttribute("data-rotating")).toBe(
      "false"
    );
    void act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onIndexChange).not.toHaveBeenCalled();

    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    fireEvent(document, new Event("visibilitychange"));
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onIndexChange).toHaveBeenCalledWith(1, { reason: "autoplay" });
  });

  it("supports disabled, empty, custom indicator and English labels", () => {
    const { rerender } = render(<Carousel disabled items={items} indicator={() => <b>1 / 3</b>} />);
    expect(screen.getByText("1 / 3")).toBeTruthy();
    expect(screen.getByRole("button", { name: "下一张" }).hasAttribute("disabled")).toBe(true);

    embla.setSlideCount(0);
    rerender(
      <ConfigProvider locale="en-US">
        <Carousel items={[]} indicator={false} />
      </ConfigProvider>
    );
    expect(screen.getByRole("group", { name: "Featured content" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Previous slide" }).hasAttribute("disabled")).toBe(
      true
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("passes RTL direction to Embla while preserving localized native controls", () => {
    const onIndexChange = vi.fn();
    render(
      <ConfigProvider dir="rtl">
        <Carousel items={items} onIndexChange={onIndexChange} />
      </ConfigProvider>
    );

    expect(embla.getOptions().direction).toBe("rtl");
    fireEvent.click(screen.getByRole("button", { name: "下一张" }));
    expect(onIndexChange).toHaveBeenCalledWith(1, { reason: "next" });
  });

  it("removes media, visibility, Embla, observer, timer, and rollback work on unmount", () => {
    vi.useFakeTimers();
    const query = stubMotionPreference(false);
    const removeDocumentListener = vi.spyOn(document, "removeEventListener");
    const observe = vi.spyOn(MutationObserver.prototype, "observe");
    const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect");
    let frameCallback: FrameRequestCallback | undefined;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frameCallback = callback;
      return 42;
    });
    const cancelFrame = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancelFrame);
    const { unmount } = render(<Carousel autoplay index={0} items={items} loop />);
    act(() => embla.api.scrollNext(false));
    expect(frameCallback).toBeTypeOf("function");
    expect(observe).toHaveBeenCalled();

    unmount();
    expect(query.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(removeDocumentListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(embla.api.off).toHaveBeenCalledWith("select", expect.any(Function));
    expect(embla.api.off).toHaveBeenCalledWith("pointerDown", expect.any(Function));
    expect(embla.api.off).toHaveBeenCalledWith("pointerUp", expect.any(Function));
    expect(disconnect).toHaveBeenCalled();
    expect(cancelFrame).toHaveBeenCalledWith(42);
    expect(vi.getTimerCount()).toBe(0);
  });
});
