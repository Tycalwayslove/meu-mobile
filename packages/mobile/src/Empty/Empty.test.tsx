// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "../Button";
import { Empty } from "./Empty";

describe("Empty", () => {
  it("groups a reason and executable next step", () => {
    render(
      <Empty
        title="暂时没有订单"
        description="当前筛选条件下没有可处理的订单。"
        action={<Button>清除筛选</Button>}
      />
    );
    const empty = screen.getByRole("group", { name: "暂时没有订单" });
    expect(empty.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByText("当前筛选条件下没有可处理的订单。")).toBeTruthy();
    expect(screen.getByRole("button", { name: "清除筛选" })).toBeTruthy();
    expect(empty.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it("allows the decorative illustration to be hidden", () => {
    render(
      <Empty
        title="没有内容"
        description="请稍后重试。"
        action={<a href="#retry">刷新</a>}
        illustration={null}
      />
    );
    const empty = screen.getByRole("group", { name: "没有内容" });
    expect(empty.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByRole("link", { name: "刷新" }).getAttribute("href")).toBe("#retry");
  });

  it("supports a reason and primary/secondary action hierarchy without requiring actions", () => {
    const { rerender } = render(
      <Empty
        reason="no-results"
        title="没有匹配项"
        description="调整筛选条件，或返回全部商品。"
        action={<Button>清除筛选</Button>}
        secondaryAction={<a href="#all">查看全部</a>}
      />
    );
    const empty = screen.getByRole("group", { name: "没有匹配项" });
    expect(empty.getAttribute("data-reason")).toBe("no-results");
    expect(screen.getByRole("button", { name: "清除筛选" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "查看全部" })).toBeTruthy();

    rerender(<Empty title="尚未配置" description="完成配置后会显示内容。" />);
    expect(screen.getByRole("group", { name: "尚未配置" })).toBeTruthy();
    expect(document.querySelector('[data-meu-slot="actions"]')).toBeNull();
  });

  it("merges caller ID references with its visible title and description", () => {
    render(
      <>
        <span id="external-empty-title">购物车区域</span>
        <span id="external-empty-hint">登录后可同步商品</span>
        <Empty
          aria-labelledby="external-empty-title external-empty-title"
          aria-describedby="external-empty-hint external-empty-hint"
          title="购物车为空"
          description="添加商品后会显示在这里。"
        />
      </>
    );
    const empty = screen.getByRole("group", {
      name: /购物车为空.*购物车区域|购物车区域.*购物车为空/
    });
    const labelledByValue = empty.getAttribute("aria-labelledby");
    const describedByValue = empty.getAttribute("aria-describedby");
    const labelledBy = labelledByValue ? labelledByValue.split(/\s+/) : [];
    const describedBy = describedByValue ? describedByValue.split(/\s+/) : [];
    expect(labelledBy).toContain("external-empty-title");
    expect(labelledBy.filter((id) => id === "external-empty-title")).toHaveLength(1);
    expect(describedBy).toContain("external-empty-hint");
    expect(describedBy.filter((id) => id === "external-empty-hint")).toHaveLength(1);
    expect(describedBy.some((id) => id.includes("description"))).toBe(true);
  });

  it("does not reserve an action row for empty React nodes", () => {
    render(
      <Empty
        title="没有可用动作"
        description="业务稍后再提供恢复入口。"
        action={null}
        secondaryAction={false}
      />
    );
    expect(document.querySelector('[data-meu-slot="actions"]')).toBeNull();
  });
});
