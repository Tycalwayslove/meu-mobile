// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Collapse } from "./Collapse";

const items = [
  { value: "delivery", title: "配送范围", content: <input aria-label="配送备注" /> },
  { value: "returns", title: "退换规则", content: "签收后 7 天内可申请退换。" },
  { value: "invoice", title: "发票服务", content: "暂不支持纸质发票。", disabled: true }
] as const;

describe("Collapse", () => {
  it("uses native buttons and preserves mounted panel state", () => {
    render(<Collapse aria-label="履约帮助" items={items} defaultValue={["delivery"]} />);
    expect(screen.getByRole("group", { name: "履约帮助" })).toBeTruthy();
    const delivery = screen.getByRole("button", { name: "配送范围" });
    const panel = screen.getByRole("region", { name: "配送范围" });
    const input = screen.getByRole("textbox", { name: "配送备注" });
    const itemRoot = delivery.closest("[data-meu-collapse-item]");
    if (!itemRoot) throw new Error("Expected Collapse item root");

    expect(delivery.getAttribute("aria-expanded")).toBe("true");
    expect(itemRoot.getAttribute("data-state")).toBe("expanded");
    expect(delivery.getAttribute("aria-controls")).toBe(panel.id);
    fireEvent.change(input, { target: { value: "工作日送达" } });
    fireEvent.click(delivery);
    expect(delivery.getAttribute("aria-expanded")).toBe("false");
    expect(panel.getAttribute("aria-hidden")).toBe("true");
    expect((input as HTMLInputElement).value).toBe("工作日送达");
  });

  it("enforces accordion mode and blocks disabled items", () => {
    render(<Collapse items={items} defaultValue={["delivery", "returns"]} accordion />);
    const delivery = screen.getByRole("button", { name: "配送范围" });
    const returns = screen.getByRole("button", { name: "退换规则" });
    const invoice = screen.getByRole("button", { name: "发票服务" });

    expect(delivery.getAttribute("aria-expanded")).toBe("true");
    expect(returns.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(returns);
    expect(delivery.getAttribute("aria-expanded")).toBe("false");
    expect(returns.getAttribute("aria-expanded")).toBe("true");
    expect(invoice).toHaveProperty("disabled", true);
  });

  it("supports controlled values without mutating its own state", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Collapse items={items} value={["delivery"]} onChange={onChange} />
    );
    const returns = screen.getByRole("button", { name: "退换规则" });
    fireEvent.click(returns);
    expect(onChange).toHaveBeenCalledWith(
      ["delivery", "returns"],
      expect.objectContaining({ type: "click" })
    );
    expect(returns.getAttribute("aria-expanded")).toBe("false");

    rerender(<Collapse items={items} value={["returns"]} onChange={onChange} />);
    expect(returns.getAttribute("aria-expanded")).toBe("true");
  });

  it("forgets removed uncontrolled values before the item is re-added", () => {
    const { rerender } = render(<Collapse items={items} defaultValue={["returns"]} accordion />);
    rerender(<Collapse items={[items[0], items[2]]} defaultValue={["returns"]} accordion />);
    expect(screen.getByRole("button", { name: "配送范围" }).getAttribute("aria-expanded")).toBe(
      "false"
    );

    rerender(<Collapse items={items} defaultValue={["returns"]} accordion />);
    expect(screen.getByRole("button", { name: "退换规则" }).getAttribute("aria-expanded")).toBe(
      "false"
    );
  });

  it("keeps collapsed interactive descendants inert", () => {
    render(<Collapse items={items} />);
    const trigger = screen.getByRole("button", { name: "配送范围" });
    const panel = document.getElementById(trigger.getAttribute("aria-controls") || "");
    if (!panel) throw new Error("Expected controlled Collapse panel");
    expect(panel.hasAttribute("inert")).toBe(true);
    fireEvent.click(trigger);
    expect(panel.hasAttribute("inert")).toBe(false);
  });

  it("can omit panel landmarks for large disclosure groups", () => {
    render(<Collapse items={items} region={false} />);
    const delivery = screen.getByRole("button", { name: "配送范围" });
    const panel = document.getElementById(delivery.getAttribute("aria-controls") || "");
    if (!panel) throw new Error("Expected labelled Collapse panel");
    expect(panel.getAttribute("role")).toBeNull();
    expect(panel.getAttribute("aria-labelledby")).toBe(delivery.id);
  });

  it("adds accordion headings and supports an accessible-name override", () => {
    render(
      <Collapse
        headingLevel={4}
        items={[
          {
            value: "icon",
            title: <span aria-hidden="true">?</span>,
            ariaLabel: "帮助",
            content: "内容"
          }
        ]}
      />
    );

    expect(screen.getByRole("heading", { level: 4 })).toBeTruthy();
    expect(screen.getByRole("button", { name: "帮助" })).toBeTruthy();
  });

  it("moves focus between enabled headers without changing expansion", () => {
    render(<Collapse items={items} defaultValue={["delivery"]} />);
    const delivery = screen.getByRole("button", { name: "配送范围" });
    const returns = screen.getByRole("button", { name: "退换规则" });

    delivery.focus();
    fireEvent.keyDown(delivery, { key: "ArrowDown" });
    expect(document.activeElement).toBe(returns);
    expect(delivery.getAttribute("aria-expanded")).toBe("true");
    expect(returns.getAttribute("aria-expanded")).toBe("false");

    fireEvent.keyDown(returns, { key: "ArrowDown" });
    expect(document.activeElement).toBe(delivery);
    fireEvent.keyDown(delivery, { key: "End" });
    expect(document.activeElement).toBe(returns);
    fireEvent.keyDown(returns, { key: "Home" });
    expect(document.activeElement).toBe(delivery);
    fireEvent.keyDown(delivery, { key: "ArrowUp" });
    expect(document.activeElement).toBe(returns);
  });

  it("can leave optional header-key navigation to the host", () => {
    render(<Collapse items={items} keyboardNavigation={false} />);
    const delivery = screen.getByRole("button", { name: "配送范围" });
    delivery.focus();
    expect(fireEvent.keyDown(delivery, { key: "ArrowDown" })).toBe(true);
    expect(document.activeElement).toBe(delivery);
  });

  it("keeps disclosure ids stable through reorder and ignores duplicate item values", () => {
    const duplicateItems = [
      items[0],
      { value: "delivery", title: "重复配送", content: "不应渲染" },
      items[1]
    ] as const;
    const { rerender } = render(<Collapse items={duplicateItems} />);
    const delivery = screen.getByRole("button", { name: "配送范围" });
    const returns = screen.getByRole("button", { name: "退换规则" });
    const deliveryId = delivery.id;
    const deliveryPanelId = delivery.getAttribute("aria-controls");
    const returnsId = returns.id;

    expect(screen.queryByRole("button", { name: "重复配送" })).toBeNull();
    rerender(<Collapse items={[items[1], items[0]]} />);
    expect(screen.getByRole("button", { name: "配送范围" }).id).toBe(deliveryId);
    expect(screen.getByRole("button", { name: "配送范围" }).getAttribute("aria-controls")).toBe(
      deliveryPanelId
    );
    expect(screen.getByRole("button", { name: "退换规则" }).id).toBe(returnsId);
  });

  it("supports an empty string as a real stable item value", () => {
    render(
      <Collapse
        defaultValue={[""]}
        items={[
          { value: "", title: "默认规则", content: "默认内容" },
          { value: "other", title: "其他规则", content: "其他内容" }
        ]}
      />
    );
    const trigger = screen.getByRole("button", { name: "默认规则" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.id.endsWith("trigger-empty")).toBe(true);
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "其他规则" }));
  });

  it("recovers focus when the focused header is removed or disabled", () => {
    const { rerender } = render(<Collapse items={items} />);
    screen.getByRole("button", { name: "退换规则" }).focus();

    rerender(<Collapse items={[items[0], items[2]]} />);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "配送范围" }));

    rerender(<Collapse items={[{ ...items[0], disabled: true }, items[1]]} />);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "退换规则" }));
  });

  it("returns focus to the trigger when a controlled panel closes externally", () => {
    const { rerender } = render(<Collapse items={items} value={["delivery"]} />);
    const delivery = screen.getByRole("button", { name: "配送范围" });
    const input = screen.getByRole("textbox", { name: "配送备注" });
    input.focus();

    rerender(<Collapse items={items} value={[]} />);
    expect(document.activeElement).toBe(delivery);
    expect(delivery.getAttribute("aria-expanded")).toBe("false");
  });

  it("releases focus when the entire focused group becomes disabled", () => {
    const { rerender } = render(<Collapse items={items} />);
    const delivery = screen.getByRole("button", { name: "配送范围" });
    delivery.focus();
    const blur = vi.spyOn(delivery, "blur");

    rerender(<Collapse items={items} disabled />);
    expect(blur).toHaveBeenCalledOnce();
    expect(delivery).toHaveProperty("disabled", true);
  });

  it("does not steal focus that deliberately moved outside before items change", () => {
    const outside = document.createElement("button");
    outside.textContent = "页面操作";
    document.body.append(outside);
    const { rerender, unmount } = render(<Collapse items={items} />);
    screen.getByRole("button", { name: "退换规则" }).focus();
    outside.focus();

    rerender(<Collapse items={[items[0]]} />);
    expect(document.activeElement).toBe(outside);
    unmount();
    outside.remove();
  });

  it("does not reclaim focus after a deliberate null-target blur", () => {
    const { rerender } = render(<Collapse items={items} />);
    const returns = screen.getByRole("button", { name: "退换规则" });

    returns.focus();
    returns.blur();
    expect(document.activeElement).toBe(document.body);
    rerender(<Collapse items={[items[0], items[2]]} />);
    expect(document.activeElement).toBe(document.body);

    rerender(<Collapse items={items} />);
    const restoredReturns = screen.getByRole("button", { name: "退换规则" });
    restoredReturns.focus();
    restoredReturns.blur();
    rerender(<Collapse items={[items[0], { ...items[1], disabled: true }]} />);
    expect(document.activeElement).toBe(document.body);
  });

  it("keeps nested groups independent during keyboard navigation", () => {
    render(
      <Collapse
        defaultValue={["outer"]}
        items={[
          {
            value: "outer",
            title: "外层",
            content: (
              <Collapse
                aria-label="内层选项"
                items={[
                  { value: "inner-a", title: "内层 A", content: "A" },
                  { value: "inner-b", title: "内层 B", content: "B" }
                ]}
              />
            )
          },
          { value: "outer-b", title: "外层 B", content: "B" }
        ]}
      />
    );
    const innerGroup = screen.getByRole("group", { name: "内层选项" });
    const innerA = within(innerGroup).getByRole("button", { name: "内层 A" });
    const innerB = within(innerGroup).getByRole("button", { name: "内层 B" });

    innerA.focus();
    fireEvent.keyDown(innerA, { key: "ArrowDown" });
    expect(document.activeElement).toBe(innerB);
    expect(screen.getByRole("button", { name: "外层" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("supports group disabled state, root attributes, ref, direction, and zero arrows", () => {
    const ref = createRef<HTMLDivElement>();
    const onChange = vi.fn();
    const { container } = render(
      <ConfigProvider dir="rtl" motion="reduced">
        <Collapse
          ref={ref}
          id="policies"
          data-owner="checkout"
          disabled
          defaultValue={["delivery"]}
          arrow={0}
          items={items}
          onChange={onChange}
        />
      </ConfigProvider>
    );
    const root = screen.getByRole("group");
    const delivery = screen.getByRole("button", { name: "配送范围" });
    const arrow = delivery.querySelector('[aria-hidden="true"]');

    expect(ref.current).toBe(root);
    expect(root.id).toBe("policies");
    expect(root.getAttribute("data-owner")).toBe("checkout");
    expect(root.getAttribute("aria-disabled")).toBeNull();
    expect(delivery).toHaveProperty("disabled", true);
    expect(delivery.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("textbox", { name: "配送备注" }).hasAttribute("disabled")).toBe(false);
    expect(arrow && arrow.textContent).toBe("0");
    expect(container.querySelector('[data-meu-motion="reduced"]')).not.toBeNull();
    fireEvent.click(delivery);
    expect(onChange).not.toHaveBeenCalled();
  });
});
