// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SafeArea } from "./SafeArea";

describe("SafeArea", () => {
  it("renders a non-interactive safe-area spacer", () => {
    const { container } = render(<SafeArea position="top" />);
    const element = container.firstElementChild;
    expect(element && element.getAttribute("data-position")).toBe("top");
    expect(element && element.getAttribute("aria-hidden")).toBe("true");
  });
});
