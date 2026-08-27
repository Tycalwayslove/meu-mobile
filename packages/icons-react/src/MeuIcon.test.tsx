// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MeuIconSearch } from "./MeuIcon";

describe("MeuIcon", () => {
  it("is decorative without a title", () => {
    const { container } = render(<MeuIconSearch />);
    const icon = container.querySelector("svg");
    expect(icon && icon.getAttribute("aria-hidden")).toBe("true");
  });

  it("becomes an accessible image when titled", () => {
    render(<MeuIconSearch title="搜索" />);
    expect(screen.getByRole("img", { name: "搜索" })).toBeTruthy();
  });
});
