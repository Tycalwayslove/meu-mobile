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
    rerender(<Result status="error" title="提交失败" icon={null} />);
    const result = screen.getByRole("status", { name: "提交失败" });
    expect(result.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
