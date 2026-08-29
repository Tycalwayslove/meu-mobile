// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { ApiReference } from "./ApiReference";

afterEach(() => {
  document.body.replaceChildren();
});

describe("ApiReference", () => {
  it("keeps large API surfaces collapsed and filters by export metadata", () => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);

    act(() => {
      root.render(
        <ApiReference
          packageName="@meu/form-react"
          entries={[
            { kind: "value", name: "MeuForm", signature: "export function MeuForm(): void;" },
            { kind: "value", name: "useMeuForm", signature: "export function useMeuForm(): void;" },
            { kind: "type", name: "MeuFormProps", signature: "export type MeuFormProps = {};" },
            {
              description: "Adapter for a native text input.",
              kind: "value",
              name: "MeuFormTextInput",
              signature: "export function MeuFormTextInput(): void;"
            }
          ]}
        />
      );
    });

    expect(host.querySelectorAll("details[open]")).toHaveLength(3);
    const input = host.querySelector<HTMLInputElement>('input[type="search"]');
    expect(input).not.toBeNull();
    act(() => {
      const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      if (!input || !valueDescriptor || !valueDescriptor.set) {
        throw new Error("Expected a native search input value setter");
      }
      valueDescriptor.set.call(input, "native text");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(host.querySelectorAll("details")).toHaveLength(1);
    expect(host.textContent).toContain("MeuFormTextInput");
    expect(host.textContent).toContain("显示 1 / 4 项");

    act(() => root.unmount());
  });
});
