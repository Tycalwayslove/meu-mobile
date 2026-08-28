// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IndexList } from "./IndexList";
import type { IndexListRef } from "./types";

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

  it("scrolls imperatively and reports index activation", () => {
    const ref = createRef<IndexListRef>();
    const onIndexChange = vi.fn();
    render(<IndexList ref={ref} sections={sections} onIndexChange={onIndexChange} />);

    let scrolled = false;
    act(() => {
      scrolled = ref.current!.scrollTo("C");
    });
    expect(scrolled).toBe(true);
    expect(onIndexChange).toHaveBeenCalledWith("C", { source: "index" });
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
  });

  it("slides across the touch index and uses caller-owned accessible labels", () => {
    const onIndexChange = vi.fn();
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
  });
});
