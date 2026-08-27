// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Tabs } from "./Tabs";

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
    overview.focus();
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
    overview.focus();
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
});
