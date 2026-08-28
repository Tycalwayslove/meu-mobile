// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
});
