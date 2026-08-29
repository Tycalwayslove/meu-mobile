// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { SafeArea } from "./SafeArea";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("SafeArea SSR", () => {
  it("renders deterministic physical-edge and fallback markup", () => {
    const markup = renderToString(<SafeArea position="left" fallback={16} />);
    expect(markup).toContain('data-meu-component="safe-area"');
    expect(markup).toContain('data-position="left"');
    expect(markup).toContain("--meu-safe-area-fallback:16px");
    expect(markup).toContain('aria-hidden="true"');
  });

  it("hydrates the spacer without replacing its root", async () => {
    const element = <SafeArea position="right" fallback="var(--shell-safe-area, 0px)" />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const rootBeforeHydration = container.firstElementChild;
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
    expect(container.firstElementChild).toBe(rootBeforeHydration);
    expect(rootBeforeHydration && rootBeforeHydration.getAttribute("data-position")).toBe("right");
  });
});
