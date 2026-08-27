// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { ActionMenuProvider, useActionMenu } from "./ActionMenuProvider";
import type { ActionMenuCloseDetails, ActionMenuController } from "./types";

function Consumer({ onClose }: { onClose: (details: ActionMenuCloseDetails) => void }) {
  const actionMenu = useActionMenu();
  const controllerRef = useRef<ActionMenuController | null>(null);
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
      <button type="button" onClick={() => controllerRef.current && controllerRef.current.close()}>
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

describe("ActionMenuProvider", () => {
  it("shows, closes and clears provider-scoped menus with explicit reasons", async () => {
    const onClose = vi.fn<(details: ActionMenuCloseDetails) => void>();
    render(
      <ActionMenuProvider>
        <Consumer onClose={onClose} />
      </ActionMenuProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "打开菜单" }));
    await waitFor(() => expect(screen.getByRole("dialog", { name: "订单操作" })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "关闭菜单" }));
    expect(screen.queryByRole("dialog", { name: "订单操作" })).toBeNull();
    expect(onClose).toHaveBeenLastCalledWith({ reason: "programmatic" });

    fireEvent.click(screen.getByRole("button", { name: "打开多个菜单" }));
    await waitFor(() => expect(screen.getAllByRole("dialog")).toHaveLength(2));
    fireEvent.click(screen.getByRole("button", { name: "清空菜单" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onClose).toHaveBeenCalledWith({ reason: "clear" });
  });
});
