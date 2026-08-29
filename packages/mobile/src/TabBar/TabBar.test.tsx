// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
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

  it("preserves anchor identity and blocks navigation for disabled href items", () => {
    const onChange = vi.fn();
    const onDisabledClick = vi.fn();
    const onParentClick = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Event boundary verifies disabled links stop React bubbling.
      <div onClick={onParentClick}>
        <TabBar
          items={[
            { key: "current", label: "当前地址", icon: <span>E</span>, href: "#current" },
            {
              key: "locked",
              label: "暂不可用",
              icon: <span>L</span>,
              href: "/locked",
              disabled: true,
              onClick: onDisabledClick
            }
          ]}
          onChange={onChange}
        />
      </div>
    );

    expect(screen.getByRole("link", { name: "当前地址" }).getAttribute("href")).toBe("#current");
    const disabledLink = screen.getByRole("link", { name: "暂不可用" });
    expect(disabledLink.getAttribute("href")).toBeNull();
    expect(disabledLink.getAttribute("role")).toBe("link");
    expect(disabledLink.getAttribute("aria-disabled")).toBe("true");
    expect(disabledLink.getAttribute("tabindex")).toBe("-1");
    expect(fireEvent.click(disabledLink)).toBe(false);
    expect(onDisabledClick).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it("uses aria-labelledby without adding a competing default label and forwards the React 19 ref", () => {
    const ref = createRef<HTMLElement>();
    render(
      <>
        <h2 id="shop-navigation">店铺入口</h2>
        <TabBar ref={ref} aria-labelledby="shop-navigation" items={items} />
      </>
    );
    const navigation = screen.getByRole("navigation", { name: "店铺入口" });
    expect(navigation.getAttribute("aria-label")).toBeNull();
    expect(navigation.getAttribute("aria-labelledby")).toBe("shop-navigation");
    expect(ref.current).toBe(navigation);
  });

  it("retains local focus across ordinary and multi-instance rerenders without stealing external focus", () => {
    const outsideItems = items.map((item) =>
      item.key === "orders" ? { ...item, disabled: true } : item
    );
    const { rerender } = render(
      <>
        <button type="button">页面外操作</button>
        <TabBar aria-label="店铺 A" items={items} />
        <TabBar aria-label="店铺 B" items={items} />
      </>
    );
    const secondNavigation = screen.getByRole("navigation", { name: "店铺 B" });
    const secondOrders = within(secondNavigation).getByRole("button", { name: /订单/ });
    secondOrders.focus();

    rerender(
      <>
        <button type="button">页面外操作</button>
        <TabBar aria-label="已更新的店铺 A" items={items} />
        <TabBar aria-label="已更新的店铺 B" items={items} />
      </>
    );
    expect(document.activeElement).toBe(secondOrders);

    const outside = screen.getByRole("button", { name: "页面外操作" });
    outside.focus();
    rerender(
      <>
        <button type="button">页面外操作</button>
        <TabBar aria-label="已更新的店铺 A" items={items} />
        <TabBar aria-label="已更新的店铺 B" items={outsideItems} />
      </>
    );
    expect(document.activeElement).toBe(outside);
  });

  it("composes native focus callbacks and does not reclaim deliberately blurred focus", () => {
    const onFocusCapture = vi.fn();
    const onBlurCapture = vi.fn();
    const { rerender } = render(
      <TabBar
        aria-label="焦点测试"
        items={items}
        onFocusCapture={onFocusCapture}
        onBlurCapture={onBlurCapture}
      />
    );
    const orders = screen.getByRole("button", { name: /订单/ });
    orders.focus();
    expect(onFocusCapture).toHaveBeenCalledOnce();

    orders.blur();
    expect(onBlurCapture).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(document.body);

    rerender(
      <TabBar
        aria-label="焦点测试已更新"
        items={items}
        onFocusCapture={onFocusCapture}
        onBlurCapture={onBlurCapture}
      />
    );
    expect(document.activeElement).toBe(document.body);
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

  it("keeps native Tab and Enter behavior while skipping disabled destinations", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TabBar items={items} onChange={onChange} />);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: /首页/ }));
    await user.tab();
    const orders = screen.getByRole("button", { name: /订单/ });
    expect(document.activeElement).toBe(orders);
    await user.keyboard("{Enter}");
    expect(orders.getAttribute("aria-current")).toBe("page");
    expect(onChange).toHaveBeenCalledWith("orders", expect.anything());
    await user.tab();
    expect(document.activeElement).toBe(document.body);
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

  it("keeps the first duplicate identity and retains current state across reordering", () => {
    const unique = [
      { key: "home", label: "首页", icon: <span>H</span> },
      { key: "orders", label: "订单", icon: <span>O</span> },
      { key: "orders", label: "重复订单", icon: <span>D</span> }
    ];
    const { rerender } = render(<TabBar items={unique} />);
    expect(screen.queryByText("重复订单")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "订单" }));

    rerender(<TabBar items={[unique[1]!, unique[0]!, unique[2]!]} />);
    expect(screen.getByRole("button", { name: "订单" }).getAttribute("aria-current")).toBe("page");
    expect(document.querySelectorAll('[data-tab-bar-key="orders"]')).toHaveLength(1);
  });

  it("moves focus to the normalized current item when a focused destination disappears or disables", () => {
    const { rerender } = render(<TabBar items={items} defaultValue="orders" />);
    const orders = screen.getByRole("button", { name: /订单/ });
    orders.focus();
    expect(document.activeElement).toBe(orders);

    rerender(<TabBar items={[items[0]]} defaultValue="orders" />);
    const home = screen.getByRole("link", { name: /首页/ });
    expect(home.getAttribute("aria-current")).toBe("page");
    expect(document.activeElement).toBe(home);

    rerender(<TabBar items={items} defaultValue="orders" />);
    const restoredOrders = screen.getByRole("button", { name: /订单/ });
    restoredOrders.focus();
    const disabledOrders = items.map((item) =>
      item.key === "orders" ? { ...item, disabled: true } : item
    );
    rerender(<TabBar items={disabledOrders} defaultValue="orders" />);
    expect(document.activeElement).toBe(screen.getByRole("link", { name: /首页/ }));
  });
});
