// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { MeuForm } from "./MeuForm";
import { useMeuForm } from "./useMeuForm";

function HydrationExample() {
  const form = useMeuForm<{ name: string }>({ defaultValues: { name: "Meu" } });
  return (
    <MeuForm aria-label="SSR form" form={form} onSubmit={() => undefined}>
      <label>
        Name
        <input defaultValue="Meu" {...form.register("name")} />
      </label>
      <button type="submit">Save</button>
    </MeuForm>
  );
}

describe("MeuForm SSR", () => {
  it("hydrates a deterministic native form boundary without mismatch", () => {
    const markup = renderToString(<HydrationExample />);
    expect(markup).toContain("<form");
    expect(markup).toContain('noValidate=""');
    expect(markup).toContain('value="Meu"');

    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.append(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    act(() => {
      root = hydrateRoot(container, <HydrationExample />);
    });

    expect(consoleError).not.toHaveBeenCalled();
    const formElement = container.querySelector("form");
    expect(formElement ? formElement.getAttribute("data-meu-component") : null).toBe("form");
    act(() => {
      if (root) root.unmount();
    });
    container.remove();
    consoleError.mockRestore();
  });
});
