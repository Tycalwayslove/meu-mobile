// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import type { MouseEvent } from "react";
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

  it("exposes an optional badge description without changing native navigation semantics", () => {
    render(
      <TabBar
        items={[
          {
            key: "orders",
            label: "订单",
            icon: <span>O</span>,
            href: "#orders",
            badge: 3,
            badgeLabel: "3 个未读订单"
          }
        ]}
      />
    );
    const link = screen.getByRole("link", { name: /3 个未读订单.*订单|订单.*3 个未读订单/ });
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("lets an item click handler cancel both selection and native navigation", () => {
    const onChange = vi.fn();
    const onClick = vi.fn((event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      event.preventDefault();
    });
    render(
      <TabBar
        defaultValue="home"
        onChange={onChange}
        items={[
          { key: "home", label: "首页", icon: <span>H</span> },
          { key: "orders", label: "订单", icon: <span>O</span>, href: "#orders", onClick }
        ]}
      />
    );

    fireEvent.click(screen.getByRole("link", { name: "订单" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "首页" }).getAttribute("aria-current")).toBe("page");
  });

  it("forgets a removed uncontrolled route before it is re-added", () => {
    const { rerender } = render(<TabBar items={items} defaultValue="orders" />);
    rerender(<TabBar items={[items[0]]} defaultValue="orders" />);
    expect(screen.getByRole("link", { name: /首页/ }).getAttribute("aria-current")).toBe("page");

    rerender(<TabBar items={items} defaultValue="orders" />);
    expect(screen.getByRole("link", { name: /首页/ }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: /订单/ }).hasAttribute("aria-current")).toBe(false);
  });

  it("normalizes an uncontrolled route when it becomes disabled", () => {
    const { rerender } = render(<TabBar items={items} defaultValue="orders" />);
    const disabledOrders = items.map((item) =>
      item.key === "orders" ? { ...item, disabled: true } : item
    );
    rerender(<TabBar items={disabledOrders} defaultValue="orders" />);
    expect(screen.getByRole("link", { name: /首页/ }).getAttribute("aria-current")).toBe("page");

    rerender(<TabBar items={items} defaultValue="orders" />);
    expect(screen.getByRole("link", { name: /首页/ }).getAttribute("aria-current")).toBe("page");
  });
});
