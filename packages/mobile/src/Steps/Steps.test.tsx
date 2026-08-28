// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
});
