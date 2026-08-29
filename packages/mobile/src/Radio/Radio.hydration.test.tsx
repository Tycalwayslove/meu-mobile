// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

function Harness() {
  const [value, setValue] = useState<string>("standard");
  return (
    <RadioGroup value={value} onChange={setValue}>
      <Radio value="standard">标准配送</Radio>
      <Radio value="express">急速配送</Radio>
    </RadioGroup>
  );
}

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("Radio hydration", () => {
  it("keeps useId naming stable and selects after hydration without recovery", async () => {
    const element = <Harness />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const standardBeforeHydration =
      container.querySelector<HTMLInputElement>('input[value="standard"]');
    if (!standardBeforeHydration) throw new Error("Expected server-rendered standard radio");
    const serverName = standardBeforeHydration.name;
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
    expect(container.querySelector('input[value="standard"]')).toBe(standardBeforeHydration);
    expect(standardBeforeHydration.name).toBe(serverName);
    const express = container.querySelector<HTMLInputElement>('input[value="express"]')!;
    fireEvent.click(express);
    expect(express.checked).toBe(true);
  });
});
