// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { NavBar } from "./NavBar";

describe("NavBar", () => {
  it("renders a native back button only when an action is provided", () => {
    const onBack = vi.fn();
    render(<NavBar title="订单详情" onBack={onBack} right={<a href="/help">帮助</a>} />);

    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("banner").getAttribute("data-bordered")).toBe("true");
    expect(screen.getByRole("link", { name: "帮助" }).getAttribute("href")).toBe("/help");
  });

  it("uses an anchor and localized name when backHref is present", () => {
    render(
      <ConfigProvider locale="en-US">
        <NavBar title="Orders" backHref="/orders" />
      </ConfigProvider>
    );

    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe("/orders");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("does not invent an interactive back control", () => {
    render(<NavBar title="首页" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("allows a back link handler to cancel native navigation", () => {
    const onBack = vi.fn((event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      event.preventDefault();
    });
    render(<NavBar title="订单" backHref="/orders" onBack={onBack} />);
    const link = screen.getByRole("link", { name: "返回" });
    expect(fireEvent.click(link)).toBe(false);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("opts into top safe-area spacing without fixed positioning", () => {
    render(<NavBar title={<h1>标题</h1>} safeArea />);
    const banner = screen.getByRole("banner");
    expect(banner.getAttribute("data-safe-area")).toBe("true");
    expect(screen.getByRole("heading", { level: 1, name: "标题" })).toBeTruthy();
  });
});
