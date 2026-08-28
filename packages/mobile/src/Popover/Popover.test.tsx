// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../Button";
import { ConfigProvider } from "../ConfigProvider";
import { Dialog } from "../Dialog";
import { Popover } from "./Popover";

async function flushPosition() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("Popover", () => {
  it("opens from its trigger and exposes the dialog relationship", async () => {
    const onOpenChange = vi.fn();
    render(
      <Popover
        aria-label="订单快捷操作"
        content={<button type="button">复制订单号</button>}
        onOpenChange={onOpenChange}
      >
        <Button>更多操作</Button>
      </Popover>
    );

    const trigger = screen.getByRole("button", { name: "更多操作" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    await flushPosition();

    const popover = screen.getByRole("dialog", { name: "订单快捷操作" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(popover.id);
    expect(popover.getAttribute("data-placement")).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: "trigger" });
  });

  it("reports outside and Escape dismissal reasons", async () => {
    const changes: Array<{ open: boolean; reason: string }> = [];

    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <Popover
          aria-label="筛选选项"
          content={<button type="button">仅看有货</button>}
          open={open}
          onOpenChange={(nextOpen, details) => {
            changes.push({ open: nextOpen, reason: details.reason });
            setOpen(nextOpen);
          }}
        >
          <Button>筛选</Button>
        </Popover>
      );
    }

    render(<Example />);
    const trigger = screen.getByRole("button", { name: "筛选" });
    fireEvent.click(trigger);
    await flushPosition();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog", { name: "筛选选项" })).toBeNull();

    fireEvent.click(trigger);
    await flushPosition();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "筛选选项" })).toBeNull();
    expect(changes).toEqual([
      { open: true, reason: "trigger" },
      { open: false, reason: "outside" },
      { open: true, reason: "trigger" },
      { open: false, reason: "escape" }
    ]);
  });

  it("supports manual triggering and persistent outside interaction", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Popover aria-label="帮助" content="帮助内容" trigger="manual" onOpenChange={onOpenChange}>
        <Button>查看帮助</Button>
      </Popover>
    );
    fireEvent.click(screen.getByRole("button", { name: "查看帮助" }));
    expect(screen.queryByRole("dialog", { name: "帮助" })).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();

    rerender(
      <Popover
        aria-label="帮助"
        closeOnOutsideClick={false}
        content="帮助内容"
        open
        trigger="manual"
        onOpenChange={onOpenChange}
      >
        <Button>查看帮助</Button>
      </Popover>
    );
    await flushPosition();
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole("dialog", { name: "帮助" })).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("focuses the requested content and restores the trigger after Escape", async () => {
    const initialFocusRef = createRef<HTMLButtonElement>();
    render(
      <Popover
        aria-label="配送操作"
        content={<button ref={initialFocusRef}>选择配送时间</button>}
        initialFocusRef={initialFocusRef}
      >
        <Button>配送</Button>
      </Popover>
    );
    const trigger = screen.getByRole("button", { name: "配送" });
    trigger.focus();
    fireEvent.click(trigger);
    await flushPosition();
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "选择配送时间" }));
    });

    fireEvent.keyDown(document, { key: "Escape" });
    await flushPosition();
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("keeps a force-mounted closed panel out of layout and the accessibility tree", () => {
    render(
      <Popover aria-label="保活内容" content="保留状态" forceMount>
        <Button>保活触发器</Button>
      </Popover>
    );
    const panel = document.querySelector("[data-meu-component='popover']");
    if (!(panel instanceof HTMLElement)) throw new Error("Expected force-mounted Popover");
    expect(panel.hidden).toBe(true);
    expect(panel.getAttribute("aria-hidden")).toBe("true");
  });

  it("carries direction, locale, theme and reduced motion into its body portal", async () => {
    render(
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <Popover aria-label="Quick actions" content="Content" defaultOpen>
          <Button>Open</Button>
        </Popover>
      </ConfigProvider>
    );
    await flushPosition();
    const panel = screen.getByRole("dialog", { name: "Quick actions" });
    expect(panel.getAttribute("data-meu-theme")).toBe("dark");
    expect(panel.getAttribute("data-meu-motion")).toBe("reduced");
    expect(panel.getAttribute("dir")).toBe("rtl");
    expect(panel.getAttribute("lang")).toBe("en-US");
    expect(document.body.contains(panel)).toBe(true);
  });

  it("allows a Popover opened from a Dialog to become a valid focus branch", async () => {
    render(
      <Dialog open role="dialog" title="订单" actions={[{ key: "close", label: "关闭" }]}>
        <Popover aria-label="订单操作" content={<button type="button">复制订单号</button>}>
          <Button>更多</Button>
        </Popover>
      </Dialog>
    );
    await act(async () => {
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
    });
    fireEvent.click(screen.getByRole("button", { name: "更多" }));
    await flushPosition();
    const branchAction = screen.getByRole("button", { name: "复制订单号" });
    branchAction.focus();
    fireEvent.focusIn(branchAction);
    expect(document.activeElement).toBe(branchAction);
  });

  it("normalizes invalid geometry and preserves panel root props", async () => {
    const panelRef = createRef<HTMLDivElement>();
    render(
      <Popover
        ref={panelRef}
        aria-label="几何边界"
        className="business-popover"
        content="内容"
        defaultOpen
        offset={Number.NaN}
        style={{ width: 240 }}
        viewportPadding={Number.NEGATIVE_INFINITY}
      >
        <Button>边界触发器</Button>
      </Popover>
    );
    await flushPosition();
    const panel = screen.getByRole("dialog", { name: "几何边界" });
    expect(panelRef.current).toBe(panel);
    expect(panel.className).toContain("business-popover");
    expect(panel.style.width).toBe("240px");
    expect(panel.getAttribute("data-offset")).toBe("10");
    expect(panel.getAttribute("data-viewport-padding")).toBe("16");
  });
});
