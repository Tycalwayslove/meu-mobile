// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { Toast } from "./Toast";
import type { ToastOpenChangeDetails } from "./types";

afterEach(() => {
  vi.useRealTimers();
});

function ControlledToast({
  action,
  duration = 3000,
  onChange
}: {
  action?: { label: string; onPress?: () => boolean | void | Promise<boolean | void> };
  duration?: number;
  onChange?: (details: ToastOpenChangeDetails) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Toast
      {...(action ? { action } : {})}
      duration={duration}
      message="订单已更新"
      open={open}
      onOpenChange={(nextOpen, details) => {
        setOpen(nextOpen);
        if (onChange) onChange(details);
      }}
    />
  );
}

describe("Toast", () => {
  it("announces non-urgent messages without stealing focus", () => {
    const { rerender } = render(<button type="button">继续操作</button>);
    const trigger = screen.getByRole("button", { name: "继续操作" });
    trigger.focus();

    rerender(
      <>
        <button type="button">继续操作</button>
        <Toast open duration={0} message="订单已保存" tone="success" />
      </>
    );

    const status = screen.getByRole("status");
    expect(status.textContent).toBe("订单已保存");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "继续操作" }));
    const toast = status.closest("[data-meu-component='toast']");
    expect(toast && toast.getAttribute("data-tone")).toBe("success");
  });

  it("carries locale and theme tokens through the body portal", () => {
    render(
      <ConfigProvider locale="en-US" theme="dark">
        <Toast open duration={0} message="Saved" />
      </ConfigProvider>
    );
    const viewport = document.querySelector('[data-meu-overlay-layer="toast"]');
    if (!(viewport instanceof HTMLElement)) throw new Error("Expected Toast viewport");
    expect(viewport.getAttribute("data-meu-theme")).toBe("dark");
    expect(viewport.getAttribute("lang")).toBe("en-US");
  });

  it("keeps the action outside the assertive live region", () => {
    render(<Toast open duration={0} message="支付失败" tone="danger" action={{ label: "重试" }} />);
    const alert = screen.getByRole("alert");
    const action = screen.getByRole("button", { name: "重试" });
    expect(alert.getAttribute("aria-live")).toBe("assertive");
    expect(alert.contains(action)).toBe(false);
  });

  it("closes after the default timeout", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<ControlledToast onChange={onChange} />);

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(screen.getByRole("status")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onChange).toHaveBeenCalledWith({ reason: "timeout" });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("keeps actionable messages for at least five seconds", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<ControlledToast action={{ label: "撤销" }} duration={1000} onChange={onChange} />);

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onChange).toHaveBeenCalledWith({ reason: "timeout" });
  });

  it("pauses and resumes the timeout while hovered", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<ControlledToast duration={3000} onChange={onChange} />);
    const toast = screen.getByRole("status").closest("[data-meu-component='toast']");
    if (!(toast instanceof HTMLElement)) throw new Error("Expected Toast root");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.mouseEnter(toast);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.mouseLeave(toast);
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onChange).toHaveBeenCalledWith({ reason: "timeout" });
  });

  it("pauses the actionable timeout while keyboard focus stays inside", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(
      <>
        <button type="button">页面操作</button>
        <ControlledToast action={{ label: "撤销" }} duration={1000} onChange={onChange} />
      </>
    );
    const action = screen.getByRole("button", { name: "撤销" });
    const outside = screen.getByRole("button", { name: "页面操作" });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.focus(action);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(action, { relatedTarget: outside });
    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onChange).toHaveBeenCalledWith({ reason: "timeout" });
  });

  it("keeps the toast open when an action returns false", async () => {
    const action = vi.fn(() => false);
    const onChange = vi.fn();
    render(
      <ControlledToast
        action={{ label: "撤销", onPress: action }}
        duration={0}
        onChange={onChange}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "撤销" }));
      await Promise.resolve();
    });
    expect(action).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("reports handled action failures and stays open", async () => {
    const error = new Error("network unavailable");
    const onActionError = vi.fn();
    render(
      <Toast
        open
        duration={0}
        message="保存失败"
        onActionError={onActionError}
        action={{ label: "重试", onPress: () => Promise.reject(error) }}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "重试" }));
      await Promise.resolve();
    });
    expect(onActionError).toHaveBeenCalledWith(error);
    expect(screen.getByRole("status")).toBeTruthy();
  });
});
