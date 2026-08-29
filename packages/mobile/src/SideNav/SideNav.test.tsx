// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { SideNav } from "./SideNav";
import type { SideNavProps } from "./types";

type SideNavChangeEvent = Parameters<NonNullable<SideNavProps["onChange"]>>[1];

const items = [
  { key: "all", label: "全部", content: "全部商品" },
  { key: "food", label: "食品", content: "食品商品", badge: 3 },
  { key: "disabled", label: "停用", content: "停用商品", disabled: true },
  { key: "home", label: "家居", content: "家居商品" }
] as const;

describe("SideNav", () => {
  it("links a vertical tablist to mounted content panels", () => {
    render(<SideNav aria-label="商品分类" items={items} />);

    const all = screen.getByRole("tab", { name: "全部" });
    expect(all.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel", { name: "全部" }).textContent).toBe("全部商品");
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(4);
    expect(screen.getByRole("tab", { name: "停用" }).hasAttribute("disabled")).toBe(true);
  });

  it("skips disabled items with vertical keyboard navigation", () => {
    const onChange = vi.fn();
    render(<SideNav items={items} onChange={onChange} />);
    const all = screen.getByRole("tab", { name: "全部" });
    act(() => all.focus());
    fireEvent.keyDown(all, { key: "ArrowDown" });
    const food = screen.getByRole("tab", { name: /食品/ });
    expect(document.activeElement).toBe(food);
    fireEvent.keyDown(food, { key: "ArrowDown" });

    const home = screen.getByRole("tab", { name: "家居" });
    expect(document.activeElement).toBe(home);
    expect(home.getAttribute("aria-selected")).toBe("true");
    expect(onChange).toHaveBeenLastCalledWith("home", expect.anything());
  });

  it("supports manual activation", () => {
    const onChange = vi.fn();
    render(<SideNav items={items} activationMode="manual" onChange={onChange} />);
    const all = screen.getByRole("tab", { name: "全部" });
    act(() => all.focus());
    fireEvent.keyDown(all, { key: "End" });
    const home = screen.getByRole("tab", { name: "家居" });
    expect(home.getAttribute("aria-selected")).toBe("false");
    fireEvent.keyDown(home, { key: "Enter" });
    expect(home.getAttribute("aria-selected")).toBe("true");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("moves the roving tab stop on pointer activation even when Safari does not focus it", () => {
    render(<SideNav items={items} />);
    const all = screen.getByRole("tab", { name: "全部" });
    const food = screen.getByRole("tab", { name: /食品/ });
    act(() => all.focus());
    fireEvent.click(food);
    expect(document.activeElement).toBe(food);
    expect(food.getAttribute("aria-selected")).toBe("true");
    expect(food.getAttribute("tabindex")).toBe("0");
    expect(all.getAttribute("tabindex")).toBe("-1");
  });

  it("supports controlled null and optional panel destruction", () => {
    const { rerender } = render(<SideNav items={items} value={null} destroyInactive />);
    expect(screen.queryByRole("tabpanel")).toBeNull();
    rerender(<SideNav items={items} value="food" destroyInactive />);
    expect(screen.getByRole("tabpanel", { name: /食品/ }).textContent).toBe("食品商品");
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(1);
  });

  it("keeps a roving target without selecting invalid or disabled controlled keys", () => {
    const { rerender } = render(<SideNav items={items} value="missing" />);
    expect(screen.getByRole("tab", { name: "全部" }).getAttribute("tabindex")).toBe("0");
    expect(document.querySelector('[role="tab"][aria-selected="true"]')).toBeNull();
    expect(screen.queryByRole("tabpanel")).toBeNull();

    rerender(<SideNav items={items} value="disabled" />);
    expect(screen.getByRole("tab", { name: "停用" }).getAttribute("aria-selected")).toBe("false");
    expect(screen.getByRole("tab", { name: "全部" }).getAttribute("tabindex")).toBe("0");
  });

  it("forgets removed and disabled uncontrolled identities", () => {
    const { rerender } = render(<SideNav items={items} defaultValue="food" />);
    rerender(<SideNav items={[items[0], items[3]]} defaultValue="food" />);
    expect(screen.getByRole("tab", { name: "全部" }).getAttribute("aria-selected")).toBe("true");
    rerender(<SideNav items={items} defaultValue="food" />);
    expect(screen.getByRole("tab", { name: /食品/ }).getAttribute("aria-selected")).toBe("false");

    const disabledAll = items.map((candidate) =>
      candidate.key === "all" ? { ...candidate, disabled: true } : candidate
    );
    rerender(<SideNav items={disabledAll} defaultValue="food" />);
    expect(screen.getByRole("tab", { name: /食品/ }).getAttribute("aria-selected")).toBe("true");
  });

  it("recovers DOM focus when the focused item is removed or disabled", () => {
    const { rerender } = render(<SideNav items={items} defaultValue="food" />);
    act(() => screen.getByRole("tab", { name: /食品/ }).focus());
    rerender(<SideNav items={[items[0], items[3]]} defaultValue="food" />);
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "全部" }));

    rerender(<SideNav items={items} defaultValue="food" />);
    const food = screen.getByRole("tab", { name: /食品/ });
    fireEvent.click(food);
    act(() => food.focus());
    const disabledFood = items.map((candidate) =>
      candidate.key === "food" ? { ...candidate, disabled: true } : candidate
    );
    rerender(<SideNav items={disabledFood} defaultValue="food" />);
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "全部" }));
  });

  it("scrolls a newly controlled active item into view", () => {
    const { rerender } = render(<SideNav items={items} value="all" />);
    const food = screen.getByRole("tab", { name: /食品/ });
    const scrollIntoView = vi.fn();
    food.scrollIntoView = scrollIntoView;
    rerender(<SideNav items={items} value="food" />);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest", inline: "nearest" });
  });

  it("rebinds active-item observation when a navigation action becomes a link", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    class ResizeObserverMock {
      observe = observe;
      disconnect = disconnect;
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);

    const { rerender, unmount } = render(
      <SideNav aria-label="分类入口" items={[{ key: "all", label: "全部" }]} value="all" />
    );
    const button = screen.getByRole("button", { name: "全部" });
    expect(observe).toHaveBeenCalledWith(button);

    rerender(
      <SideNav
        aria-label="分类入口"
        items={[{ key: "all", label: "全部", href: "/categories" }]}
        value="all"
      />
    );
    const link = screen.getByRole("link", { name: "全部" });
    expect(disconnect).toHaveBeenCalled();
    expect(observe).toHaveBeenCalledWith(link);

    unmount();
    vi.unstubAllGlobals();
  });

  it("uses native landmark, list, link and button semantics when the caller owns content", () => {
    const onChange = vi.fn((_key: string, event: SideNavChangeEvent) => event.preventDefault());
    const navItems = [
      { key: "all", label: "全部", href: "/categories" },
      { key: "food", label: "食品", badge: 3, href: "/categories/food" },
      { key: "disabled", label: "停用", href: "/categories/disabled", disabled: true },
      { key: "home", label: "家居" }
    ] as const;
    render(
      <SideNav aria-label="独立分类" items={navItems} defaultValue="food" onChange={onChange} />
    );
    const navigation = screen.getByRole("navigation", { name: "独立分类" });
    expect(navigation.querySelector("ul")).not.toBeNull();
    const food = within(navigation).getByRole("link", { name: /食品/ });
    expect(food.getAttribute("href")).toBe("/categories/food");
    expect(food.getAttribute("aria-current")).toBe("page");
    expect(food.hasAttribute("tabindex")).toBe(false);
    const disabled = within(navigation).getByRole("link", { name: "停用" });
    expect(disabled.hasAttribute("href")).toBe(false);
    expect(disabled.getAttribute("aria-disabled")).toBe("true");
    expect(disabled.getAttribute("tabindex")).toBe("-1");
    expect(within(navigation).getByRole("button", { name: "家居" })).toBeTruthy();

    fireEvent.click(disabled);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(within(navigation).getByRole("link", { name: "全部" }));
    expect(onChange).toHaveBeenCalledWith("all", expect.anything());
  });

  it("accepts a complete accessible name for rich labels and badges", () => {
    render(
      <SideNav
        items={[
          {
            key: "updates",
            label: <span aria-hidden="true">更新</span>,
            ariaLabel: "更新分类，12 项待处理",
            badge: "12",
            badgeLabel: "12 项待处理",
            content: "更新内容"
          }
        ]}
      />
    );

    expect(screen.getByRole("tab", { name: "更新分类，12 项待处理" })).toBeTruthy();
    expect(screen.getByRole("tabpanel", { name: "更新分类，12 项待处理" })).toBeTruthy();
  });

  it("creates no selection or tab stop when every item is disabled", () => {
    render(
      <SideNav
        items={[
          { key: "a", label: "甲", content: "甲内容", disabled: true },
          { key: "b", label: "乙", content: "乙内容", disabled: true }
        ]}
      />
    );

    expect(document.querySelector('[role="tab"][aria-selected="true"]')).toBeNull();
    expect(screen.queryByRole("tabpanel")).toBeNull();
    for (const tab of screen.getAllByRole("tab")) expect(tab.getAttribute("tabindex")).toBe("-1");
  });

  it("keeps the first occurrence when duplicate keys are supplied", () => {
    render(
      <SideNav
        items={[
          { key: "same", label: "首项", content: "首项内容" },
          { key: "same", label: "重复项", content: "重复内容" },
          { key: "other", label: "其他", content: "其他内容" }
        ]}
      />
    );

    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("tab", { name: "首项" })).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "重复项" })).toBeNull();
    expect(screen.getByRole("tabpanel", { name: "首项" }).textContent).toBe("首项内容");
  });

  it("keeps tab and panel ids stable when keyed items are reordered", () => {
    const { rerender } = render(<SideNav items={items} />);
    const food = screen.getByRole("tab", { name: /食品/ });
    const foodTabId = food.id;
    const foodPanelId = food.getAttribute("aria-controls");

    rerender(<SideNav items={[items[3], items[1], items[0], items[2]]} />);
    const reorderedFood = screen.getByRole("tab", { name: /食品/ });
    expect(reorderedFood.id).toBe(foodTabId);
    expect(reorderedFood.getAttribute("aria-controls")).toBe(foodPanelId);
    const reorderedFoodPanel = foodPanelId ? document.getElementById(foodPanelId) : null;
    expect(reorderedFoodPanel && reorderedFoodPanel.id).toBe(foodPanelId);
  });

  it("does not steal focus on ordinary rerenders or from another instance", () => {
    const { rerender } = render(
      <>
        <button type="button">页面操作</button>
        <SideNav aria-label="第一组" items={items} />
        <SideNav aria-label="第二组" items={items} />
      </>
    );
    const outside = screen.getByRole("button", { name: "页面操作" });
    act(() => outside.focus());

    rerender(
      <>
        <button type="button">页面操作</button>
        <SideNav aria-label="第一组" items={[...items]} />
        <SideNav aria-label="第二组" items={[...items]} />
      </>
    );

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "页面操作" }));
  });

  it("forwards root attributes and ref while exposing a bounded sticky rail", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <>
        <h2 id="category-heading">分类导航</h2>
        <SideNav
          ref={ref}
          aria-labelledby="category-heading"
          className="business-side-nav"
          data-business-state="ready"
          items={items}
          sticky
          stickyOffset="56px"
        />
      </>
    );

    expect(ref.current && ref.current.className).toContain("business-side-nav");
    expect(ref.current && ref.current.getAttribute("data-business-state")).toBe("ready");
    expect(ref.current && ref.current.getAttribute("data-sticky")).toBe("true");
    expect(ref.current && ref.current.style.getPropertyValue("--meu-side-nav-sticky-offset")).toBe(
      "56px"
    );
    expect(screen.getByRole("tablist", { name: "分类导航" })).toBeTruthy();
  });

  it("scrolls only the rail when measurable active content is clipped", () => {
    const { rerender } = render(<SideNav items={items} value="all" />);
    const rail = screen.getByRole("tablist");
    const food = screen.getByRole("tab", { name: /食品/ });
    rail.getBoundingClientRect = () => ({ top: 0, bottom: 100, height: 100 }) as DOMRect;
    food.getBoundingClientRect = () => ({ top: 120, bottom: 172, height: 52 }) as DOMRect;
    Object.defineProperty(rail, "scrollTop", { configurable: true, value: 10, writable: true });

    rerender(<SideNav items={items} value="food" />);
    expect(rail.scrollTop).toBe(82);
  });
});
