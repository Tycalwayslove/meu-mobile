// @vitest-environment jsdom
import { act } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Ellipsis } from "./Ellipsis";

const content = "这是一个足够长的组件说明文本，用于验证省略与展开状态。";
const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");

function mockMeasurements(initialWidth = 120) {
  let width = initialWidth;
  let characterWidth = 10;
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => width
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      if (!(this instanceof HTMLDivElement) || !this.getAttribute("aria-hidden")) return 24;
      const actionCandidate = this.querySelector("span:last-child");
      const action = actionCandidate instanceof HTMLElement ? actionCandidate : null;
      const actionText = action && action.textContent ? action.textContent : "";
      const actionVisible = Boolean(action && action.style.display !== "none");
      const actionLength = actionVisible ? actionText.length + 2 : 0;
      const textCandidate = this.querySelector("span:first-child");
      const text = textCandidate && textCandidate.textContent ? textCandidate.textContent : "";
      const measuredWidth = Number.parseFloat(this.style.width) || width;
      const charactersPerLine = Math.max(1, Math.floor(measuredWidth / characterWidth));
      return (
        Math.ceil((text.length + actionLength) / charactersPerLine) * 24 + (actionVisible ? 2 : 0)
      );
    }
  });
  return {
    setCharacterWidth: (nextWidth: number) => (characterWidth = nextWidth),
    setWidth: (nextWidth: number) => (width = nextWidth)
  };
}

function getRoot() {
  const root = document.querySelector<HTMLElement>('[data-meu-component="ellipsis"]');
  if (!root) throw new Error("Expected Ellipsis root");
  return root;
}

function getVisualText() {
  const visual = getRoot().querySelector<HTMLElement>(":scope > span[aria-hidden='true']");
  if (!visual) throw new Error("Expected visual ellipsis content");
  return visual.textContent || "";
}

afterEach(() => {
  if (originalClientWidth)
    Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
  else Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
  if (originalOffsetHeight)
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", originalOffsetHeight);
  else Reflect.deleteProperty(HTMLElement.prototype, "offsetHeight");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Ellipsis", () => {
  it("measures, expands by keyboard and keeps the complete content accessible", async () => {
    mockMeasurements();
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const onEllipsisChange = vi.fn();
    render(
      <Ellipsis
        content={content}
        rows={1}
        direction="middle"
        onExpandedChange={onExpandedChange}
        onEllipsisChange={onEllipsisChange}
      />
    );

    const expand = await screen.findByRole("button", { name: "展开" });
    expect(getVisualText()).not.toBe("…");
    expect(screen.getByText(content)).toBeTruthy();
    await waitFor(() => expect(onEllipsisChange).toHaveBeenCalledWith(true));
    expand.focus();
    await user.keyboard("{Enter}");
    expect(onExpandedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(screen.getByRole("button", { name: "收起" }).getAttribute("aria-expanded")).toBe("true");
    expect(getRoot().getAttribute("data-state")).toBe("expanded");
  });

  it("keeps one exact accessible text source and leaves native copy events untouched", async () => {
    mockMeasurements();
    const onCopy = vi.fn();
    render(<Ellipsis content={content} rows={1} onCopy={onCopy} />);

    await screen.findByRole("button", { name: "展开" });
    const root = getRoot();
    const accessibleTextSources = root.querySelectorAll(":scope > span:not([aria-hidden])");
    const visual = root.querySelector(":scope > span[aria-hidden='true']");
    expect(accessibleTextSources).toHaveLength(1);
    expect(accessibleTextSources[0] && accessibleTextSources[0].textContent).toBe(content);
    expect(visual && visual.getAttribute("aria-hidden")).toBe("true");

    fireEvent.copy(root);
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it("builds grapheme-safe start, middle, and end candidates", async () => {
    mockMeasurements(90);
    const value = "甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉";
    const { rerender } = render(<Ellipsis content={value} rows={1} direction="end" />);
    await screen.findByRole("button", { name: "展开" });
    expect(getVisualText()).toMatch(/^甲.*…$/);

    rerender(<Ellipsis content={value} rows={1} direction="start" />);
    await waitFor(() => expect(getVisualText()).toMatch(/^….*酉$/));

    rerender(<Ellipsis content={value} rows={1} direction="middle" />);
    await waitFor(() => expect(getVisualText()).toMatch(/^甲.*….*酉$/));
  });

  it("reports complete/ellipsed transitions once", async () => {
    const measurement = mockMeasurements(400);
    let notifyResize: (() => void) | undefined;
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        notifyResize = () => callback([], this);
      }
      disconnect() {}
      observe() {}
      unobserve() {}
    }
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    const onEllipsisChange = vi.fn();
    render(<Ellipsis content="一段会在窄容器中截断的文本" onEllipsisChange={onEllipsisChange} />);

    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("complete"));
    expect(screen.queryByRole("button")).toBeNull();
    await waitFor(() => expect(onEllipsisChange).toHaveBeenCalledOnce());
    expect(onEllipsisChange).toHaveBeenLastCalledWith(false);
    act(() => {
      if (notifyResize) notifyResize();
    });
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(onEllipsisChange).toHaveBeenCalledOnce();

    measurement.setWidth(70);
    act(() => {
      if (notifyResize) notifyResize();
    });
    await waitFor(() => expect(onEllipsisChange).toHaveBeenLastCalledWith(true));
  });

  it("supports controlled expansion without optimistic visual state", async () => {
    mockMeasurements();
    const onExpandedChange = vi.fn();
    render(
      <Ellipsis content={content} rows={1} expanded={false} onExpandedChange={onExpandedChange} />
    );
    fireEvent.click(await screen.findByRole("button", { name: "展开" }));
    expect(onExpandedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(screen.getByRole("button", { name: "展开" })).toBeTruthy();
    expect(getRoot().getAttribute("data-state")).toBe("collapsed");
  });

  it("uses rows as the measured multi-line limit", async () => {
    mockMeasurements(90);
    const value = "甲乙丙丁戊己庚辛壬癸子丑寅卯辰";
    const { rerender } = render(<Ellipsis content={value} rows={1} />);
    await screen.findByRole("button", { name: "展开" });
    rerender(<Ellipsis content={value} rows={2} />);
    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("complete"));
    expect(screen.queryByRole("button")).toBeNull();
    expect(getVisualText()).toBe(value);
  });

  it("supports visual truncation without an expansion action", async () => {
    mockMeasurements(90);
    render(<Ellipsis content={content} rows={1} expandText={null} />);
    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("collapsed"));
    expect(screen.queryByRole("button")).toBeNull();
    expect(getVisualText()).toMatch(/…$/);
    expect(screen.getByText(content)).toBeTruthy();
  });

  it("honors defaultExpanded and hides a falsy collapse action", async () => {
    mockMeasurements();
    render(<Ellipsis content={content} rows={1} defaultExpanded collapseText={null} />);
    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("expanded"));
    expect(getVisualText()).toBe(content);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps the current action focused while changed content awaits measurement", async () => {
    mockMeasurements();
    const { rerender } = render(<Ellipsis content={content} rows={1} />);
    await screen.findByRole("button", { name: "展开" });
    const nextContent = `${content}这是更新后的内容。`;
    const action = screen.getByRole("button", { name: "展开" });
    action.focus();
    rerender(<Ellipsis content={nextContent} rows={1} />);
    expect(document.activeElement).toBe(action);
    expect(screen.getByRole("button", { name: "展开" })).toBe(action);
    expect(screen.getAllByText(nextContent).length).toBeGreaterThan(0);
    expect(screen.queryByText(content, { exact: true })).toBeNull();
    expect(getRoot().getAttribute("data-state")).toBe("pending");
    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("collapsed"));
  });

  it("subtracts root padding from the measurement width", async () => {
    mockMeasurements(120);
    render(<Ellipsis content={content} style={{ paddingLeft: 10, paddingRight: 10 }} />);
    await screen.findByRole("button", { name: "展开" });
    const mirror = getRoot().querySelector<HTMLElement>(":scope > div[aria-hidden='true']");
    if (!mirror) throw new Error("Expected measurement mirror");
    expect(mirror.style.width).toBe("100px");
  });

  it("remeasures through ResizeObserver and cleans it up", async () => {
    const measurement = mockMeasurements(400);
    let notifyResize: (() => void) | undefined;
    const disconnect = vi.fn();
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        notifyResize = () => callback([], this);
      }
      disconnect = disconnect;
      observe() {}
      unobserve() {}
    }
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    const { unmount } = render(<Ellipsis content={content} />);
    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("complete"));
    measurement.setWidth(70);
    act(() => {
      if (notifyResize) notifyResize();
    });
    await screen.findByRole("button", { name: "展开" });
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("falls back to viewport and orientation events without ResizeObserver", async () => {
    const measurement = mockMeasurements(400);
    vi.stubGlobal("ResizeObserver", undefined);
    render(<Ellipsis content={content} />);
    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("complete"));
    measurement.setWidth(70);
    fireEvent(window, new Event("resize"));
    await screen.findByRole("button", { name: "展开" });
    measurement.setWidth(400);
    fireEvent(window, new Event("orientationchange"));
    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("complete"));
  });

  it("keeps zero-width content pending and falls back when animation frames are unavailable", async () => {
    const measurement = mockMeasurements(0);
    vi.stubGlobal("ResizeObserver", undefined);
    vi.stubGlobal("requestAnimationFrame", undefined);
    vi.stubGlobal("cancelAnimationFrame", undefined);
    render(<Ellipsis content={content} />);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(getRoot().getAttribute("data-state")).toBe("pending");

    measurement.setWidth(70);
    fireEvent(window, new Event("resize"));
    await screen.findByRole("button", { name: "展开" });
  });

  it("remeasures for font readiness and later font loads", async () => {
    const measurement = mockMeasurements(400);
    let resolveFonts: (() => void) | undefined;
    let loadingDone: (() => void) | undefined;
    const ready = new Promise<void>((resolve) => (resolveFonts = resolve));
    const removeEventListener = vi.fn();
    const fontsDescriptor = Object.getOwnPropertyDescriptor(document, "fonts");
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        addEventListener: (_name: string, callback: () => void) => (loadingDone = callback),
        ready,
        removeEventListener
      }
    });
    try {
      const { unmount } = render(<Ellipsis content={content} />);
      await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("complete"));
      measurement.setWidth(70);
      await act(async () => {
        if (resolveFonts) resolveFonts();
        await ready;
      });
      await screen.findByRole("button", { name: "展开" });
      measurement.setWidth(400);
      act(() => {
        if (loadingDone) loadingDone();
      });
      await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("complete"));
      unmount();
      expect(removeEventListener).toHaveBeenCalledWith("loadingdone", expect.any(Function));
    } finally {
      if (fontsDescriptor) Object.defineProperty(document, "fonts", fontsDescriptor);
      else Reflect.deleteProperty(document, "fonts");
    }
  });

  it("provides refs, native root props and custom accessible action names", async () => {
    mockMeasurements();
    const rootRef = vi.fn();
    const actionRef = vi.fn();
    const { unmount } = render(
      <Ellipsis
        ref={rootRef}
        actionRef={actionRef}
        id="summary"
        dir="rtl"
        content={content}
        expandText={<span aria-hidden="true">＋</span>}
        expandAriaLabel="显示完整说明"
        collapseAriaLabel="隐藏完整说明"
      />
    );
    const expand = await screen.findByRole("button", { name: "显示完整说明" });
    expect(rootRef).toHaveBeenCalledWith(getRoot());
    expect(actionRef).toHaveBeenCalledWith(expand);
    expect(rootRef).toHaveBeenCalledTimes(1);
    expect(actionRef).toHaveBeenCalledTimes(1);
    expect(getRoot().id).toBe("summary");
    expect(getRoot().dir).toBe("rtl");
    fireEvent.click(expand);
    expect(screen.getByRole("button", { name: "隐藏完整说明" })).toBeTruthy();
    expect(rootRef).toHaveBeenCalledTimes(1);
    expect(actionRef).toHaveBeenCalledTimes(1);
    unmount();
    expect(rootRef).toHaveBeenLastCalledWith(null);
    expect(actionRef).toHaveBeenLastCalledWith(null);
  });

  it("runs React 19 callback-ref cleanups instead of synthesizing legacy null calls", async () => {
    mockMeasurements();
    const rootCleanup = vi.fn();
    const actionCleanup = vi.fn();
    const rootRef = vi.fn(() => rootCleanup);
    const actionRef = vi.fn(() => actionCleanup);
    const { unmount } = render(
      <Ellipsis ref={rootRef} actionRef={actionRef} content={content} rows={1} />
    );
    await screen.findByRole("button", { name: "展开" });
    expect(rootRef).toHaveBeenCalledTimes(1);
    expect(actionRef).toHaveBeenCalledTimes(1);

    unmount();
    expect(rootCleanup).toHaveBeenCalledOnce();
    expect(actionCleanup).toHaveBeenCalledOnce();
    expect(rootRef).toHaveBeenCalledTimes(1);
    expect(actionRef).toHaveBeenCalledTimes(1);
  });

  it("remeasures when a caller signals typography changes without a box resize", async () => {
    const measurement = mockMeasurements(120);
    const { rerender } = render(<Ellipsis content={content} rows={1} remeasureKey={0} />);
    await screen.findByRole("button", { name: "展开" });

    measurement.setCharacterWidth(2);
    rerender(<Ellipsis content={content} rows={1} remeasureKey={1} />);
    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("complete"));
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("remeasures for changed inline typography without restarting for equal style values", async () => {
    const measurement = mockMeasurements(120);
    const observe = vi.fn();
    const disconnect = vi.fn();
    class MockResizeObserver {
      disconnect = disconnect;
      observe = observe;
      unobserve() {}
    }
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    const { rerender } = render(<Ellipsis content={content} rows={1} style={{ fontSize: 16 }} />);
    await screen.findByRole("button", { name: "展开" });
    expect(observe).toHaveBeenCalledTimes(1);

    measurement.setCharacterWidth(2);
    rerender(<Ellipsis content={content} rows={1} style={{ fontSize: 14 }} />);
    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("complete"));
    expect(observe).toHaveBeenCalledTimes(2);

    rerender(<Ellipsis content={content} rows={1} style={{ fontSize: 14 }} />);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(observe).toHaveBeenCalledTimes(2);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("remeasures when its own className changes without a box resize", async () => {
    const measurement = mockMeasurements(120);
    const { rerender } = render(<Ellipsis content={content} rows={1} className="wide-type" />);
    await screen.findByRole("button", { name: "展开" });

    measurement.setCharacterWidth(2);
    rerender(<Ellipsis content={content} rows={1} className="compact-type" />);
    await waitFor(() => expect(getRoot().getAttribute("data-state")).toBe("complete"));
    expect(screen.queryByRole("button")).toBeNull();
  });

  it.each([
    [Number.POSITIVE_INFINITY, "1"],
    [Number.NaN, "1"],
    [0, "1"],
    [-3, "1"],
    [2.9, "2"]
  ])("normalizes rows=%s to %s", (rows, expected) => {
    render(<Ellipsis content="短文本" rows={rows} />);
    expect(getRoot().style.getPropertyValue("--meu-ellipsis-rows")).toBe(expected);
  });

  it("never splits emoji ZWJ, flags, or combining grapheme clusters", async () => {
    mockMeasurements(90);
    const family = "👨‍👩‍👧‍👦";
    const flag = "🇨🇳";
    const accented = "e\u0301";
    const value = `甲${family}乙${flag}丙${accented}丁${family}戊${flag}己${accented}庚`;
    render(<Ellipsis content={value} rows={1} direction="middle" />);
    await screen.findByRole("button", { name: "展开" });
    const Segmenter = (
      Intl as typeof Intl & {
        Segmenter?: new (
          locale?: string,
          options?: { granularity: "grapheme" }
        ) => { segment: (text: string) => Iterable<{ segment: string }> };
      }
    ).Segmenter;
    const originalSegments = new Set(
      Segmenter
        ? Array.from(
            new Segmenter(undefined, { granularity: "grapheme" }).segment(value),
            (x) => x.segment
          )
        : [family, flag, accented]
    );
    const displayedSegments = Segmenter
      ? Array.from(
          new Segmenter(undefined, { granularity: "grapheme" }).segment(getVisualText()),
          (x) => x.segment
        )
      : [getVisualText()];
    displayedSegments
      .filter((entry) => entry !== "…")
      .forEach((entry) => expect(originalSegments.has(entry)).toBe(true));
  });

  it("uses the grapheme fallback when Intl.Segmenter is unavailable", async () => {
    mockMeasurements(90);
    const segmenterDescriptor = Object.getOwnPropertyDescriptor(Intl, "Segmenter");
    Object.defineProperty(Intl, "Segmenter", { configurable: true, value: undefined });
    try {
      render(<Ellipsis content="甲👨‍👩‍👧‍👦乙🇨🇳丙é丁戊己庚辛壬癸" direction="end" />);
      await screen.findByRole("button", { name: "展开" });
      const visualText = getVisualText();
      expect(visualText.endsWith("\u200d…")).toBe(false);
      expect(visualText.endsWith("\u0301…")).toBe(false);
      expect(visualText).toContain("…");
    } finally {
      if (segmenterDescriptor) Object.defineProperty(Intl, "Segmenter", segmenterDescriptor);
      else Reflect.deleteProperty(Intl, "Segmenter");
    }
  });
});
