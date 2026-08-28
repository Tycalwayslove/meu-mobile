// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToastProvider, useToast } from "./ToastProvider";
import type { ToastController } from "./types";

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
    expect(onClose).toHaveBeenCalledWith({ reason: "programmatic" });
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
});
