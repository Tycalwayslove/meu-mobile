// @vitest-environment jsdom
import { MeuIconSearch } from "@meu/icons-react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders an accessible native button", () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="搜索" onClick={onClick}>
        <MeuIconSearch />
      </IconButton>
    );
    fireEvent.click(screen.getByRole("button", { name: "搜索" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("blocks interaction while loading", () => {
    render(
      <IconButton aria-label="搜索" loading>
        <MeuIconSearch />
      </IconButton>
    );
    const button = screen.getByRole("button", { name: "搜索" });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
  });
});
