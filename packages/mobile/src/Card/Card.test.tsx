// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

describe("Card", () => {
  it("renders named slots without inventing interactive semantics", () => {
    render(
      <Card title={<h2>订单摘要</h2>} description="今日创建" extra="待支付" footer="查看全部">
        3 件商品
      </Card>
    );

    const card = screen.getByText("3 件商品").closest('[data-meu-component="card"]');
    if (!card) throw new Error("Expected Card root");
    expect(card.tagName).toBe("DIV");
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("heading", { name: "订单摘要" })).toBeTruthy();
    expect(screen.getByText("查看全部")).toBeTruthy();
  });

  it("preserves empty but intentional body content and visual metadata", () => {
    render(
      <Card variant="filled" padding="none">
        {0}
      </Card>
    );

    const card = document.querySelector('[data-meu-component="card"]');
    if (!card) throw new Error("Expected Card root");
    const body = card.querySelector("[data-meu-card-body]");
    if (!body) throw new Error("Expected Card body");
    expect(card.getAttribute("data-variant")).toBe("filled");
    expect(card.getAttribute("data-padding")).toBe("none");
    expect(body.textContent).toBe("0");
  });
});
