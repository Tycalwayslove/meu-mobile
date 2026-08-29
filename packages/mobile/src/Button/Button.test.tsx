// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders an accessible native button", () => {
    render(<Button>保存更改</Button>);
    const button = screen.getByRole("button", { name: "保存更改" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-busy")).toBeNull();
  });

  it("keeps decorative icon slots out of the accessible name", () => {
    render(
      <Button
        leadingIcon={<svg aria-label="前置图标" />}
        trailingIcon={<svg aria-label="后置图标" />}
      >
        下一步
      </Button>
    );

    expect(screen.getByRole("button", { name: "下一步" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /图标/ })).toBeNull();
  });

  it("blocks repeated interaction while loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        保存更改
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("button", { name: "保存更改" }).getAttribute("data-state")).toBe(
      "loading"
    );
  });
});
