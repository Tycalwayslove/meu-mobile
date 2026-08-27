// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Tag } from "./Tag";

describe("Tag", () => {
  it("keeps descriptive tags non-interactive", () => {
    render(<Tag>新品</Tag>);
    expect(screen.queryByRole("button")).toBeNull();
    const tag = screen.getByText("新品").closest('[data-meu-component="tag"]');
    expect(tag && tag.tagName).toBe("SPAN");
  });

  it("uses a native button and honors disabled", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Tag onClick={onClick}>有货</Tag>);
    fireEvent.click(screen.getByRole("button", { name: "有货" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Tag disabled onClick={onClick}>
        有货
      </Tag>
    );
    fireEvent.click(screen.getByRole("button", { name: "有货" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
