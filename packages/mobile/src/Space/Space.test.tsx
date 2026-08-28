// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Space } from "./Space";

describe("Space", () => {
  it("preserves child order and exposes its direction", () => {
    render(
      <Space direction="vertical">
        <span>第一项</span>
        <span>第二项</span>
      </Space>
    );
    const space = screen.getByText("第一项").parentElement;
    expect(space && space.getAttribute("data-direction")).toBe("vertical");
    expect(space && space.textContent).toBe("第一项第二项");
  });

  it("maps layout inputs to stable QA attributes", () => {
    render(
      <Space align="end" block gap={6} wrap data-testid="space">
        <span>项目</span>
      </Space>
    );
    const space = screen.getByTestId("space");
    expect(space.getAttribute("data-align")).toBe("end");
    expect(space.getAttribute("data-direction")).toBe("horizontal");
    expect(space.getAttribute("data-gap")).toBe("6");
    expect(space.getAttribute("data-wrap")).toBe("true");
  });

  it("forwards native div attributes and refs", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Space ref={ref} aria-label="筛选条件" className="consumer-class">
        内容
      </Space>
    );
    expect(screen.getByLabelText("筛选条件")).toBe(ref.current);
    expect(ref.current && ref.current.classList.contains("consumer-class")).toBe(true);
  });
});
