// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { IndexList } from "./IndexList";
import type { IndexListChangeDetails, IndexListRef } from "./types";

const sections = [
  { key: "A", title: "A 组", content: <button type="button">安静路线</button> },
  { key: "B", title: "B 组", content: <button type="button">滨江路线</button> },
  { key: "C", title: "C 组", content: <button type="button">城市路线</button> }
] as const;

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    const key = this.getAttribute("data-index-key");
    if (key === "B") return 120;
    if (key === "C") return 240;
    return 0;
  });
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: function (this: HTMLElement, options: ScrollToOptions) {
      this.scrollTop = typeof options.top === "number" ? options.top : 0;
    }
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("IndexList", () => {
  it("renders labelled sections and an accessible index rail", () => {
    render(<IndexList aria-label="路线索引列表" indexAriaLabel="路线首字母" sections={sections} />);

    expect(screen.getByLabelText("路线索引列表").getAttribute("data-meu-component")).toBe(
      "index-list"
    );
    expect(screen.getByRole("navigation", { name: "路线首字母" })).toBeTruthy();
    expect(document.querySelectorAll("[data-index-key]")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "A" }).getAttribute("aria-current")).toBe("location");
    const scrollBody = document.querySelector<HTMLElement>("[data-meu-index-list-body]");
    expect(scrollBody && scrollBody.tabIndex).toBe(0);
  });

  it("localizes the owned content region and default index label", () => {
    render(
      <ConfigProvider locale="en-US">
        <IndexList sections={sections} />
      </ConfigProvider>
    );

    expect(screen.getByRole("region", { name: "Indexed content" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Section index" })).toBeTruthy();
    expect(screen.queryByRole("region", { name: "索引内容" })).toBeNull();
  });

  it("scrolls imperatively and reports index activation", () => {
    const ref = createRef<IndexListRef>();
    const onIndexChange = vi.fn();
    render(<IndexList ref={ref} sections={sections} onIndexChange={onIndexChange} />);

    let scrolled = false;
    act(() => {
      scrolled = ref.current!.scrollTo("C");
    });
    expect(scrolled).toBe(true);
    expect(onIndexChange).toHaveBeenCalledWith("C", { source: "imperative" });
    expect(screen.getByRole("button", { name: "C" }).getAttribute("aria-current")).toBe("location");
    expect(ref.current!.scrollTo("missing")).toBe(false);
  });

  it("moves and activates the roving index with vertical keyboard commands", () => {
    const onIndexChange = vi.fn();
    render(<IndexList sections={sections} onIndexChange={onIndexChange} />);
    const first = screen.getByRole("button", { name: "A" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });

    const second = screen.getByRole("button", { name: "B" });
    expect(document.activeElement).toBe(second);
    expect(second.getAttribute("aria-current")).toBe("location");
    expect(onIndexChange).toHaveBeenLastCalledWith(
      "B",
      expect.objectContaining({ source: "index" })
    );
  });

  it("tracks the active section when the owned viewport scrolls", () => {
    const onIndexChange = vi.fn();
    const { container } = render(
      <IndexList aria-label="路线索引列表" sections={sections} onIndexChange={onIndexChange} />
    );
    const body = container.querySelector<HTMLElement>("[data-meu-index-list-body]")!;
    body.scrollTop = 130;
    fireEvent.scroll(body);

    expect(screen.getByRole("button", { name: "B" }).getAttribute("aria-current")).toBe("location");
    expect(onIndexChange).toHaveBeenLastCalledWith("B", { source: "scroll" });
  });

  it("falls back to the first available section when data removes the active key", () => {
    const { rerender } = render(<IndexList sections={sections} />);
    fireEvent.click(screen.getByRole("button", { name: "C" }));

    rerender(<IndexList sections={sections.slice(0, 2)} />);

    expect(screen.getByRole("button", { name: "A" }).getAttribute("aria-current")).toBe("location");
    expect(screen.getByRole("button", { name: "A" }).tabIndex).toBe(0);

    rerender(<IndexList sections={sections} />);
    expect(screen.getByRole("button", { name: "A" }).getAttribute("aria-current")).toBe("location");
  });

  it("recovers rail focus when a dynamically removed section owned focus", () => {
    const { rerender } = render(<IndexList sections={sections} />);
    const third = screen.getByRole("button", { name: "C" });
    third.focus();
    fireEvent.click(third);

    rerender(<IndexList sections={sections.slice(0, 2)} />);

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "A" }));
  });

  it("keeps the first duplicate identity and stable section ids through reorder", () => {
    const duplicate = { ...sections[0], title: "重复 A" };
    const { rerender } = render(<IndexList sections={[...sections, duplicate]} />);
    expect(screen.getByRole("navigation").querySelectorAll("button")).toHaveLength(3);
    expect(screen.queryByText("重复 A")).toBeNull();
    const aControl = screen.getByRole("button", { name: "A" }).getAttribute("aria-controls");

    rerender(<IndexList sections={[sections[2], sections[0], sections[1]]} />);
    expect(screen.getByRole("button", { name: "A" }).getAttribute("aria-controls")).toBe(aControl);
  });

  it("supports controlled active state and restores a rejected scroll request", () => {
    vi.useFakeTimers();
    const onIndexChange = vi.fn();
    const { rerender } = render(
      <IndexList activeKey="B" sections={sections} onIndexChange={onIndexChange} />
    );
    const body = document.querySelector<HTMLElement>("[data-meu-index-list-body]")!;
    expect(body.scrollTop).toBe(120);

    fireEvent.click(screen.getByRole("button", { name: "C" }));
    expect(screen.getByRole("button", { name: "B" }).getAttribute("aria-current")).toBe("location");
    expect(onIndexChange).toHaveBeenLastCalledWith(
      "C",
      expect.objectContaining({ source: "index" })
    );
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(body.scrollTop).toBe(120);

    rerender(<IndexList activeKey="C" sections={sections} onIndexChange={onIndexChange} />);
    expect(screen.getByRole("button", { name: "C" }).getAttribute("aria-current")).toBe("location");
    expect(body.scrollTop).toBe(240);
  });

  it("normalizes an unavailable controlled key to the first physical section", () => {
    render(<IndexList activeKey={null} sections={sections} />);
    expect(screen.getByRole("button", { name: "A" }).getAttribute("aria-current")).toBe("location");
    expect(screen.getByRole("button", { name: "A" }).tabIndex).toBe(0);
  });

  it("renders an empty region without an empty navigation landmark or tab stop", () => {
    render(<IndexList sections={[]} />);
    expect(screen.getByRole("region").hasAttribute("tabindex")).toBe(false);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(document.querySelector('[data-empty="true"]')).toBeTruthy();
  });

  it("slides across the touch index and uses caller-owned accessible labels", () => {
    const onIndexChange = vi.fn<(key: string, details: IndexListChangeDetails) => void>();
    render(
      <IndexList
        sections={sections.map((section) =>
          section.key === "B" ? { ...section, ariaLabel: "B 分组" } : section
        )}
        onIndexChange={onIndexChange}
      />
    );
    const buttons = [
      screen.getByRole("button", { name: "A" }),
      screen.getByRole("button", { name: "B 分组" }),
      screen.getByRole("button", { name: "C" })
    ];
    buttons.forEach((button, index) => {
      vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
        bottom: (index + 1) * 44,
        height: 44,
        left: 0,
        right: 44,
        top: index * 44,
        width: 44,
        x: 0,
        y: index * 44,
        toJSON: () => ({})
      });
    });
    const rail = screen.getByRole("navigation");
    fireEvent.pointerDown(rail, { button: 0, clientY: 48, isPrimary: true, pointerId: 7 });
    fireEvent.pointerMove(rail, { clientY: 100, isPrimary: true, pointerId: 7 });
    fireEvent.pointerUp(rail, { clientY: 100, isPrimary: true, pointerId: 7 });

    expect(onIndexChange).toHaveBeenNthCalledWith(
      1,
      "B",
      expect.objectContaining({ source: "index" })
    );
    expect(onIndexChange).toHaveBeenNthCalledWith(
      2,
      "C",
      expect.objectContaining({ source: "index" })
    );
    expect(screen.getByRole("button", { name: "C" }).getAttribute("aria-current")).toBe("location");
    expect(screen.getByRole("status").textContent).toBe("已定位到C");
  });

  it("continues a pointer drag on window when capture is unavailable and stops after cancel", () => {
    const onIndexChange = vi.fn<(key: string, details: IndexListChangeDetails) => void>();
    render(<IndexList sections={sections} onIndexChange={onIndexChange} />);
    const rail = screen.getByRole("navigation");
    const buttons = Array.from(rail.querySelectorAll("button"));
    buttons.forEach((button, index) => {
      vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
        bottom: (index + 1) * 44,
        height: 44,
        left: 0,
        right: 44,
        top: index * 44,
        width: 44,
        x: 0,
        y: index * 44,
        toJSON: () => ({})
      });
    });
    Object.defineProperty(rail, "setPointerCapture", {
      configurable: true,
      value: () => {
        throw new Error("capture unavailable");
      }
    });

    fireEvent.pointerDown(rail, { button: 0, clientY: 48, isPrimary: true, pointerId: 9 });
    fireEvent.pointerMove(window, { clientY: 100, pointerId: 9 });
    fireEvent.pointerCancel(window, { pointerId: 9 });
    fireEvent.pointerMove(window, { clientY: 4, pointerId: 9 });

    expect(onIndexChange.mock.calls.map(([key]) => key)).toEqual(["B", "C"]);
  });

  it("provides a Touch Events drag fallback for early iOS 13", () => {
    const onIndexChange = vi.fn<(key: string, details: IndexListChangeDetails) => void>();
    render(<IndexList sections={sections} onIndexChange={onIndexChange} />);
    const rail = screen.getByRole("navigation");
    Array.from(rail.querySelectorAll("button")).forEach((button, index) => {
      vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
        bottom: (index + 1) * 44,
        height: 44,
        left: 0,
        right: 44,
        top: index * 44,
        width: 44,
        x: 0,
        y: index * 44,
        toJSON: () => ({})
      });
    });
    fireEvent.touchStart(rail, {
      changedTouches: [{ clientY: 48, identifier: 3 }],
      touches: [{ clientY: 48, identifier: 3 }]
    });
    fireEvent.touchMove(rail, {
      changedTouches: [{ clientY: 100, identifier: 3 }],
      touches: [{ clientY: 100, identifier: 3 }]
    });
    fireEvent.touchCancel(rail);

    expect(onIndexChange.mock.calls.map(([key]) => key)).toEqual(["B", "C"]);
  });

  it("honors reduced motion and releases smooth-scroll suppression on user input", () => {
    const ref = createRef<IndexListRef>();
    const onIndexChange = vi.fn();
    const scrollTo = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
      this.scrollTop = typeof options.top === "number" ? options.top : 0;
    });
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: scrollTo
    });
    render(
      <ConfigProvider motion="reduced">
        <IndexList ref={ref} sections={sections} onIndexChange={onIndexChange} />
      </ConfigProvider>
    );
    const body = document.querySelector<HTMLElement>("[data-meu-index-list-body]")!;
    act(() => {
      ref.current!.scrollTo("C", { behavior: "smooth" });
    });
    expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "auto", top: 240 });

    fireEvent.wheel(body);
    body.scrollTop = 130;
    fireEvent.scroll(body);
    expect(onIndexChange).toHaveBeenLastCalledWith("B", { source: "scroll" });
  });
});
