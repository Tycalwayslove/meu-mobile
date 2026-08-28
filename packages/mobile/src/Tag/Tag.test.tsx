// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
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

  it("exposes controlled filter selection with native pressed semantics", () => {
    render(
      <Tag selected onClick={() => undefined}>
        仅看有货
      </Tag>
    );
    const tag = screen.getByRole("button", { name: "仅看有货" });
    expect(tag.getAttribute("aria-pressed")).toBe("true");
    expect(tag.getAttribute("data-state")).toBe("selected");
  });

  it("keeps filter and close actions as independent keyboard buttons", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(
      <Tag onClick={onClick} onClose={onClose} closeAriaLabel="移除有货筛选">
        有货
      </Tag>
    );
    const filter = screen.getByRole("button", { name: "有货" });
    const close = screen.getByRole("button", { name: "移除有货筛选" });
    expect(filter.contains(close)).toBe(false);

    filter.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
    close.focus();
    await user.keyboard(" ");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("disables both filter and close actions", () => {
    render(
      <Tag disabled onClick={() => undefined} onClose={() => undefined}>
        已停用
      </Tag>
    );
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveProperty("disabled", true);
    }
  });

  it("keeps public root attributes and ref on the complete closable layout", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Tag
        ref={ref}
        className="business-tag"
        data-testid="closable-tag"
        dir="rtl"
        hidden
        onClose={() => undefined}
        style={{ width: 180 }}
      >
        有货
      </Tag>
    );
    const root = screen.getByTestId("closable-tag");
    expect(ref.current).toBe(root);
    expect(root.hidden).toBe(true);
    expect(root.dir).toBe("rtl");
    expect(root.className).toContain("business-tag");
    expect(root.style.width).toBe("180px");
    expect(root.querySelectorAll('[data-meu-component="tag"]')).toHaveLength(0);
    expect(root.getAttribute("data-meu-component")).toBe("tag");
    const closeButton = root.querySelector<HTMLButtonElement>("[data-meu-tag-close]");
    expect(closeButton && closeButton.ariaLabel).toBe("移除标签：有货");
  });
});
