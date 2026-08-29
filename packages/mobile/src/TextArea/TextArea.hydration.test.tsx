// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TextArea } from "./TextArea";

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

describe("TextArea hydration", () => {
  it("hydrates autosize/count markup and keeps IME edits interactive", async () => {
    const onChange = vi.fn();
    const element = createElement(TextArea, {
      "aria-label": "Hydrated note",
      autoSize: { minRows: 2, maxRows: 5 },
      defaultValue: "Meu",
      maxLength: 40,
      onChange,
      showCount: true
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    containers.push(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const serverTextArea = container.querySelector("textarea");
    const serverCount = container.querySelector('[data-meu-slot="count"]');
    expect(serverTextArea && serverTextArea.value).toBe("Meu");
    expect(serverCount && serverCount.textContent).toBe("3 / 40");

    await act(async () => {
      mountedRoots.push(hydrateRoot(container, element));
      await Promise.resolve();
    });

    const textArea = container.querySelector("textarea");
    expect(textArea).not.toBeNull();
    fireEvent.compositionStart(textArea!, { data: "猫" });
    fireEvent.change(textArea!, { target: { value: "猫🐱" } });
    fireEvent.compositionEnd(textArea!, { data: "🐱" });
    await act(() => Promise.resolve());

    const hydratedCount = container.querySelector('[data-meu-slot="count"]');
    expect(textArea && textArea.value).toBe("猫🐱");
    expect(hydratedCount && hydratedCount.textContent).toBe("3 / 40");
    expect(onChange).toHaveBeenCalledOnce();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
