// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Popup } from "./Popup";

describe("Popup", () => {
  it("uses modal dialog semantics and reports every dismissal source", async () => {
    const onOpenChange = vi.fn();
    render(
      <Popup
        aria-label="订单筛选"
        open
        showCloseButton
        closeOnMaskClick
        onOpenChange={onOpenChange}
      >
        筛选内容
      </Popup>
    );
    const popup = screen.getByRole("dialog", { name: "订单筛选" });
    expect(popup.getAttribute("aria-modal")).toBe("true");
    expect(popup.getAttribute("data-position")).toBe("bottom");
    const closeButton = screen.getByRole("button", { name: "关闭" });
    await waitFor(() => expect(document.activeElement).toBe(closeButton));

    const mask = document.body.querySelector('[data-meu-component="mask"]');
    if (!(mask instanceof HTMLElement) || !(mask.firstElementChild instanceof HTMLElement)) {
      throw new Error("Expected Popup mask");
    }
    fireEvent.click(mask.firstElementChild);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenNthCalledWith(1, false, { reason: "mask" });
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false, { reason: "escape" });
    expect(onOpenChange).toHaveBeenNthCalledWith(3, false, { reason: "close-button" });
  });

  it("contains tab focus and restores the invoker", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "打开浮层";
    document.body.append(trigger);
    trigger.focus();

    const { rerender } = render(
      <Popup aria-label="配送方式" open showCloseButton>
        <button type="button">确认配送</button>
      </Popup>
    );
    const close = screen.getByRole("button", { name: "关闭" });
    const confirm = screen.getByRole("button", { name: "确认配送" });
    await waitFor(() => expect(document.activeElement).toBe(close));

    confirm.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);

    rerender(
      <Popup aria-label="配送方式" open={false} showCloseButton>
        <button type="button">确认配送</button>
      </Popup>
    );
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("keeps a force-mounted closed popup out of layout and the accessibility tree", () => {
    render(
      <Popup aria-label="筛选面板" open={false} forceMount>
        内容
      </Popup>
    );
    const layer = document.body.querySelector('[data-meu-overlay-layer="popup"]');
    if (!(layer instanceof HTMLElement)) throw new Error("Expected Popup layer");
    expect(layer.hidden).toBe(true);
    expect(screen.queryByRole("dialog", { name: "筛选面板" })).toBeNull();
  });

  it("routes Escape to the top layer and reference-counts scroll locks", async () => {
    const onFirstChange = vi.fn();
    const onSecondChange = vi.fn();
    const { rerender } = render(
      <>
        <Popup aria-label="第一层" open onOpenChange={onFirstChange}>
          <button type="button">第一层操作</button>
        </Popup>
        <Popup aria-label="第二层" open onOpenChange={onSecondChange}>
          <button type="button">第二层操作</button>
        </Popup>
      </>
    );
    await waitFor(() => expect(document.activeElement).toBe(screen.getByText("第二层操作")));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onSecondChange).toHaveBeenCalledWith(false, { reason: "escape" });
    expect(onFirstChange).not.toHaveBeenCalled();

    rerender(
      <>
        <Popup aria-label="第一层" open onOpenChange={onFirstChange}>
          <button type="button">第一层操作</button>
        </Popup>
        <Popup aria-label="第二层" open={false} onOpenChange={onSecondChange}>
          <button type="button">第二层操作</button>
        </Popup>
      </>
    );
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onFirstChange).toHaveBeenCalledWith(false, { reason: "escape" });

    rerender(
      <>
        <Popup aria-label="第一层" open={false} onOpenChange={onFirstChange}>
          <button type="button">第一层操作</button>
        </Popup>
        <Popup aria-label="第二层" open={false} onOpenChange={onSecondChange}>
          <button type="button">第二层操作</button>
        </Popup>
      </>
    );
    expect(document.body.hasAttribute("data-meu-scroll-locked")).toBe(false);
  });
});
