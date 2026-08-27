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
});
