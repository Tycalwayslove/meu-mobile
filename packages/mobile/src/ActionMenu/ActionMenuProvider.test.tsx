// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, forwardRef, useImperativeHandle, useRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { ActionMenuProvider, useActionMenu } from "./ActionMenuProvider";
import type { ActionMenuCloseDetails, ActionMenuController } from "./types";

type ConsumerHandle = {
  clear: () => void;
  close: () => void;
};

const Consumer = forwardRef<ConsumerHandle, { onClose: (details: ActionMenuCloseDetails) => void }>(
  function Consumer({ onClose }, ref) {
    const actionMenu = useActionMenu();
    const controllerRef = useRef<ActionMenuController | null>(null);
    useImperativeHandle(
      ref,
      () => ({
        clear: actionMenu.clear,
        close: () => {
          if (controllerRef.current) controllerRef.current.close();
        }
      }),
      [actionMenu]
    );
    const options = {
      "aria-label": "订单操作",
      actions: [{ key: "copy", label: "复制订单号" }],
      onClose
    } as const;
    return (
      <>
        <button
          type="button"
          onClick={() => {
            controllerRef.current = actionMenu.show(options);
          }}
        >
          打开菜单
        </button>
        <button
          type="button"
          onClick={() => controllerRef.current && controllerRef.current.close()}
        >
          关闭菜单
        </button>
        <button
          type="button"
          onClick={() => {
            actionMenu.show(options);
            actionMenu.show({ ...options, "aria-label": "第二个菜单" });
          }}
        >
          打开多个菜单
        </button>
        <button type="button" onClick={actionMenu.clear}>
          清空菜单
        </button>
      </>
    );
  }
);

describe("ActionMenuProvider", () => {
  it("shows, closes and clears provider-scoped menus with explicit reasons", async () => {
    const onClose = vi.fn<(details: ActionMenuCloseDetails) => void>();
    const consumerRef = createRef<ConsumerHandle>();
    render(
      <ActionMenuProvider>
        <Consumer ref={consumerRef} onClose={onClose} />
      </ActionMenuProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "打开菜单" }));
    await waitFor(() => expect(screen.getByRole("dialog", { name: "订单操作" })).toBeTruthy());
    await waitFor(() => expect(screen.queryByRole("button", { name: "关闭菜单" })).toBeNull());
    act(() => {
      if (consumerRef.current) consumerRef.current.close();
    });
    expect(screen.queryByRole("dialog", { name: "订单操作" })).toBeNull();
    expect(onClose).toHaveBeenLastCalledWith({ reason: "programmatic" });

    fireEvent.click(screen.getByRole("button", { name: "打开多个菜单" }));
    await waitFor(() => expect(screen.getAllByRole("dialog")).toHaveLength(2));
    await waitFor(() => expect(screen.queryByRole("button", { name: "清空菜单" })).toBeNull());
    act(() => {
      if (consumerRef.current) consumerRef.current.clear();
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onClose).toHaveBeenCalledWith({ reason: "clear" });
  });

  it("settles active controller callbacks when the provider unmounts", async () => {
    const onClose = vi.fn<(details: ActionMenuCloseDetails) => void>();
    const { unmount } = render(
      <ActionMenuProvider>
        <Consumer onClose={onClose} />
      </ActionMenuProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "打开菜单" }));
    await waitFor(() => expect(screen.getByRole("dialog", { name: "订单操作" })).toBeTruthy());

    unmount();
    expect(onClose).toHaveBeenCalledWith({ reason: "programmatic" });
  });
});
