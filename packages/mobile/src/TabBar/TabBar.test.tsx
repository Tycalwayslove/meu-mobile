// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { TabBar } from "./TabBar";

const items = [
  { key: "home", label: "首页", icon: <span>H</span>, href: "#home" },
  { key: "orders", label: "订单", icon: <span>O</span>, badge: 3 },
  { key: "profile", label: "我的", icon: <span>P</span>, disabled: true }
] as const;

describe("TabBar", () => {
  it("uses native links and buttons and marks the current page", () => {
    const onChange = vi.fn();
    render(<TabBar items={items} onChange={onChange} />);

    const home = screen.getByRole("link", { name: /首页/ });
    const orders = screen.getByRole("button", { name: /订单/ });
    expect(home.getAttribute("href")).toBe("#home");
    expect(home.getAttribute("aria-current")).toBe("page");
    fireEvent.click(orders);
    expect(orders.getAttribute("aria-current")).toBe("page");
    expect(onChange).toHaveBeenCalledWith("orders", expect.anything());
    expect(screen.getByRole("button", { name: "我的" }).hasAttribute("disabled")).toBe(true);
  });

  it("supports a controlled null value and active-aware icons", () => {
    render(
      <TabBar
        value={null}
        items={[
          {
            key: "home",
            label: "首页",
            icon: (active) => <span>{active ? "active" : "idle"}</span>
          }
        ]}
      />
    );
    expect(screen.getByText("idle")).toBeTruthy();
    expect(document.querySelector('[aria-current="page"]')).toBeNull();
  });

  it("localizes the landmark and appends safe-area spacing", () => {
    render(
      <ConfigProvider locale="en-US">
        <TabBar items={items} safeArea />
      </ConfigProvider>
    );
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeTruthy();
    expect(document.querySelector('[data-meu-component="safe-area"]')).toBeTruthy();
  });
});
