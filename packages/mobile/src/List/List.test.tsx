// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Cell } from "./Cell";
import { List } from "./List";

describe("Cell", () => {
  it("keeps static information non-interactive", () => {
    render(<Cell title="账户余额" description="昨日更新" extra="¥128.00" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("账户余额")).toBeTruthy();
  });

  it("uses a native button for actions and blocks disabled interaction", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Cell title="编辑资料" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "编辑资料" });
    expect(button.getAttribute("type")).toBe("button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<Cell title="编辑资料" disabled onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "编辑资料" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("uses an anchor for navigation and disables it without a fake href", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Cell title="订单详情" href="/orders/1" onClick={onClick} />);
    expect(screen.getByRole("link", { name: "订单详情" }).getAttribute("href")).toBe("/orders/1");

    rerender(<Cell title="订单详情" href="/orders/1" disabled onClick={onClick} />);
    const disabledLink = screen.getByText("订单详情").closest("a");
    expect(disabledLink).not.toBeNull();
    if (!disabledLink) throw new Error("Expected a disabled anchor element");
    expect(disabledLink.getAttribute("href")).toBeNull();
    expect(disabledLink.getAttribute("aria-disabled")).toBe("true");
    expect(disabledLink.getAttribute("tabindex")).toBe("-1");
    fireEvent.click(disabledLink);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("List", () => {
  it("groups cells with list semantics and an accessible header", () => {
    render(
      <List header="账户设置" footer="修改后立即生效" mode="card" divider="full">
        <Cell title="个人资料" />
        <Cell title="收货地址" href="/addresses" />
      </List>
    );
    expect(screen.getByRole("list", { name: "账户设置" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("修改后立即生效")).toBeTruthy();
  });
});
