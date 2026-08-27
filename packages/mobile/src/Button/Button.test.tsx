// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders an accessible native button", () => {
    render(<Button>保存更改</Button>);
    expect(screen.getByRole("button", { name: "保存更改" }).getAttribute("type")).toBe("button");
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
  });
});
