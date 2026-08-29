// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToastProvider, useToast } from "./ToastProvider";
import type { ToastApi, ToastController } from "./types";

afterEach(() => {
  vi.useRealTimers();
});

function QueueConsumer() {
  const toast = useToast();
  const firstRef = useRef<ToastController | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          firstRef.current = toast.show({ duration: 0, message: "第一条消息" });
          toast.success({ duration: 0, message: "第二条消息" });
        }}
      >
        加入队列
      </button>
      <button
        type="button"
        onClick={() => {
          if (firstRef.current) firstRef.current.close();
        }}
      >
        关闭首条
      </button>
      <button type="button" onClick={toast.clear}>
        清空
      </button>
    </>
  );
}

function UpdateConsumer({ onClose }: { onClose: (details: unknown) => void }) {
  const toast = useToast();
  const controllerRef = useRef<ToastController | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          controllerRef.current = toast.show({
            duration: 0,
            id: "sync",
            message: "正在同步",
            onClose
          });
        }}
      >
        显示同步
      </button>
      <button
        type="button"
        onClick={() => {
          if (controllerRef.current) {
            controllerRef.current.update({ message: "同步完成", tone: "success" });
          }
        }}
      >
        更新同步
      </button>
      <button
        type="button"
        onClick={() =>
          toast.show({ duration: 0, id: "sync", message: "同步结果已刷新", tone: "warning" })
        }
      >
        同 ID 更新
      </button>
      <button
        type="button"
        onClick={() => {
          if (controllerRef.current) controllerRef.current.close();
        }}
      >
        关闭同步
      </button>
    </>
  );
}

describe("ToastProvider", () => {
  it("shows a single FIFO message and advances after exit", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <QueueConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "加入队列" }));
    expect(screen.getByRole("status").textContent).toBe("第一条消息");
    expect(screen.queryByText("第二条消息")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "关闭首条" }));
    expect(screen.queryByRole("status")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(160);
    });
    expect(screen.getByRole("status").textContent).toBe("第二条消息");
  });

  it("updates by controller or stable id instead of enqueueing duplicates", () => {
    const onClose = vi.fn();
    render(
      <ToastProvider>
        <UpdateConsumer onClose={onClose} />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "显示同步" }));
    fireEvent.click(screen.getByRole("button", { name: "更新同步" }));
    expect(screen.getByRole("status").textContent).toBe("同步完成");
    expect(screen.getByRole("status").closest("[data-tone='success']")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "同 ID 更新" }));
    expect(screen.getByRole("alert").textContent).toBe("同步结果已刷新");
    expect(screen.getAllByText("同步结果已刷新")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "关闭同步" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("restarts the active duration when the same id is shown again", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    function RefreshConsumer() {
      const toast = useToast();
      return (
        <>
          <button
            type="button"
            onClick={() => toast.show({ duration: 1000, id: "sync", message: "正在同步", onClose })}
          >
            显示同步
          </button>
          <button
            type="button"
            onClick={() =>
              toast.show({
                duration: 1000,
                id: "sync",
                message: "同步仍在进行",
                onClose
              })
            }
          >
            刷新同步
          </button>
        </>
      );
    }

    render(
      <ToastProvider>
        <RefreshConsumer />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "显示同步" }));
    act(() => {
      vi.advanceTimersByTime(999);
    });
    fireEvent.click(screen.getByRole("button", { name: "刷新同步" }));
    expect(screen.getByRole("status").textContent).toBe("同步仍在进行");
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledWith({ reason: "timeout" });
  });

  it("invalidates the pending action when the active record is replaced", async () => {
    let rejectAction!: (error: Error) => void;
    const onActionError = vi.fn();

    function ReplacePendingConsumer() {
      const toast = useToast();
      return (
        <>
          <button
            type="button"
            onClick={() =>
              toast.show({
                action: {
                  label: "重试",
                  onPress: () =>
                    new Promise<void>((_resolve, reject) => {
                      rejectAction = reject;
                    })
                },
                duration: 0,
                id: "sync",
                message: "同步失败",
                onActionError
              })
            }
          >
            显示失败
          </button>
          <button
            type="button"
            onClick={() => toast.success({ duration: 0, id: "sync", message: "后台同步已恢复" })}
          >
            替换结果
          </button>
        </>
      );
    }

    render(
      <ToastProvider>
        <ReplacePendingConsumer />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "显示失败" }));
    fireEvent.click(screen.getByRole("button", { name: "重试" }));
    expect(screen.getByRole("button", { name: "重试" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "替换结果" }));
    expect(screen.getByRole("status").textContent).toBe("后台同步已恢复");
    expect(screen.queryByRole("button", { name: "重试" })).toBeNull();

    await act(async () => {
      rejectAction(new Error("obsolete"));
      await Promise.resolve();
    });
    expect(onActionError).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toBe("后台同步已恢复");
  });

  it("lets controller updates explicitly clear optional actions and handlers", () => {
    const onActionError = vi.fn();
    const onClose = vi.fn();

    function ClearOptionsConsumer() {
      const toast = useToast();
      const controllerRef = useRef<ToastController | null>(null);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              controllerRef.current = toast.show({
                action: { label: "撤销" },
                duration: 0,
                message: "已删除",
                onActionError,
                onClose
              });
            }}
          >
            显示可撤销消息
          </button>
          <button
            type="button"
            onClick={() => {
              if (controllerRef.current) {
                controllerRef.current.update({
                  action: undefined,
                  message: "删除已确认",
                  onActionError: undefined,
                  onClose: undefined
                });
              }
            }}
          >
            清除可选配置
          </button>
          <button
            type="button"
            onClick={() => {
              if (controllerRef.current) controllerRef.current.close();
            }}
          >
            关闭消息
          </button>
        </>
      );
    }

    render(
      <ToastProvider>
        <ClearOptionsConsumer />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "显示可撤销消息" }));
    expect(screen.getByRole("button", { name: "撤销" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "清除可选配置" }));
    expect(screen.queryByRole("button", { name: "撤销" })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("删除已确认");
    fireEvent.click(screen.getByRole("button", { name: "关闭消息" }));
    expect(onClose).not.toHaveBeenCalled();
    expect(onActionError).not.toHaveBeenCalled();
  });

  it("bounds unique records while allowing same-id replacement at capacity", () => {
    const onOverflow = vi.fn();

    function LimitedConsumer() {
      const toast = useToast();
      return (
        <>
          <button
            type="button"
            onClick={() => toast.show({ duration: 0, id: "active", message: "处理中" })}
          >
            显示首条
          </button>
          <button
            type="button"
            onClick={() => toast.show({ duration: 0, message: "超过上限", onClose: onOverflow })}
          >
            显示溢出
          </button>
          <button
            type="button"
            onClick={() => toast.show({ duration: 0, id: "active", message: "处理完成" })}
          >
            替换首条
          </button>
        </>
      );
    }

    render(
      <ToastProvider maxToasts={1}>
        <LimitedConsumer />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "显示首条" }));
    fireEvent.click(screen.getByRole("button", { name: "显示溢出" }));
    expect(onOverflow).toHaveBeenCalledWith({ reason: "overflow" });
    expect(screen.queryByText("超过上限")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "替换首条" }));
    expect(screen.getByRole("status").textContent).toBe("处理完成");
    expect(onOverflow).toHaveBeenCalledTimes(1);
  });

  it("removes exiting records and evicts newest queued records when maxToasts decreases", () => {
    vi.useFakeTimers();
    const onSecondClose = vi.fn();
    const onThirdClose = vi.fn();
    let firstController: ToastController | undefined;
    let thirdController: ToastController | undefined;

    function ShrinkConsumer() {
      const toast = useToast();
      return (
        <button
          type="button"
          onClick={() => {
            firstController = toast.show({ duration: 0, message: "第一条" });
            toast.show({ duration: 0, message: "第二条", onClose: onSecondClose });
            thirdController = toast.show({
              duration: 0,
              message: "第三条",
              onClose: onThirdClose
            });
          }}
        >
          显示三条
        </button>
      );
    }

    const { rerender } = render(
      <ToastProvider maxToasts={3}>
        <ShrinkConsumer />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "显示三条" }));
    expect(screen.getByRole("status").textContent).toBe("第一条");
    act(() => {
      if (thirdController) thirdController.close();
    });
    expect(onThirdClose).toHaveBeenCalledWith({ reason: "programmatic" });

    rerender(
      <ToastProvider maxToasts={1}>
        <ShrinkConsumer />
      </ToastProvider>
    );
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(onSecondClose).toHaveBeenCalledWith({ reason: "overflow" });
    expect(onThirdClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toBe("第一条");

    act(() => {
      vi.advanceTimersByTime(160);
    });
    act(() => {
      if (firstController) firstController.close();
    });
    act(() => {
      vi.advanceTimersByTime(160);
    });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("clears provider-owned messages with an explicit close reason", () => {
    const onFirstClose = vi.fn();
    const onSecondClose = vi.fn();

    function ClearConsumer() {
      const toast = useToast();
      return (
        <>
          <button
            type="button"
            onClick={() => {
              toast.show({ duration: 0, message: "A", onClose: onFirstClose });
              toast.show({ duration: 0, message: "B", onClose: onSecondClose });
            }}
          >
            显示两条
          </button>
          <button type="button" onClick={toast.clear}>
            全部关闭
          </button>
        </>
      );
    }

    render(
      <ToastProvider>
        <ClearConsumer />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "显示两条" }));
    fireEvent.click(screen.getByRole("button", { name: "全部关闭" }));
    expect(onFirstClose).toHaveBeenCalledWith({ reason: "clear" });
    expect(onSecondClose).toHaveBeenCalledWith({ reason: "clear" });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("requires a provider", () => {
    function Consumer() {
      useToast();
      return null;
    }
    expect(() => render(<Consumer />)).toThrow("useToast must be used within a ToastProvider");
  });

  it("invalidates retained APIs before unmount close callbacks run", () => {
    vi.useFakeTimers();
    let retainedApi: ToastApi | undefined;
    const reentrantClose = vi.fn(() => {
      if (retainedApi) retainedApi.show({ duration: 0, message: "不应重建" });
    });

    function RetainedConsumer() {
      const toast = useToast();
      useEffect(() => {
        retainedApi = toast;
      }, [toast]);
      return (
        <button
          type="button"
          onClick={() => toast.show({ duration: 0, message: "即将卸载", onClose: reentrantClose })}
        >
          显示消息
        </button>
      );
    }

    const { unmount } = render(
      <ToastProvider>
        <RetainedConsumer />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "显示消息" }));
    unmount();

    expect(reentrantClose).toHaveBeenCalledWith({ reason: "programmatic" });
    expect(vi.getTimerCount()).toBe(0);
  });
});
