// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SideNav } from "./SideNav";

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
    all.focus();
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
    all.focus();
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
    all.focus();
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
    screen.getByRole("tab", { name: /食品/ }).focus();
    rerender(<SideNav items={[items[0], items[3]]} defaultValue="food" />);
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "全部" }));

    rerender(<SideNav items={items} defaultValue="food" />);
    const food = screen.getByRole("tab", { name: /食品/ });
    fireEvent.click(food);
    food.focus();
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

  it("uses navigation semantics when the caller owns content", () => {
    const navItems = [
      { key: "all", label: "全部" },
      { key: "food", label: "食品", badge: 3 },
      { key: "disabled", label: "停用", disabled: true },
      { key: "home", label: "家居" }
    ] as const;
    render(<SideNav aria-label="独立分类" items={navItems} defaultValue="food" />);
    expect(screen.getByRole("navigation", { name: "独立分类" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /食品/ }).getAttribute("aria-current")).toBe("page");
  });
});
