// @vitest-environment jsdom
import { useEffect, useRef, useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

type Deferred = {
  promise: Promise<void>;
  reject: (reason?: unknown) => void;
  resolve: () => void;
};

function createDeferred(): Deferred {
  let reject: Deferred["reject"] = () => undefined;
  let resolve: Deferred["resolve"] = () => undefined;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    reject = rejectPromise;
    resolve = resolvePromise;
  });
  return { promise, reject, resolve };
}

function LifecycleHarness({ save }: { save: (signal: AbortSignal) => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("idle");
  const requestRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      if (requestRef.current) requestRef.current.abort();
    },
    []
  );

  async function submit() {
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setResult("saving");
    try {
      await save(controller.signal);
      if (!controller.signal.aborted) setResult("saved");
    } catch {
      if (!controller.signal.aborted) setResult("failed");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <>
      <Button
        leadingIcon={<span>前</span>}
        loading={loading}
        onClick={() => void submit()}
        trailingIcon={<span>后</span>}
      >
        保存设置
      </Button>
      <output>{result}</output>
    </>
  );
}

describe("Button commercial lifecycle", () => {
  it("keeps the complete authored content in layout while loading", () => {
    const { rerender } = render(
      <Button leadingIcon={<span>前</span>} trailingIcon={<span>后</span>}>
        保存设置
      </Button>
    );
    const content = screen.getByRole("button").querySelector('[data-meu-slot="content"]');
    expect(content && content.textContent).toBe("前保存设置后");
    const idleButton = screen.queryByRole("button");
    expect(idleButton && idleButton.querySelector('[data-meu-slot="spinner"]')).toBeNull();

    rerender(
      <Button leadingIcon={<span>前</span>} loading trailingIcon={<span>后</span>}>
        保存设置
      </Button>
    );

    const loadingButton = screen.getByRole("button", { name: "保存设置" });
    expect(loadingButton.querySelector('[data-meu-slot="content"]')).toBe(content);
    expect(content && content.textContent).toBe("前保存设置后");
    expect(content && content.getAttribute("data-loading")).toBe("true");
    expect(loadingButton.querySelector('[data-meu-slot="spinner"]')).not.toBeNull();
  });

  it("suppresses repeat activation, recovers after failure, and can be retried", async () => {
    const first = createDeferred();
    const second = createDeferred();
    const save = vi
      .fn<(signal: AbortSignal) => Promise<void>>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    render(<LifecycleHarness save={save} />);
    const button = screen.getByRole("button", { name: "保存设置" });

    fireEvent.click(button);
    expect(button).toHaveProperty("disabled", true);
    fireEvent.click(button);
    expect(save).toHaveBeenCalledTimes(1);

    act(() => {
      first.reject(new Error("network"));
    });
    await waitFor(() => expect(button).toHaveProperty("disabled", false));
    expect(screen.getByText("failed")).toBeTruthy();

    fireEvent.click(button);
    expect(save).toHaveBeenCalledTimes(2);
    act(() => {
      second.resolve();
    });
    await waitFor(() => expect(screen.getByText("saved")).toBeTruthy());
    expect(button).toHaveProperty("disabled", false);
  });

  it("aborts caller-owned work when the lifecycle owner unmounts", () => {
    const deferred = createDeferred();
    let capturedSignal: AbortSignal | undefined;
    const save = vi.fn((signal: AbortSignal) => {
      capturedSignal = signal;
      return deferred.promise;
    });
    const { unmount } = render(<LifecycleHarness save={save} />);

    fireEvent.click(screen.getByRole("button", { name: "保存设置" }));
    unmount();
    expect(capturedSignal && capturedSignal.aborted).toBe(true);
    deferred.resolve();
    expect(save).toHaveBeenCalledOnce();
  });
});
