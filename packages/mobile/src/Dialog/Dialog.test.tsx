// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Suspense, createRef, startTransition, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Dialog } from "./Dialog";
import type { DialogOpenChangeDetails } from "./types";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

const suspendedClose = new Promise<never>(() => undefined);

function SuspendClosingRender({ onRender, suspend }: { onRender: () => void; suspend: boolean }) {
  if (suspend) {
    onRender();
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- Suspense requires a thenable.
    throw suspendedClose;
  }
  return null;
}

function ConcurrentCloseHarness({
  actionPromise,
  onClosingRender,
  onOpenChange
}: {
  actionPromise: Promise<void>;
  onClosingRender: () => void;
  onOpenChange: (open: boolean, details: DialogOpenChangeDetails) => void;
}) {
  const [closing, setClosing] = useState(false);
  const [revision, setRevision] = useState(0);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          startTransition(() => setClosing(true));
        }}
      >
        开始并发关闭
      </button>
      <button
        type="button"
        onClick={() => {
          setClosing(false);
          setRevision((current) => current + 1);
        }}
      >
        保持打开
      </button>
      <output data-concurrent-revision>{revision}</output>
      <Suspense fallback={<span>关闭渲染挂起</span>}>
        <Dialog
          open={!closing}
          title="并发确认"
          description="关闭渲染可能被放弃。"
          actions={[{ key: "submit", label: "提交", onPress: () => actionPromise }]}
          onOpenChange={onOpenChange}
        />
        <SuspendClosingRender onRender={onClosingRender} suspend={closing} />
      </Suspense>
    </>
  );
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
    const onConfirm = vi.fn(() => deferred.promise);
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        closeOnMaskClick
        title="提交退款？"
        description="提交后将进入审核流程。"
        actions={[
          { key: "cancel", label: "取消" },
          { key: "confirm", label: "提交", onPress: onConfirm, tone: "accent" }
        ]}
        onOpenChange={onOpenChange}
      />
    );
    const cancelButton = screen.getByRole("button", { name: "取消" });
    await waitFor(() => expect(document.activeElement).toBe(cancelButton));

    const confirmButton = screen.getByRole("button", { name: "提交" });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
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
    fireEvent.pointerDown(mask.firstElementChild, { pointerId: 1 });
    fireEvent.pointerCancel(mask.firstElementChild, { pointerId: 1 });
    expect(onOpenChange).not.toHaveBeenCalled();
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

  it("contains rejected actions when no error observer is supplied", async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        title="保存失败"
        description="请稍后重试。"
        actions={[
          { key: "save", label: "保存", onPress: () => Promise.reject(new Error("offline")) }
        ]}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() =>
      expect(screen.getByRole("alertdialog").hasAttribute("aria-busy")).toBe(false)
    );
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog", { name: "保存失败" })).toBeTruthy();
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

  it("keeps the committed action session when a concurrent close render is abandoned", async () => {
    const deferred = createDeferred<void>();
    const onClosingRender = vi.fn();
    const onOpenChange = vi.fn<(open: boolean, details: DialogOpenChangeDetails) => void>();
    render(
      <ConcurrentCloseHarness
        actionPromise={deferred.promise}
        onClosingRender={onClosingRender}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "提交" }));
    expect(screen.getByRole("alertdialog").getAttribute("aria-busy")).toBe("true");
    fireEvent.click(screen.getByText("开始并发关闭"));
    await waitFor(() => expect(onClosingRender).toHaveBeenCalled());
    expect(screen.getByRole("alertdialog").getAttribute("aria-busy")).toBe("true");

    fireEvent.click(screen.getByText("保持打开"));
    await waitFor(() => {
      const revision = document.querySelector("[data-concurrent-revision]");
      expect(revision && revision.textContent).toBe("1");
    });
    deferred.resolve();
    await act(async () => {
      await deferred.promise;
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(screen.getByRole("alertdialog").hasAttribute("aria-busy")).toBe(false)
    );
    expect(onOpenChange).toHaveBeenCalledWith(false, {
      actionKey: "submit",
      reason: "action"
    });
  });

  it("does not publish a stale close after unmounting during an action", async () => {
    const deferred = createDeferred<void>();
    const onOpenChange = vi.fn();
    const { unmount } = render(
      <Dialog
        open
        title="提交订单"
        description="正在提交。"
        actions={[{ key: "submit", label: "提交", onPress: () => deferred.promise }]}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "提交" }));
    unmount();
    deferred.resolve();
    await act(async () => {
      await deferred.promise;
      await Promise.resolve();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("rebinds focus trapping when an open dialog moves between portal containers", async () => {
    const firstContainer = document.createElement("div");
    const secondContainer = document.createElement("div");
    const outside = document.createElement("button");
    outside.textContent = "页面操作";
    document.body.append(firstContainer, secondContainer, outside);

    const { rerender } = render(
      <Dialog
        container={firstContainer}
        open
        title="移动弹窗"
        description="第一容器"
        actions={[{ key: "done", label: "完成" }]}
      />
    );
    await waitFor(() =>
      expect(firstContainer.querySelector('[data-meu-component="dialog"]')).toBeTruthy()
    );

    rerender(
      <Dialog
        container={secondContainer}
        open
        title="移动弹窗"
        description="第二容器"
        actions={[{ key: "done", label: "完成" }]}
      />
    );
    await waitFor(() => {
      expect(firstContainer.querySelector('[data-meu-component="dialog"]')).toBeNull();
      expect(secondContainer.querySelector('[data-meu-component="dialog"]')).toBeTruthy();
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "完成" }));
    });

    outside.focus();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "完成" }))
    );

    rerender(
      <Dialog
        container={secondContainer}
        open={false}
        title="移动弹窗"
        description="第二容器"
        actions={[{ key: "done", label: "完成" }]}
      />
    );
    await waitFor(() => expect(outside.hasAttribute("inert")).toBe(false));
    firstContainer.remove();
    secondContainer.remove();
    outside.remove();
  });

  it("routes Escape to the top dialog and retains the shared scroll lock", async () => {
    const onFirstChange = vi.fn();
    const onSecondChange = vi.fn();
    const { rerender } = render(
      <>
        <Dialog
          open
          title="第一层"
          description="第一层说明"
          actions={[{ key: "first", label: "第一层操作" }]}
          onOpenChange={onFirstChange}
        />
        <Dialog
          open
          title="第二层"
          description="第二层说明"
          actions={[{ key: "second", label: "第二层操作" }]}
          onOpenChange={onSecondChange}
        />
      </>
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "第二层操作" }))
    );
    const firstPanel = document.querySelectorAll<HTMLElement>("[data-meu-component='dialog']")[0];
    if (firstPanel === undefined) throw new Error("Expected first Dialog panel");
    const firstLayer = firstPanel.closest<HTMLElement>("[data-meu-overlay-layer='dialog']");
    if (firstLayer === null) throw new Error("Expected first Dialog layer");
    expect(firstLayer.getAttribute("data-meu-modal-isolated")).toBe("true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onSecondChange).toHaveBeenCalledWith(false, { reason: "escape" });
    expect(onFirstChange).not.toHaveBeenCalled();

    rerender(
      <>
        <Dialog
          open
          title="第一层"
          description="第一层说明"
          actions={[{ key: "first", label: "第一层操作" }]}
          onOpenChange={onFirstChange}
        />
        <Dialog
          open={false}
          title="第二层"
          description="第二层说明"
          actions={[{ key: "second", label: "第二层操作" }]}
          onOpenChange={onSecondChange}
        />
      </>
    );
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");
    await waitFor(() => expect(firstLayer.hasAttribute("inert")).toBe(false));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onFirstChange).toHaveBeenCalledWith(false, { reason: "escape" });
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

  it("hydrates an open body portal without recoverable errors", async () => {
    const ui = (
      <Dialog
        open
        title="服务端确认"
        description="服务端说明"
        actions={[{ key: "confirm", label: "确认" }]}
      />
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
    await waitFor(() => expect(document.body.querySelector('[role="alertdialog"]')).toBeTruthy());
    expect(recoverableErrors).toEqual([]);

    act(() => {
      if (root !== undefined) root.unmount();
    });
    container.remove();
  });
});
