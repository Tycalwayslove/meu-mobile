// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Switch } from "./Switch";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

function Harness() {
  const [checked, setChecked] = useState(true);
  return <Switch aria-label="消息通知" checked={checked} onChange={setChecked} />;
}

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("Switch hydration", () => {
  it("preserves the native input and toggles without recovery", async () => {
    const element = <Harness />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const switchBeforeHydration = container.querySelector<HTMLInputElement>('[role="switch"]');
    if (!switchBeforeHydration) throw new Error("Expected server-rendered switch");
    const recoverableErrors: unknown[] = [];

    await act(async () => {
      mountedRoots.push(
        hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        })
      );
      await Promise.resolve();
    });

    expect(recoverableErrors).toEqual([]);
    expect(container.querySelector('[role="switch"]')).toBe(switchBeforeHydration);
    fireEvent.click(switchBeforeHydration);
    expect(switchBeforeHydration.checked).toBe(false);
    expect(switchBeforeHydration.getAttribute("aria-checked")).toBe("false");
  });
});
