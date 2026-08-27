// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
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
});
