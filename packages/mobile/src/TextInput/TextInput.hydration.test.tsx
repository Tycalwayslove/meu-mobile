// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../Field";
import { TextInput } from "./TextInput";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];
const containers: HTMLElement[] = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  for (const container of containers.splice(0)) container.remove();
  vi.restoreAllMocks();
});

describe("TextInput hydration", () => {
  it("hydrates a clearable server value without mismatch and keeps focus", async () => {
    const onChange = vi.fn();
    const element = createElement(TextInput, {
      "aria-label": "Hydrated name",
      clearable: true,
      defaultValue: "Meu",
      name: "name",
      onChange
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const serverInput = container.querySelector<HTMLInputElement>("input");
    expect(serverInput && serverInput.value).toBe("Meu");
    expect(container.querySelector("button")).not.toBeNull();
    await act(async () => {
      mountedRoots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });

    const clear = container.querySelector<HTMLButtonElement>("button");
    fireEvent.click(clear!);
    await act(() => Promise.resolve());
    const input = container.querySelector<HTMLInputElement>("input");

    expect(input && input.value).toBe("");
    expect(document.activeElement).toBe(input);
    expect(onChange).toHaveBeenCalledOnce();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("hydrates nested Field label and required associations without duplicate ids", async () => {
    const element = (
      <Field id="hydrated-contact" label="Contact" description="Delivery contact" required>
        <div>
          <TextInput name="contact" />
        </div>
      </Field>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await act(async () => {
      mountedRoots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });

    const input = container.querySelector<HTMLInputElement>("input");
    expect(input && input.required).toBe(true);
    expect(input && input.getAttribute("aria-labelledby")).toBe("hydrated-contact-control-label");
    expect(container.querySelectorAll("#hydrated-contact-control")).toHaveLength(1);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
