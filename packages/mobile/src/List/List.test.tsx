// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
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
    const disabledLink = screen.getByRole("link", { name: "订单详情" });
    expect(disabledLink).not.toBeNull();
    if (!disabledLink) throw new Error("Expected a disabled anchor element");
    expect(disabledLink.getAttribute("href")).toBeNull();
    expect(disabledLink.getAttribute("aria-disabled")).toBe("true");
    expect(disabledLink.getAttribute("tabindex")).toBe("-1");
    fireEvent.click(disabledLink);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("preserves intentional zero-valued slots", () => {
    render(<Cell title="库存" description={0} extra={0} prefix={0} suffix={0} />);
    expect(screen.getAllByText("0")).toHaveLength(4);
  });

  it("blocks duplicate actions and exposes a localized loading status", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Cell title="Submit order" loading onClick={onClick} />
      </ConfigProvider>
    );
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("data-state")).toBe("loading");
    const loadingStatus = screen.getByRole("status");
    expect(loadingStatus.textContent).toBe("Loading");
    expect(button.contains(loadingStatus)).toBe(false);
    expect(button.querySelector("[aria-hidden='true']")).not.toBeNull();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      <ConfigProvider locale="en-US">
        <Cell title="Submit order" onClick={onClick} />
      </ConfigProvider>
    );
    const readyButton = screen.getByRole("button", { name: "Submit order" });
    expect(readyButton.hasAttribute("disabled")).toBe(false);
    expect(readyButton.getAttribute("aria-busy")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.click(readyButton);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("makes a loading navigation row unavailable without changing its anchor identity", () => {
    const onClick = vi.fn();
    render(
      <Cell
        title="订单详情"
        href="/orders/1"
        loading
        loadingLabel="正在打开订单"
        onClick={onClick}
      />
    );
    const anchor = screen.getByRole("link");
    expect(anchor).not.toBeNull();
    if (!anchor) throw new Error("Expected a loading anchor element");
    expect(anchor.getAttribute("href")).toBeNull();
    expect(anchor.getAttribute("tabindex")).toBe("-1");
    expect(anchor.getAttribute("aria-disabled")).toBe("true");
    expect(anchor.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("status").textContent).toBe("正在打开订单");
    fireEvent.click(anchor);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports a busy static information row without inventing disabled semantics", () => {
    render(<Cell title="账户余额" loading />);
    const row = screen.getByText("账户余额").closest("[data-meu-component='cell']");
    expect(row).not.toBeNull();
    expect(row && row.tagName).toBe("DIV");
    expect(row && row.getAttribute("aria-busy")).toBe("true");
    expect(row && row.getAttribute("aria-disabled")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("正在加载");
  });

  it("uses the nearest explicit motion policy and allows a caller-owned silent status", () => {
    const { rerender } = render(
      <ConfigProvider motion="system">
        <Cell title="同步" loading />
      </ConfigProvider>
    );
    const systemCell = screen.getByText("同步").closest("[data-meu-component='cell']");
    const systemSpinner = systemCell
      ? systemCell.querySelector("[aria-hidden='true'] > span")
      : null;
    expect(systemSpinner).not.toBeNull();
    const systemClass = systemSpinner ? systemSpinner.className : "";

    rerender(
      <ConfigProvider motion="reduced">
        <Cell title="同步" loading />
      </ConfigProvider>
    );
    const reducedCell = screen.getByText("同步").closest("[data-meu-component='cell']");
    const reducedSpinner = reducedCell
      ? reducedCell.querySelector("[aria-hidden='true'] > span")
      : null;
    expect(reducedSpinner).not.toBeNull();
    expect(reducedSpinner ? reducedSpinner.className : "").not.toBe(systemClass);

    rerender(<Cell title="由父级公告" loading loadingLabel="" />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("uses ConfigProvider direction with an explicit Cell override for the default arrow", () => {
    render(
      <ConfigProvider dir="rtl">
        <Cell title="RTL 详情" href="#rtl" />
        <Cell title="LTR 详情" href="#ltr" dir="ltr" />
      </ConfigProvider>
    );
    const rtlIcon = screen.getByRole("link", { name: "RTL 详情" }).querySelector("svg");
    const ltrIcon = screen.getByRole("link", { name: "LTR 详情" }).querySelector("svg");
    expect(rtlIcon).not.toBeNull();
    expect(ltrIcon).not.toBeNull();
    expect(rtlIcon ? rtlIcon.getAttribute("class") : null).not.toBe(
      ltrIcon ? ltrIcon.getAttribute("class") : null
    );
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

  it("accepts zero-valued group labels and footer content", () => {
    render(
      <List header={0} footer={0}>
        <Cell title="项目" />
      </List>
    );
    expect(screen.getByRole("list", { name: "0" })).toBeTruthy();
    expect(screen.getAllByText("0")).toHaveLength(2);
  });

  it("places an explicit accessible description on the semantic list body", () => {
    render(
      <>
        <p id="account-help">只展示当前账号</p>
        <List aria-label="账户" aria-describedby="account-help">
          <Cell title="个人资料" />
        </List>
      </>
    );
    const list = screen.getByRole("list", { name: "账户" });
    expect(list.getAttribute("aria-describedby")).toBe("account-help");
    expect(
      list.parentElement ? list.parentElement.getAttribute("aria-describedby") : null
    ).toBeNull();
  });
});
