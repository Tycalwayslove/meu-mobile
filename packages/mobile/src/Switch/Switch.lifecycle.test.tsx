// @vitest-environment jsdom
import { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./Switch";

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

function OptimisticSwitch({ save }: { save: (checked: boolean) => Promise<void> }) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("idle");

  async function change(nextChecked: boolean) {
    const previousChecked = checked;
    setChecked(nextChecked);
    setLoading(true);
    setResult("saving");
    try {
      await save(nextChecked);
      setResult("saved");
    } catch {
      setChecked(previousChecked);
      setResult("failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Switch
        aria-label="自动续费"
        checked={checked}
        loading={loading}
        onChange={(nextChecked) => void change(nextChecked)}
      />
      <output>{result}</output>
    </>
  );
}

describe("Switch commercial lifecycle", () => {
  it("blocks rapid repeat changes while loading, rolls back a failure, and retries", async () => {
    const first = createDeferred();
    const second = createDeferred();
    const save = vi
      .fn<(checked: boolean) => Promise<void>>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    render(<OptimisticSwitch save={save} />);
    const control = screen.getByRole("switch", { name: "自动续费" });

    fireEvent.click(control);
    expect(control).toHaveProperty("checked", true);
    expect(control.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(control);
    expect(save).toHaveBeenCalledTimes(1);

    act(() => {
      first.reject(new Error("network"));
    });
    await waitFor(() => expect(control).toHaveProperty("checked", false));
    expect(control.getAttribute("aria-busy")).toBe("false");
    expect(screen.getByText("failed")).toBeTruthy();

    fireEvent.click(control);
    expect(save).toHaveBeenCalledTimes(2);
    act(() => {
      second.resolve();
    });
    await waitFor(() => expect(screen.getByText("saved")).toBeTruthy());
    expect(control).toHaveProperty("checked", true);
  });

  it("lets a controlled owner reject a requested value without a visual commit", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="策略锁定" checked={false} onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "策略锁定" });

    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(control).toHaveProperty("checked", false);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });
});
