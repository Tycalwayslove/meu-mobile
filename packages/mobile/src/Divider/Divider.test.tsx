// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Divider } from "./Divider";

describe("Divider", () => {
  it("exposes separator semantics", () => {
    render(<Divider>更多信息</Divider>);
    const divider = screen.getByRole("separator");
    expect(divider.getAttribute("aria-orientation")).toBe("horizontal");
    expect(divider.textContent).toBe("更多信息");
  });
});
