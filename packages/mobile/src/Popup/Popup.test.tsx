// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider, ThemeProvider } from "../ConfigProvider";
import { motionReduced, themeBoundary } from "../ConfigProvider/ConfigProvider.css";
import { NumberKeyboard } from "../NumberKeyboard";
import { Popup } from "./Popup";

describe("Popup", () => {
  it("carries a nested provider boundary into its configured portal target", async () => {
    const portalTarget = document.createElement("div");
    document.body.append(portalTarget);

    const view = render(
      <ConfigProvider
        dir="rtl"
        locale="en-US"
        motion="reduced"
        portalContainer={portalTarget}
        theme="dark"
      >
        <ThemeProvider>
          <Popup aria-label="Delivery options" open showCloseButton>
            <button type="button">Confirm delivery</button>
          </Popup>
        </ThemeProvider>
      </ConfigProvider>
    );

    const layer = portalTarget.querySelector<HTMLElement>("[data-meu-overlay-layer='popup']");
    if (!layer) throw new Error("Expected nested Popup portal boundary");
    expect(layer.getAttribute("dir")).toBe("rtl");
    expect(layer.getAttribute("lang")).toBe("en-US");
    expect(layer.getAttribute("data-meu-theme")).toBe("dark");
    expect(layer.getAttribute("data-meu-motion")).toBe("reduced");
    expect(layer.classList.contains(themeBoundary)).toBe(true);
    expect(layer.classList.contains(motionReduced)).toBe(true);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }))
    );

    view.unmount();
    portalTarget.remove();
  });

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
    fireEvent.pointerDown(mask.firstElementChild, { pointerId: 1 });
    fireEvent.pointerCancel(mask.firstElementChild, { pointerId: 1 });
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(mask.firstElementChild);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenNthCalledWith(1, false, { reason: "mask" });
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false, { reason: "escape" });
    expect(onOpenChange).toHaveBeenNthCalledWith(3, false, { reason: "close-button" });
    expect(screen.getByRole("dialog", { name: "订单筛选" })).toBeTruthy();
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");
  });

  it("keeps modal isolation without rendering a mask", async () => {
    const background = document.createElement("button");
    background.textContent = "页面操作";
    document.body.append(background);
    render(
      <Popup aria-label="无蒙层面板" open mask={false}>
        <button type="button">面板操作</button>
      </Popup>
    );

    await waitFor(() => expect(background.hasAttribute("inert")).toBe(true));
    expect(document.body.querySelector('[data-meu-component="mask"]')).toBeNull();
    expect(screen.getByRole("dialog", { name: "无蒙层面板" })).toBeTruthy();
    background.remove();
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

  it("honors a valid initial focus target", async () => {
    const initialFocusRef = createRef<HTMLButtonElement>();
    render(
      <Popup aria-label="配送方式" open initialFocusRef={initialFocusRef} showCloseButton>
        <button ref={initialFocusRef} type="button">
          确认配送
        </button>
      </Popup>
    );

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "确认配送" }))
    );
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

  it("keeps force-mounted content hidden after its exit completes", async () => {
    const { rerender } = render(
      <Popup aria-label="保活面板" open forceMount>
        内容
      </Popup>
    );
    const layer = document.body.querySelector('[data-meu-overlay-layer="popup"]');
    if (!(layer instanceof HTMLElement)) throw new Error("Expected Popup layer");

    rerender(
      <Popup aria-label="保活面板" open={false} forceMount>
        内容
      </Popup>
    );
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    expect(layer.hasAttribute("inert")).toBe(true);
    await waitFor(() => expect(layer.hidden).toBe(true));
    expect(screen.queryByRole("dialog", { name: "保活面板" })).toBeNull();
  });

  it("cancels an exit unmount when a controlled popup reopens", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Popup aria-label="筛选面板" open onOpenChange={onOpenChange}>
        <button type="button">应用筛选</button>
      </Popup>
    );
    await waitFor(() => expect(screen.getByRole("dialog", { name: "筛选面板" })).toBeTruthy());

    rerender(
      <Popup aria-label="筛选面板" open={false} onOpenChange={onOpenChange}>
        <button type="button">应用筛选</button>
      </Popup>
    );
    const layer = document.body.querySelector<HTMLElement>('[data-meu-overlay-layer="popup"]');
    if (!layer) throw new Error("Expected exiting Popup layer");
    await waitFor(() => expect(layer.getAttribute("data-state")).toBe("closed"));

    rerender(
      <Popup aria-label="筛选面板" open onOpenChange={onOpenChange}>
        <button type="button">应用筛选</button>
      </Popup>
    );
    await waitFor(() => expect(layer.getAttribute("data-state")).toBe("open"));
    await new Promise((resolve) => setTimeout(resolve, 180));
    expect(document.body.contains(layer)).toBe(true);
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("rebinds focus trapping when an open popup moves between portal containers", async () => {
    const firstContainer = document.createElement("div");
    const secondContainer = document.createElement("div");
    const outside = document.createElement("button");
    outside.textContent = "页面操作";
    document.body.append(firstContainer, secondContainer, outside);

    const { rerender } = render(
      <Popup aria-label="移动面板" container={firstContainer} open>
        <button type="button">面板操作</button>
      </Popup>
    );
    await waitFor(() =>
      expect(firstContainer.querySelector('[data-meu-component="popup"]')).toBeTruthy()
    );

    rerender(
      <Popup aria-label="移动面板" container={secondContainer} open>
        <button type="button">面板操作</button>
      </Popup>
    );
    await waitFor(() => {
      expect(firstContainer.querySelector('[data-meu-component="popup"]')).toBeNull();
      expect(secondContainer.querySelector('[data-meu-component="popup"]')).toBeTruthy();
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "面板操作" }));
    });

    outside.focus();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "面板操作" }))
    );

    rerender(
      <Popup aria-label="移动面板" container={secondContainer} open={false}>
        <button type="button">面板操作</button>
      </Popup>
    );
    await waitFor(() => expect(outside.hasAttribute("inert")).toBe(false));
    firstContainer.remove();
    secondContainer.remove();
    outside.remove();
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

  it("hydrates an open body portal without recoverable errors", async () => {
    const ui = (
      <Popup aria-label="服务端面板" open>
        <button type="button">确认</button>
      </Popup>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);
    document.body.append(container);
    const recoverableErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(container, ui, {
        onRecoverableError: (error) => recoverableErrors.push(error)
      });
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(document.body.querySelector('[role="dialog"][aria-label="服务端面板"]')).toBeTruthy()
    );
    expect(recoverableErrors).toEqual([]);

    act(() => {
      if (root !== undefined) root.unmount();
    });
    container.remove();
  });
});
