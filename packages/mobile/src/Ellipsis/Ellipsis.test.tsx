// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Ellipsis } from "./Ellipsis";

const content = "这是一个足够长的组件说明文本，用于验证省略与展开状态。";
const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");

function mockMeasurements() {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => 120
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      if (!(this instanceof HTMLElement) || !this.getAttribute("aria-hidden")) return 24;
      const actionCandidate = this.querySelector("span:last-child");
      const action = actionCandidate instanceof HTMLElement ? actionCandidate : null;
      const actionText = action && action.textContent ? action.textContent : "";
      const actionLength = action && action.style.display !== "none" ? actionText.length : 0;
      const textCandidate = this.querySelector("span:first-child");
      const text = textCandidate && textCandidate.textContent ? textCandidate.textContent : "";
      return Math.ceil((text.length + actionLength) / 9) * 24;
    }
  });
}

afterEach(() => {
  if (originalClientWidth)
    Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
  else Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
  if (originalOffsetHeight)
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", originalOffsetHeight);
  else Reflect.deleteProperty(HTMLElement.prototype, "offsetHeight");
});

describe("Ellipsis", () => {
  it("measures, expands and keeps the complete content accessible", async () => {
    mockMeasurements();
    const onExpandedChange = vi.fn();
    const onEllipsisChange = vi.fn();
    render(
      <Ellipsis
        content={content}
        rows={1}
        direction="middle"
        onExpandedChange={onExpandedChange}
        onEllipsisChange={onEllipsisChange}
      />
    );

    const expand = await screen.findByRole("button", { name: "展开" });
    expect(screen.getByText(content)).toBeTruthy();
    await waitFor(() => expect(onEllipsisChange).toHaveBeenCalledWith(true));
    fireEvent.click(expand);
    expect(onExpandedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(screen.getByRole("button", { name: "收起" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("supports controlled expansion", async () => {
    mockMeasurements();
    const onExpandedChange = vi.fn();
    render(
      <Ellipsis content={content} rows={1} expanded={false} onExpandedChange={onExpandedChange} />
    );
    fireEvent.click(await screen.findByRole("button", { name: "展开" }));
    expect(onExpandedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(screen.getByRole("button", { name: "展开" })).toBeTruthy();
  });
});
