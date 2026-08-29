// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NumberKeyboard } from "../NumberKeyboard";
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
    const firstDialog = document.querySelector<HTMLElement>(
      '[data-meu-component="popup"][aria-label="第一层"]'
    );
    const firstLayer = firstDialog
      ? firstDialog.closest<HTMLElement>("[data-meu-overlay-layer='popup']")
      : null;
    const secondLayer = screen
      .getByRole("dialog", { name: "第二层" })
      .closest<HTMLElement>("[data-meu-overlay-layer='popup']");
    expect(firstLayer ? firstLayer.getAttribute("data-meu-modal-isolated") : null).toBe("true");
    expect(secondLayer ? secondLayer.hasAttribute("inert") : null).toBe(false);
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
    expect(firstLayer ? firstLayer.hasAttribute("inert") : null).toBe(false);
    expect(firstLayer ? firstLayer.hasAttribute("aria-hidden") : null).toBe(false);
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

  it("isolates body and custom-container siblings while preserving their original state", async () => {
    const bodyBackground = document.createElement("button");
    bodyBackground.textContent = "页面背景";
    bodyBackground.setAttribute("aria-hidden", "false");
    document.body.append(bodyBackground);
    const preInert = document.createElement("div");
    preInert.setAttribute("inert", "");
    document.body.append(preInert);
    const container = document.createElement("div");
    const containerBackground = document.createElement("button");
    containerBackground.textContent = "容器背景";
    container.append(containerBackground);
    document.body.append(container);

    const { rerender } = render(
      <Popup aria-label="自定义容器弹层" container={container} open showCloseButton>
        弹层内容
      </Popup>
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "关闭" }))
    );
    const layer = container.querySelector<HTMLElement>("[data-meu-overlay-layer='popup']");
    const mask = layer ? layer.querySelector<HTMLElement>("[data-meu-component='mask']") : null;
    expect(bodyBackground.getAttribute("data-meu-modal-isolated")).toBe("true");
    expect(containerBackground.getAttribute("data-meu-modal-isolated")).toBe("true");
    expect(layer ? layer.hasAttribute("inert") : null).toBe(false);
    expect(mask ? mask.hasAttribute("inert") : null).toBe(false);

    rerender(
      <Popup aria-label="自定义容器弹层" container={container} open={false} showCloseButton>
        弹层内容
      </Popup>
    );
    await waitFor(() => expect(bodyBackground.hasAttribute("inert")).toBe(false));
    expect(bodyBackground.getAttribute("aria-hidden")).toBe("false");
    expect(containerBackground.hasAttribute("aria-hidden")).toBe(false);
    expect(preInert.hasAttribute("inert")).toBe(true);
    bodyBackground.remove();
    preInert.remove();
    container.remove();
  });

  it("keeps a controlled non-modal keyboard reachable from the active modal", async () => {
    const background = document.createElement("button");
    background.textContent = "页面操作";
    document.body.append(background);
    render(
      <>
        <Popup aria-label="支付弹层" open>
          <input aria-label="金额" aria-controls="payment-keyboard" />
        </Popup>
        <NumberKeyboard id="payment-keyboard" open aria-label="支付数字键盘" />
      </>
    );
    await waitFor(() => expect(background.getAttribute("data-meu-modal-isolated")).toBe("true"));
    const keyboardLayer = screen
      .getByRole("group", { name: "支付数字键盘" })
      .closest<HTMLElement>("[data-meu-overlay-layer='number-keyboard']");
    expect(keyboardLayer ? keyboardLayer.hasAttribute("inert") : null).toBe(false);
    expect(keyboardLayer ? keyboardLayer.hasAttribute("aria-hidden") : null).toBe(false);
    expect(screen.getByRole("button", { name: "1" }).hasAttribute("disabled")).toBe(false);
    background.remove();
  });
});
