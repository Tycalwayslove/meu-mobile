// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Dialog } from "./Dialog";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

describe("Dialog", () => {
  it("connects alert dialog semantics, focuses the least destructive action and restores focus", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "删除订单";
    document.body.append(trigger);
    trigger.focus();
    const onOpenChange = vi.fn();
    const actions = [
      { key: "cancel", label: "取消", tone: "neutral" as const },
      { key: "delete", label: "删除", tone: "danger" as const }
    ];
    const { rerender } = render(
      <Dialog
        open
        title="删除订单？"
        description="删除后无法恢复。"
        actions={actions}
        onOpenChange={onOpenChange}
      />
    );

    const dialog = screen.getByRole("alertdialog", { name: "删除订单？" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    const cancelButton = screen.getByRole("button", { name: "取消" });
    await waitFor(() => expect(document.activeElement).toBe(cancelButton));

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: "escape" });
    rerender(
      <Dialog
        open={false}
        title="删除订单？"
        description="删除后无法恢复。"
        actions={actions}
        onOpenChange={onOpenChange}
      />
    );
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("blocks dismissal and concurrent actions while an async action is pending", async () => {
    const deferred = createDeferred<void>();
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        closeOnMaskClick
        title="提交退款？"
        description="提交后将进入审核流程。"
        actions={[
          { key: "cancel", label: "取消" },
          { key: "confirm", label: "提交", onPress: () => deferred.promise, tone: "accent" }
        ]}
        onOpenChange={onOpenChange}
      />
    );
    const cancelButton = screen.getByRole("button", { name: "取消" });
    await waitFor(() => expect(document.activeElement).toBe(cancelButton));

    fireEvent.click(screen.getByRole("button", { name: "提交" }));
    const dialog = screen.getByRole("alertdialog", { name: "提交退款？" });
    expect(dialog.getAttribute("aria-busy")).toBe("true");
    expect((cancelButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(document, { key: "Escape" });
    const mask = document.body.querySelector(
      '[data-meu-overlay-layer="dialog"] [data-meu-component="mask"]'
    );
    if (!(mask instanceof HTMLElement) || !(mask.firstElementChild instanceof HTMLElement)) {
      throw new Error("Expected Dialog mask");
    }
    fireEvent.click(mask.firstElementChild);
    expect(onOpenChange).not.toHaveBeenCalled();

    deferred.resolve();
    await waitFor(() =>
      expect(onOpenChange).toHaveBeenCalledWith(false, {
        actionKey: "confirm",
        reason: "action"
      })
    );
  });

  it("keeps the dialog open when an action returns false or fails", async () => {
    const actionError = new Error("request failed");
    const onActionError = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        title="更改设置？"
        description="保存前会验证当前输入。"
        actions={[
          { key: "stay", label: "暂不关闭", onPress: () => false },
          { key: "fail", label: "保存", onPress: () => Promise.reject(actionError) }
        ]}
        onActionError={onActionError}
        onOpenChange={onOpenChange}
      />
    );
    const stayButton = screen.getByRole("button", { name: "暂不关闭" });
    await waitFor(() => expect(document.activeElement).toBe(stayButton));

    fireEvent.click(stayButton);
    await waitFor(() =>
      expect(screen.getByRole("alertdialog").hasAttribute("aria-busy")).toBe(false)
    );
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() =>
      expect(onActionError).toHaveBeenCalledWith(actionError, expect.any(Object))
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("invalidates a pending action when a controlled dialog closes and reopens", async () => {
    const deferred = createDeferred<void>();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dialog
        open
        title="第一条记录"
        description="第一条说明"
        actions={[{ key: "save", label: "保存第一条", onPress: () => deferred.promise }]}
        onOpenChange={onOpenChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "保存第一条" }));
    expect(screen.getByRole("alertdialog").getAttribute("aria-busy")).toBe("true");

    rerender(
      <Dialog
        open={false}
        title="第一条记录"
        description="第一条说明"
        actions={[]}
        onOpenChange={onOpenChange}
      />
    );
    rerender(
      <Dialog
        open
        title="第二条记录"
        description="第二条说明"
        actions={[{ key: "save", label: "保存第二条" }]}
        onOpenChange={onOpenChange}
      />
    );
    expect(screen.getByRole("alertdialog", { name: "第二条记录" }).hasAttribute("aria-busy")).toBe(
      false
    );
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "保存第二条" }).disabled).toBe(
      false
    );

    deferred.resolve();
    await waitFor(() => expect(onOpenChange).not.toHaveBeenCalled());
    expect(screen.getByRole("alertdialog", { name: "第二条记录" })).toBeTruthy();
  });

  it("copies direction, theme and reduced motion across the default body portal", () => {
    render(
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <Dialog open title="Portal contract" description="Portal description" actions={[]} />
      </ConfigProvider>
    );
    const layer = document.body.querySelector('[data-meu-overlay-layer="dialog"]');
    if (!(layer instanceof HTMLElement)) throw new Error("Expected Dialog layer");
    expect(layer.dir).toBe("rtl");
    expect(layer.lang).toBe("en-US");
    expect(layer.getAttribute("data-meu-motion")).toBe("reduced");
    expect(layer.getAttribute("data-meu-theme")).toBe("dark");
    const mask = layer.querySelector('[data-meu-component="mask"]');
    expect(mask && mask.getAttribute("dir")).toBe("rtl");
    expect(mask && mask.getAttribute("data-meu-motion")).toBe("reduced");
  });

  it("uses vertical action layout for three or more actions", () => {
    render(
      <Dialog
        role="dialog"
        open
        title="选择处理方式"
        actions={[
          { key: "one", label: "稍后处理" },
          { key: "two", label: "保存草稿" },
          { key: "three", label: "立即提交" }
        ]}
      />
    );
    expect(screen.getByRole("dialog").getAttribute("data-action-layout")).toBe("vertical");
  });

  it("supports a force-mounted non-alert dialog with body content and a public ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(
      <Dialog
        ref={ref}
        role="dialog"
        open
        title="编辑备注"
        actions={[]}
        className="business-dialog"
      >
        <label>
          备注
          <input />
        </label>
      </Dialog>
    );
    const dialog = screen.getByRole("dialog", { name: "编辑备注" });
    expect(ref.current).toBe(dialog);
    expect(dialog.className).toContain("business-dialog");
    expect(dialog.hasAttribute("aria-describedby")).toBe(false);

    rerender(
      <Dialog ref={ref} role="dialog" open={false} forceMount title="编辑备注" actions={[]} />
    );
    expect(screen.queryByRole("dialog", { name: "编辑备注" })).toBeNull();
  });
});
