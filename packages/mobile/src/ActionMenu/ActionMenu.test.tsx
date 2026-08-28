// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { ActionMenu } from "./ActionMenu";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

describe("ActionMenu", () => {
  it("uses modal dialog semantics, regroups danger actions and restores focus", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "更多操作";
    document.body.append(trigger);
    trigger.focus();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ActionMenu
        open
        title="订单操作"
        description="选择一个操作继续"
        actions={[
          { key: "delete", label: "删除订单", tone: "danger" },
          { key: "copy", label: "复制订单号" },
          { key: "share", label: "分享订单" }
        ]}
        returnFocusRef={{ current: trigger }}
        onOpenChange={onOpenChange}
      />
    );

    const dialog = screen.getByRole("dialog", { name: "订单操作" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.queryByRole("menu")).toBeNull();
    const menu = document.body.querySelector('[data-meu-component="action-menu"]');
    if (!(menu instanceof HTMLElement)) throw new Error("Expected ActionMenu root");
    const groups = menu.querySelectorAll("[data-action-group]");
    expect(Array.from(groups).map((group) => group.getAttribute("data-action-group"))).toEqual([
      "neutral",
      "danger",
      "cancel"
    ]);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "复制订单号" }))
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "escape" });
    rerender(
      <ActionMenu
        open={false}
        title="订单操作"
        actions={[{ key: "copy", label: "复制订单号" }]}
        returnFocusRef={{ current: trigger }}
      />
    );
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    trigger.remove();
  });

  it("runs async callbacks in order and blocks every dismiss path while pending", async () => {
    const deferred = createDeferred<void>();
    const calls: string[] = [];
    const onOpenChange = vi.fn();
    render(
      <ActionMenu
        open
        title="订单操作"
        actions={[
          {
            key: "copy",
            label: "复制订单号",
            onPress: async () => {
              calls.push("item:start");
              await deferred.promise;
              calls.push("item:end");
            }
          },
          { key: "share", label: "分享订单" }
        ]}
        onAction={() => {
          calls.push("menu");
        }}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "复制订单号" }));
    const dialog = screen.getByRole("dialog", { name: "订单操作" });
    expect(dialog.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "分享订单" }).disabled).toBe(true);
    fireEvent.keyDown(document, { key: "Escape" });
    const mask = document.body.querySelector(
      '[data-meu-overlay-layer="popup"] [data-meu-component="mask"]'
    );
    if (!(mask instanceof HTMLElement) || !(mask.firstElementChild instanceof HTMLElement)) {
      throw new Error("Expected ActionMenu mask");
    }
    fireEvent.click(mask.firstElementChild);
    expect(onOpenChange).not.toHaveBeenCalled();

    deferred.resolve();
    await waitFor(() =>
      expect(onOpenChange).toHaveBeenCalledWith(false, {
        actionKey: "copy",
        reason: "action"
      })
    );
    expect(calls).toEqual(["item:start", "item:end", "menu"]);
  });

  it("stays open when an item returns false or either callback rejects", async () => {
    const failure = new Error("request failed");
    const onActionError = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ActionMenu
        open
        title="订单操作"
        actions={[
          { key: "stay", label: "暂不关闭", onPress: () => false },
          { key: "fail", label: "保存失败" }
        ]}
        onAction={(action) => (action.key === "fail" ? Promise.reject(failure) : undefined)}
        onActionError={onActionError}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "暂不关闭" }));
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "订单操作" }).hasAttribute("aria-busy")).toBe(false)
    );
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "保存失败" }));
    await waitFor(() => expect(onActionError).toHaveBeenCalledWith(failure, expect.any(Object)));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("invalidates a pending action when a controlled menu closes and reopens", async () => {
    const deferred = createDeferred<void>();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ActionMenu
        open
        title="第一条记录"
        actions={[{ key: "save", label: "保存第一条", onPress: () => deferred.promise }]}
        onOpenChange={onOpenChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "保存第一条" }));
    expect(screen.getByRole("dialog").getAttribute("aria-busy")).toBe("true");

    rerender(
      <ActionMenu open={false} title="第一条记录" actions={[]} onOpenChange={onOpenChange} />
    );
    rerender(
      <ActionMenu
        open
        title="第二条记录"
        actions={[{ key: "save", label: "保存第二条" }]}
        onOpenChange={onOpenChange}
      />
    );
    expect(screen.getByRole("dialog", { name: "第二条记录" }).hasAttribute("aria-busy")).toBe(
      false
    );
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "保存第二条" }).disabled).toBe(
      false
    );

    deferred.resolve();
    await waitFor(() => expect(onOpenChange).not.toHaveBeenCalled());
    expect(screen.getByRole("dialog", { name: "第二条记录" })).toBeTruthy();
  });

  it("inherits direction and reduced motion through Popup's body portal", () => {
    render(
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <ActionMenu open title="Actions" actions={[]} />
      </ConfigProvider>
    );
    const layer = document.body.querySelector('[data-meu-overlay-layer="popup"]');
    if (!(layer instanceof HTMLElement)) throw new Error("Expected Popup layer");
    expect(layer.dir).toBe("rtl");
    expect(layer.lang).toBe("en-US");
    expect(layer.getAttribute("data-meu-motion")).toBe("reduced");
    expect(layer.getAttribute("data-meu-theme")).toBe("dark");
  });

  it("always confirms danger actions with localized safe defaults", async () => {
    const onPress = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <ActionMenu
          open
          aria-label="Order actions"
          actions={[{ key: "delete", label: "Delete order", onPress, tone: "danger" }]}
          onOpenChange={onOpenChange}
        />
      </ConfigProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete order" }));
    const confirmation = screen.getByRole("alertdialog", {
      name: "Continue with this action?"
    });
    expect(onPress).not.toHaveBeenCalled();
    expect(within(confirmation).getByText(/This action may be irreversible/)).toBeTruthy();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(confirmation).getByRole("button", { name: "Cancel" })
      )
    );
    fireEvent.click(within(confirmation).getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(onPress).toHaveBeenCalledOnce());
    expect(onOpenChange).toHaveBeenCalledWith(false, {
      actionKey: "delete",
      reason: "action"
    });
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Delete order" }))
    );
  });

  it("reports controlled cancel intent without changing external state", () => {
    const onOpenChange = vi.fn();
    render(
      <ActionMenu
        open
        aria-label="订单操作"
        actions={[{ key: "copy", label: "复制订单号" }]}
        onOpenChange={onOpenChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "cancel" });
    expect(screen.getByRole("dialog", { name: "订单操作" })).toBeTruthy();
  });

  it("keeps a force-mounted closed menu out of the accessible tree", () => {
    render(
      <ActionMenu
        open={false}
        forceMount
        aria-label="订单操作"
        actions={[{ key: "copy", label: "复制订单号" }]}
      />
    );
    expect(screen.queryByRole("dialog", { name: "订单操作" })).toBeNull();
    const menu = document.body.querySelector('[data-meu-component="action-menu"]');
    expect(menu).toBeTruthy();
    const layer = menu && menu.closest('[data-meu-overlay-layer="popup"]');
    expect(layer && layer.hasAttribute("hidden")).toBe(true);
  });

  it("removes a nested confirmation immediately when the controlled menu closes", () => {
    const actions = [{ key: "delete", label: "删除订单", tone: "danger" as const }];
    const { rerender } = render(<ActionMenu open title="订单操作" actions={actions} />);
    fireEvent.click(screen.getByRole("button", { name: "删除订单" }));
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    rerender(<ActionMenu open={false} forceMount title="订单操作" actions={actions} />);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
