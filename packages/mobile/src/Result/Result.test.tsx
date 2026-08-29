// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "../Button";
import { Result } from "./Result";

describe("Result", () => {
  it("announces a named result and renders follow-up actions", () => {
    render(
      <Result
        status="success"
        title="订单提交成功"
        description="商家将在今天处理订单。"
        actions={<Button>查看订单</Button>}
      />
    );
    const result = screen.getByRole("status", { name: "订单提交成功" });
    expect(result.getAttribute("aria-atomic")).toBe("true");
    expect(result.getAttribute("data-status")).toBe("success");
    expect(screen.getByRole("button", { name: "查看订单" })).toBeTruthy();
  });

  it("supports custom and omitted icons without changing its status", () => {
    const { rerender } = render(
      <Result status="warning" title="库存发生变化" icon={<span>库存</span>} />
    );
    expect(screen.getByText("库存")).toBeTruthy();
    rerender(<Result status="error" title="提交失败" icon={null} role="alert" />);
    const result = screen.getByRole("alert", { name: "提交失败" });
    expect(result.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("renders a semantic heading and preserves the legacy waiting state", () => {
    render(<Result status="waiting" headingLevel={3} title="等待确认" />);
    const result = screen.getByRole("status", { name: "等待确认" });
    expect(result.getAttribute("data-status")).toBe("waiting");
    expect(result.getAttribute("aria-live")).toBe("polite");
    expect(screen.getByRole("heading", { level: 3, name: "等待确认" })).toBeTruthy();
  });

  it("does not create a live region when the caller chooses a static group role", () => {
    render(<Result role="group" status="info" title="订单说明" />);
    const result = screen.getByRole("group", { name: "订单说明" });
    expect(result.getAttribute("aria-live")).toBeNull();
    expect(result.getAttribute("aria-atomic")).toBeNull();
  });

  it("merges external ID references and preserves an explicit atomic preference", () => {
    render(
      <>
        <span id="result-context">支付流程</span>
        <span id="result-hint">订单可在稍后重试</span>
        <Result
          aria-atomic="false"
          aria-labelledby="result-context result-context"
          aria-describedby="result-hint result-hint"
          status="error"
          title="支付失败"
          description="银行卡暂不可用。"
        />
      </>
    );
    const result = screen.getByRole("status", { name: /支付失败.*支付流程|支付流程.*支付失败/ });
    expect(result.getAttribute("aria-atomic")).toBe("false");
    const labelledByValue = result.getAttribute("aria-labelledby");
    const describedByValue = result.getAttribute("aria-describedby");
    expect(labelledByValue && labelledByValue.split(/\s+/)).toContain("result-context");
    expect(describedByValue && describedByValue.split(/\s+/)).toContain("result-hint");
    expect(result.getAttribute("aria-describedby")).toContain("description");
  });

  it("omits empty optional slots and normalizes runtime heading levels", () => {
    render(
      <Result
        actions={false}
        description={null}
        headingLevel={8 as 6}
        icon={false}
        status="info"
        title="运行时输入已归一"
      />
    );
    const result = screen.getByRole("status", { name: "运行时输入已归一" });
    expect(screen.getByRole("heading", { level: 6 })).toBeTruthy();
    expect(result.getAttribute("aria-describedby")).toBeNull();
    expect(result.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(result.querySelector("button")).toBeNull();
    expect(result.children).toHaveLength(1);
  });
});
