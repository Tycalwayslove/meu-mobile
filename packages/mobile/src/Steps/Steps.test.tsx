// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Steps } from "./Steps";

const items = [
  { title: "提交订单", description: "已完成" },
  { title: "商家发货", description: "预计今天" },
  { title: "确认收货" }
] as const;

describe("Steps", () => {
  it("derives statuses in an ordered list and marks the current step", () => {
    render(<Steps items={items} current={1} />);
    const list = screen.getByRole("list", { name: "进度" });
    expect(list.tabIndex).toBe(0);
    const listItems = list.querySelectorAll("li");
    expect(listItems).toHaveLength(3);
    expect(listItems.item(0).getAttribute("data-status")).toBe("finish");
    expect(listItems.item(1).getAttribute("data-status")).toBe("process");
    expect(listItems.item(1).getAttribute("aria-current")).toBe("step");
    expect(listItems.item(2).getAttribute("data-status")).toBe("wait");
  });

  it("allows explicit error status and vertical layout", () => {
    render(
      <Steps
        direction="vertical"
        current={1}
        items={items.map((item, index) =>
          index === 1 ? { ...item, status: "error" as const } : item
        )}
      />
    );
    const list = screen.getByRole("list", { name: "进度" });
    expect(list.getAttribute("data-direction")).toBe("vertical");
    expect(list.getAttribute("tabindex")).toBeNull();
    expect(list.querySelectorAll("li").item(1).getAttribute("data-status")).toBe("error");
    expect(screen.getByText(/有错误/)).toBeTruthy();
  });

  it("localizes the progress and status text", () => {
    render(
      <ConfigProvider locale="en-US">
        <Steps items={items} current={0} />
      </ConfigProvider>
    );
    expect(screen.getByRole("list", { name: "Progress" })).toBeTruthy();
    expect(screen.getByText(/In progress/)).toBeTruthy();
  });

  it("uses native buttons only when a change handler is provided", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Steps
        aria-label="结算进度"
        current={1}
        items={[
          { key: "cart", title: "购物车" },
          { key: "address", title: "地址" },
          { key: "payment", title: "支付", ariaLabel: "前往支付步骤" },
          { key: "done", title: "完成", disabled: true }
        ]}
        onChange={onChange}
      />
    );

    const list = screen.getByRole("list", { name: "结算进度" });
    expect(list.getAttribute("data-interactive")).toBe("true");
    expect(list.tabIndex).toBe(0);
    expect(list.getAttribute("role")).toBe("list");
    expect(screen.getAllByRole("button")).toHaveLength(4);
    expect(screen.getByRole("button", { name: /完成$/ }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: /地址$/ }).hasAttribute("disabled")).toBe(true);

    await user.click(screen.getByRole("button", { name: "未开始：前往支付步骤" }));
    expect(onChange).toHaveBeenCalledWith(2, expect.anything());
    await user.click(screen.getByRole("button", { name: /地址/ }));
    fireEvent.click(screen.getByRole("button", { name: /完成$/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("uses native Enter and Space activation with keyboard mouse-event detail", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(index: number, event: ReactMouseEvent<HTMLButtonElement>) => void>();
    render(
      <Steps
        current={1}
        items={[{ title: "购物车" }, { title: "地址" }, { title: "支付" }]}
        onChange={onChange}
      />
    );

    screen.getByRole("button", { name: "未开始：支付" }).focus();
    await user.keyboard("{Enter}");
    screen.getByRole("button", { name: "已完成：购物车" }).focus();
    await user.keyboard(" ");

    expect(onChange).toHaveBeenCalledTimes(2);
    const firstCall = onChange.mock.calls[0];
    const secondCall = onChange.mock.calls[1];
    if (!firstCall || !secondCall) throw new Error("Expected two keyboard change events");
    expect(firstCall[0]).toBe(2);
    expect(firstCall[1].detail).toBe(0);
    expect(secondCall[0]).toBe(0);
    expect(secondCall[1].detail).toBe(0);
  });

  it("supports compact dot indicators, refs and caller tab-index overrides", () => {
    const ref = createRef<HTMLOListElement>();
    render(
      <Steps
        ref={ref}
        aria-label="紧凑进度"
        current={1}
        indicator="dot"
        size="small"
        tabIndex={-1}
        items={[{ title: "开始" }, { title: "结束" }]}
      />
    );
    const list = screen.getByRole("list", { name: "紧凑进度" });
    expect(ref.current).toBe(list);
    expect(list.getAttribute("data-indicator")).toBe("dot");
    expect(list.getAttribute("data-size")).toBe("small");
    expect(list.tabIndex).toBe(-1);
    expect(list.querySelectorAll('[data-step-dot="true"]')).toHaveLength(2);
  });

  it("uses aria-labelledby without installing a competing default label", () => {
    render(
      <>
        <h2 id="checkout-heading">订单履约</h2>
        <Steps aria-labelledby="checkout-heading" items={[{ title: "下单" }, { title: "发货" }]} />
      </>
    );
    const list = screen.getByRole("list", { name: "订单履约" });
    expect(list.getAttribute("aria-label")).toBeNull();
    expect(list.getAttribute("aria-labelledby")).toBe("checkout-heading");
  });

  it("keeps custom icons decorative while preserving localized status text", () => {
    render(
      <Steps
        current={0}
        items={[{ title: "审核", icon: <span aria-label="不应朗读">自定义</span> }]}
        onChange={() => undefined}
      />
    );
    expect(screen.getByRole("button", { name: "进行中：审核" })).toBeTruthy();
    expect(screen.getByText(/进行中/)).toBeTruthy();
  });

  it("keeps a horizontally scrollable interactive root focusable even when actions exist", () => {
    render(
      <Steps
        current={0}
        items={[{ title: "当前" }, { title: "不可用", disabled: true }]}
        onChange={() => undefined}
      />
    );
    const list = screen.getByRole("list", { name: "进度" });
    expect(list.tabIndex).toBe(0);
    expect(screen.getByRole("button", { name: /当前$/ }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: /不可用$/ }).hasAttribute("disabled")).toBe(true);
    fireEvent.keyDown(list, { key: "ArrowRight" });
    expect(list.scrollLeft).toBe(48);
    fireEvent.keyDown(list, { key: "ArrowLeft" });
    expect(list.scrollLeft).toBe(0);
  });

  it("uses physical arrow scrolling in RTL without consuming modified browser shortcuts", () => {
    render(
      <Steps
        dir="rtl"
        current={0}
        items={[{ title: "الحالي" }, { title: "التالي", disabled: true }]}
        onChange={() => undefined}
      />
    );
    const list = screen.getByRole("list", { name: "进度" });

    fireEvent.keyDown(list, { key: "ArrowLeft" });
    expect(list.scrollLeft).toBe(-48);
    fireEvent.keyDown(list, { key: "ArrowRight" });
    expect(list.scrollLeft).toBe(0);
    fireEvent.keyDown(list, { key: "ArrowLeft", altKey: true });
    expect(list.scrollLeft).toBe(0);
  });

  it("composes caller key handling and ignores arrow events from descendant buttons", () => {
    const onKeyDown = vi.fn((event: ReactKeyboardEvent<HTMLOListElement>) => {
      if (event.key === "ArrowRight") event.preventDefault();
    });
    render(
      <Steps
        current={0}
        items={[{ title: "当前" }, { title: "下一步" }]}
        onChange={() => undefined}
        onKeyDown={onKeyDown}
      />
    );
    const list = screen.getByRole("list", { name: "进度" });

    fireEvent.keyDown(list, { key: "ArrowRight" });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(list.scrollLeft).toBe(0);

    fireEvent.keyDown(screen.getByRole("button", { name: "未开始：下一步" }), {
      key: "ArrowLeft"
    });
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(list.scrollLeft).toBe(0);
  });
});
