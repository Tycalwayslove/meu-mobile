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

  it("keeps media and footer actions in separate non-nested regions", () => {
    render(
      <Card
        title={<h2>会员权益</h2>}
        media={<img src="/membership.jpg" alt="会员卡" />}
        mediaAspectRatio="16 / 9"
        footer={<button type="button">立即查看</button>}
        footerLayout="actions"
      >
        本月权益
      </Card>
    );
    const card = screen.getByText("本月权益").closest('[data-meu-component="card"]');
    const media = card && card.querySelector<HTMLElement>("[data-meu-card-media]");
    const footer = card && card.querySelector("[data-meu-card-footer]");
    expect(card && card.tagName).toBe("DIV");
    expect(media && media.style.aspectRatio).toBe("16 / 9");
    expect(footer && footer.contains(screen.getByRole("button", { name: "立即查看" }))).toBe(true);
    expect(footer && footer.getAttribute("data-layout")).toBe("actions");
    expect(screen.getByRole("button", { name: "立即查看" }).closest("button button")).toBeNull();
  });

  it("preserves arbitrary legacy footer layout unless action layout is explicitly requested", () => {
    render(<Card footer={<div data-testid="custom-footer">自定义纵向内容</div>} />);
    const footer = screen.getByTestId("custom-footer").parentElement;
    expect(footer && footer.getAttribute("data-layout")).toBe("content");
  });
});
