// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { DialogProvider, useDialog } from "./DialogProvider";
import type { DialogApi, DialogController } from "./types";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function DialogConsumer() {
  const dialog = useDialog();
  const [result, setResult] = useState("idle");
  return (
    <>
      <button
        type="button"
        onClick={() => {
          void dialog
            .confirm({ description: "This cannot be undone.", title: "Delete order?" })
            .then((confirmed) => setResult(confirmed ? "confirmed" : "cancelled"));
        }}
      >
        Open confirm
      </button>
      <button
        type="button"
        onClick={() => {
          void dialog
            .alert({ description: "The order has been saved.", title: "Saved" })
            .then(() => setResult("acknowledged"));
        }}
      >
        Open alert
      </button>
      <output>{result}</output>
    </>
  );
}

function DialogControllerConsumer() {
  const dialog = useDialog();
  const controllerRef = useRef<DialogController | null>(null);
  const options = {
    actions: [{ key: "done", label: "完成", tone: "accent" as const }],
    description: "Controller lifecycle",
    title: "Managed dialog"
  };
  return (
    <>
      <button
        type="button"
        onClick={() => {
          controllerRef.current = dialog.show(options);
        }}
      >
        Open managed
      </button>
      <button
        type="button"
        onClick={() => {
          if (controllerRef.current) controllerRef.current.close();
        }}
      >
        Close managed
      </button>
      <button
        type="button"
        onClick={() => {
          dialog.show(options);
          dialog.show({ ...options, title: "Second managed dialog" });
        }}
      >
        Open stack
      </button>
      <button type="button" onClick={dialog.clear}>
        Clear dialogs
      </button>
    </>
  );
}

function DialogApiCapture({ capture }: { capture: (api: DialogApi) => void }) {
  capture(useDialog());
  return null;
}

function readSettlementState<T>(result: T) {
  const layers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-meu-overlay-layer='dialog']")
  );
  return {
    hasExposedDialog: layers.some((layer) => layer.getAttribute("aria-hidden") !== "true"),
    result,
    scrollLocked: document.body.hasAttribute("data-meu-scroll-locked")
  };
}

describe("DialogProvider", () => {
  it("resolves confirm results inside the current locale context", async () => {
    render(
      <ConfigProvider locale="en-US">
        <DialogProvider>
          <DialogConsumer />
        </DialogProvider>
      </ConfigProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open confirm" }));
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await waitFor(() => expect(document.activeElement).toBe(cancelButton));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("confirmed"));
    expect(screen.queryByRole("alertdialog", { name: "Delete order?" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open confirm" }));
    const secondCancelButton = screen.getByRole("button", { name: "Cancel" });
    await waitFor(() => expect(document.activeElement).toBe(secondCancelButton));
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("cancelled"));
  });

  it("resolves alert after the acknowledgement action", async () => {
    render(
      <DialogProvider>
        <DialogConsumer />
      </DialogProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Open alert" }));
    const confirmButton = screen.getByRole("button", { name: "我知道了" });
    await waitFor(() => expect(document.activeElement).toBe(confirmButton));
    fireEvent.click(confirmButton);
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("acknowledged"));
  });

  it("commits the close intent before alert and confirm promise consumers resume", async () => {
    let dialogApi: DialogApi | undefined;
    render(
      <DialogProvider>
        <DialogApiCapture capture={(api) => (dialogApi = api)} />
      </DialogProvider>
    );
    if (dialogApi === undefined) throw new Error("Expected Dialog API");
    const api = dialogApi;
    let confirmObservation!: Promise<ReturnType<typeof readSettlementState<boolean>>>;
    act(() => {
      confirmObservation = api
        .confirm({ description: "关闭后继续。", title: "确认继续？" })
        .then((result) => readSettlementState(result));
    });
    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    await waitFor(() => {
      expect(readSettlementState(true).hasExposedDialog).toBe(false);
      expect(document.body.hasAttribute("data-meu-scroll-locked")).toBe(false);
    });
    const observedConfirm = await confirmObservation;
    expect(observedConfirm).toEqual({
      hasExposedDialog: false,
      result: true,
      scrollLocked: false
    });

    let alertObservation!: Promise<ReturnType<typeof readSettlementState<void>>>;
    act(() => {
      alertObservation = api
        .alert({ description: "关闭后完成。", title: "操作完成" })
        .then((result) => readSettlementState(result));
    });
    fireEvent.click(screen.getByRole("button", { name: "我知道了" }));
    await waitFor(() => {
      expect(readSettlementState(undefined).hasExposedDialog).toBe(false);
      expect(document.body.hasAttribute("data-meu-scroll-locked")).toBe(false);
    });
    const observedAlert = await alertObservation;
    expect(observedAlert).toEqual({
      hasExposedDialog: false,
      result: undefined,
      scrollLocked: false
    });
  });

  it("closes controllers and clears every provider-owned dialog", async () => {
    render(
      <DialogProvider>
        <DialogControllerConsumer />
      </DialogProvider>
    );
    const closeManaged = screen.getByRole("button", { name: "Close managed" });
    const clearDialogs = screen.getByRole("button", { name: "Clear dialogs" });
    fireEvent.click(screen.getByRole("button", { name: "Open managed" }));
    await waitFor(() => expect(screen.getByRole("alertdialog")).toBeTruthy());
    fireEvent.click(closeManaged);
    expect(screen.queryByRole("alertdialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open stack" }));
    await waitFor(() => expect(screen.getAllByRole("alertdialog")).toHaveLength(2));
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");
    fireEvent.click(clearDialogs);
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(document.body.hasAttribute("data-meu-scroll-locked")).toBe(false);
  });

  it("contains a rejected confirm handler and leaves its decision pending", async () => {
    let dialogApi: DialogApi | undefined;
    render(
      <DialogProvider>
        <DialogApiCapture capture={(api) => (dialogApi = api)} />
      </DialogProvider>
    );
    if (dialogApi === undefined) throw new Error("Expected Dialog API");
    const api = dialogApi;
    let settled = false;
    act(() => {
      void api
        .confirm({
          description: "保存失败后继续编辑。",
          onConfirm: () => Promise.reject(new Error("offline")),
          title: "保存更改？"
        })
        .then(() => {
          settled = true;
        });
    });

    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    await waitFor(() =>
      expect(screen.getByRole("alertdialog").hasAttribute("aria-busy")).toBe(false)
    );
    expect(settled).toBe(false);
    expect(screen.getByRole("alertdialog", { name: "保存更改？" })).toBeTruthy();
  });

  it("settles a pending confirm as false when its provider unmounts", async () => {
    const deferred = createDeferred<void>();
    let dialogApi: DialogApi | undefined;
    const { unmount } = render(
      <DialogProvider>
        <DialogApiCapture capture={(api) => (dialogApi = api)} />
      </DialogProvider>
    );
    if (dialogApi === undefined) throw new Error("Expected Dialog API");
    const api = dialogApi;
    let resultPromise!: Promise<boolean>;
    act(() => {
      resultPromise = api.confirm({
        description: "等待服务端响应。",
        onConfirm: () => deferred.promise,
        title: "提交申请？"
      });
    });
    fireEvent.click(screen.getByRole("button", { name: "确认" }));
    expect(screen.getByRole("alertdialog").getAttribute("aria-busy")).toBe("true");

    unmount();
    await expect(resultPromise).resolves.toBe(false);
    deferred.resolve();
    await act(async () => {
      await deferred.promise;
      await Promise.resolve();
    });
  });
});
