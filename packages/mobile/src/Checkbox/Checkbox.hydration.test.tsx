// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Checkbox } from "./Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

function Harness() {
  const [value, setValue] = useState<Array<string>>(["delivery"]);
  return (
    <CheckboxGroup name="service" value={value} onChange={setValue}>
      <Checkbox value="delivery">配送</Checkbox>
      <Checkbox value="pickup">自提</Checkbox>
    </CheckboxGroup>
  );
}

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("Checkbox hydration", () => {
  it("preserves native controls and updates a controlled group without recovery", async () => {
    const element = <Harness />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const deliveryBeforeHydration =
      container.querySelector<HTMLInputElement>('input[value="delivery"]');
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
    expect(container.querySelector('input[value="delivery"]')).toBe(deliveryBeforeHydration);
    const pickup = container.querySelector<HTMLInputElement>('input[value="pickup"]')!;
    fireEvent.click(pickup);
    expect(pickup.checked).toBe(true);
  });
});
