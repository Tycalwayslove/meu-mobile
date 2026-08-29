// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, startTransition, StrictMode, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Tabs } from "./Tabs";
import type { TabsItem } from "./types";

const items = [
  { key: "overview", label: "概览", content: "概览内容" },
  { key: "activity", label: "动态", content: "动态内容", disabled: true },
  { key: "settings", label: "设置", content: "设置内容" }
] as const;

describe("Tabs", () => {
  it("links tabs and mounted panels with native button semantics", () => {
    render(<Tabs aria-label="店铺内容" items={items} />);

    const overview = screen.getByRole("tab", { name: "概览" });
    const settings = screen.getByRole("tab", { name: "设置" });
    expect(overview.getAttribute("aria-selected")).toBe("true");
    expect(settings.getAttribute("tabindex")).toBe("-1");
    expect(screen.getByRole("tabpanel", { name: "概览" }).textContent).toBe("概览内容");
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(3);
    expect(screen.getByRole("tab", { name: "动态" }).hasAttribute("disabled")).toBe(true);
  });

  it("skips disabled tabs and activates with arrow, Home and End", () => {
    const onChange = vi.fn();
    render(<Tabs items={items} onChange={onChange} />);
    const overview = screen.getByRole("tab", { name: "概览" });
    act(() => overview.focus());
    fireEvent.keyDown(overview, { key: "ArrowRight" });

    const settings = screen.getByRole("tab", { name: "设置" });
    expect(document.activeElement).toBe(settings);
    expect(settings.getAttribute("aria-selected")).toBe("true");
    expect(onChange).toHaveBeenCalledWith("settings", expect.anything());

    fireEvent.keyDown(settings, { key: "Home" });
    expect(document.activeElement).toBe(overview);
  });

  it("supports manual activation without changing the panel on focus movement", () => {
    const onChange = vi.fn();
    render(<Tabs items={items} activationMode="manual" onChange={onChange} />);
    const overview = screen.getByRole("tab", { name: "概览" });
    act(() => overview.focus());
    fireEvent.keyDown(overview, { key: "End" });

    const settings = screen.getByRole("tab", { name: "设置" });
    expect(document.activeElement).toBe(settings);
    expect(settings.getAttribute("aria-selected")).toBe("false");
    fireEvent.keyDown(settings, { key: "Enter" });
    expect(settings.getAttribute("aria-selected")).toBe("true");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("supports a controlled null value and optional panel destruction", () => {
    const { rerender } = render(<Tabs items={items} value={null} destroyInactive />);
    expect(screen.queryByRole("tabpanel")).toBeNull();

    rerender(<Tabs items={items} value="settings" destroyInactive />);
    expect(screen.getByRole("tabpanel", { name: "设置" }).textContent).toBe("设置内容");
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(1);
  });

  it("keeps a valid roving target for invalid or disabled controlled values", () => {
    const { rerender } = render(<Tabs items={items} value="missing" />);
    const overview = screen.getByRole("tab", { name: "概览" });
    expect(overview.getAttribute("tabindex")).toBe("0");
    expect(document.querySelector('[role="tab"][aria-selected="true"]')).toBeNull();
    expect(screen.queryByRole("tabpanel")).toBeNull();

    rerender(<Tabs items={items} value="activity" />);
    expect(screen.getByRole("tab", { name: "动态" }).getAttribute("aria-selected")).toBe("false");
    expect(screen.getByRole("tab", { name: "概览" }).getAttribute("tabindex")).toBe("0");
  });

  it("lazy-mounts panels once and retains visited panel state", () => {
    render(<Tabs aria-label="延迟标签" items={items} lazy />);
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(1);
    fireEvent.click(screen.getByRole("tab", { name: "设置" }));
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(2);
    fireEvent.click(screen.getByRole("tab", { name: "概览" }));
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(2);
  });

  it("retains panels visited through controlled value updates", () => {
    const { rerender } = render(<Tabs aria-label="受控标签" items={items} lazy value="overview" />);
    rerender(<Tabs aria-label="受控标签" items={items} lazy value="settings" />);
    rerender(<Tabs aria-label="受控标签" items={items} lazy value="overview" />);

    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(2);
  });

  it("forgets removed uncontrolled identities before they are re-added", () => {
    const enabledItems = items.filter((item) => !("disabled" in item) || !item.disabled);
    const { rerender } = render(<Tabs items={enabledItems} defaultValue="settings" lazy />);
    rerender(<Tabs items={enabledItems.slice(0, 1)} defaultValue="settings" lazy />);
    expect(screen.getByRole("tab", { name: "概览" }).getAttribute("aria-selected")).toBe("true");

    rerender(<Tabs items={enabledItems} defaultValue="settings" lazy />);
    expect(screen.getByRole("tab", { name: "概览" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "设置" }).getAttribute("tabindex")).toBe("-1");
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(1);
  });

  it("normalizes an uncontrolled value when its item is disabled and later enabled", () => {
    const { rerender } = render(<Tabs items={items} defaultValue="settings" />);
    const disabledSettings = items.map((item) =>
      item.key === "settings" ? { ...item, disabled: true } : item
    );
    rerender(<Tabs items={disabledSettings} defaultValue="settings" />);
    expect(screen.getByRole("tab", { name: "概览" }).getAttribute("aria-selected")).toBe("true");

    rerender(<Tabs items={items} defaultValue="settings" />);
    expect(screen.getByRole("tab", { name: "概览" }).getAttribute("aria-selected")).toBe("true");
  });

  it("mirrors arrow navigation in RTL and scrolls the focused tab into view", () => {
    render(
      <div dir="rtl">
        <Tabs items={items} />
      </div>
    );
    const overview = screen.getByRole("tab", { name: "概览" });
    const settings = screen.getByRole("tab", { name: "设置" });
    const scrollIntoView = vi.fn();
    settings.scrollIntoView = scrollIntoView;
    act(() => overview.focus());
    fireEvent.keyDown(overview, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(settings);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest", inline: "nearest" });
  });

  it("lets the nearest LTR ancestor override a RTL provider", () => {
    const directionItems = [
      { key: "first", label: "第一", content: "一" },
      { key: "middle", label: "第二", content: "二" },
      { key: "last", label: "第三", content: "三" }
    ];
    render(
      <ConfigProvider dir="rtl">
        <div dir="ltr">
          <Tabs items={directionItems} defaultValue="middle" activationMode="manual" />
        </div>
      </ConfigProvider>
    );
    const middle = screen.getByRole("tab", { name: "第二" });
    act(() => middle.focus());
    fireEvent.keyDown(middle, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "第三" }));
  });

  it("moves the resting roving tab stop when a controlled value changes", () => {
    const { rerender } = render(<Tabs items={items} value="overview" />);
    rerender(<Tabs items={items} value="settings" />);

    expect(screen.getByRole("tab", { name: "概览" }).getAttribute("tabindex")).toBe("-1");
    expect(screen.getByRole("tab", { name: "设置" }).getAttribute("tabindex")).toBe("0");

    const overview = screen.getByRole("tab", { name: "概览" });
    act(() => overview.focus());
    expect(overview.getAttribute("tabindex")).toBe("0");
    fireEvent.blur(overview, { relatedTarget: document.body });
    expect(screen.getByRole("tab", { name: "设置" }).getAttribute("tabindex")).toBe("0");
  });

  it("supports arbitrary string keys without corrupting the internal ref registry", () => {
    const onChange = vi.fn();
    render(
      <Tabs
        items={[
          { key: "safe", label: "普通", content: "普通内容" },
          { key: "__proto__", label: "特殊", content: "特殊内容" }
        ]}
        onChange={onChange}
      />
    );
    const safe = screen.getByRole("tab", { name: "普通" });
    fireEvent.keyDown(safe, { key: "ArrowRight" });

    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "特殊" }));
    expect(onChange).toHaveBeenCalledWith("__proto__", expect.anything());
  });

  it("updates physical overflow indicators after scrolling", () => {
    render(<Tabs items={items} stretch={false} />);
    const list = screen.getByRole("tablist");
    const tabs = screen.getAllByRole("tab");
    let firstLeft = -40;
    let lastRight = 140;
    list.getBoundingClientRect = () => ({ left: 0, right: 100, width: 100 }) as DOMRect;
    tabs[0]!.getBoundingClientRect = () =>
      ({ left: firstLeft, right: firstLeft + 40, width: 40 }) as DOMRect;
    tabs[tabs.length - 1]!.getBoundingClientRect = () =>
      ({ left: lastRight - 40, right: lastRight, width: 40 }) as DOMRect;

    fireEvent.scroll(list);
    expect(list.getAttribute("data-overflow-left")).toBe("true");
    expect(list.getAttribute("data-overflow-right")).toBe("true");

    firstLeft = -80;
    lastRight = 100;
    fireEvent.scroll(list);
    expect(list.getAttribute("data-overflow-left")).toBe("true");
    expect(list.getAttribute("data-overflow-right")).toBe("false");
  });

  it("exposes its root ref under React 19 StrictMode", () => {
    const rootRef = createRef<HTMLDivElement>();
    render(
      <StrictMode>
        <Tabs ref={rootRef} items={items} />
      </StrictMode>
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(rootRef.current && rootRef.current.dataset.meuComponent).toBe("tabs");
  });

  it("normalizes dynamic items committed in a concurrent transition", () => {
    function Harness() {
      const [dynamicItems, setDynamicItems] = useState<readonly TabsItem[]>(items);
      return (
        <>
          <button
            type="button"
            onClick={() => startTransition(() => setDynamicItems(items.slice(0, 2)))}
          >
            删除当前项
          </button>
          <Tabs items={dynamicItems} defaultValue="settings" lazy />
        </>
      );
    }

    render(
      <StrictMode>
        <Harness />
      </StrictMode>
    );
    fireEvent.click(screen.getByRole("button", { name: "删除当前项" }));

    expect(screen.getByRole("tab", { name: "概览" }).getAttribute("aria-selected")).toBe("true");
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(1);
  });

  it("recovers focus after a focused tab is removed or disabled without stealing outside focus", () => {
    const renderHarness = (dynamicItems: readonly TabsItem[]) => (
      <>
        <button type="button">页面外操作</button>
        <Tabs items={dynamicItems} defaultValue="settings" />
      </>
    );
    const { rerender } = render(renderHarness(items));
    const settings = screen.getByRole("tab", { name: "设置" });
    act(() => settings.focus());

    rerender(renderHarness(items.slice(0, 2)));
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "概览" }));

    rerender(renderHarness(items));
    const restoredSettings = screen.getByRole("tab", { name: "设置" });
    act(() => restoredSettings.focus());
    const disabledSettings = items.map((item) =>
      item.key === "settings" ? { ...item, disabled: true } : item
    );
    rerender(renderHarness(disabledSettings));
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "概览" }));

    const outside = screen.getByRole("button", { name: "页面外操作" });
    act(() => outside.focus());
    rerender(renderHarness(items.slice(0, 2)));
    expect(document.activeElement).toBe(outside);
  });
});
