// @vitest-environment jsdom
import { act } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Portal } from "./Portal";

const roots: Array<{ unmount: () => void }> = [];

afterEach(() => {
  while (roots.length > 0) {
    const root = roots.pop();
    if (root) {
      act(() => root.unmount());
    }
  }
  document.body.replaceChildren();
});

describe("Portal", () => {
  it("renders useful inline markup during SSR", () => {
    expect(
      renderToString(
        <Portal>
          <span data-testid="content">Server content</span>
        </Portal>
      )
    ).toContain("Server content");
  });

  it("hydrates inline markup before moving it to document.body", () => {
    const host = document.createElement("div");
    host.innerHTML = renderToString(
      <Portal>
        <span data-portal-content>Hydrated content</span>
      </Portal>
    );
    document.body.append(host);

    let root: ReturnType<typeof hydrateRoot>;
    act(() => {
      root = hydrateRoot(
        host,
        <Portal>
          <span data-portal-content>Hydrated content</span>
        </Portal>
      );
    });
    roots.push(root!);

    expect(host.querySelector("[data-portal-content]")).toBeNull();
    const hydratedContent = document.body.querySelector("[data-portal-content]");
    expect(hydratedContent && hydratedContent.textContent).toBe("Hydrated content");
  });

  it("supports lazy, fragment and inline destinations and cleans up on unmount", () => {
    const host = document.createElement("div");
    const target = document.createElement("section");
    const fragment = document.createDocumentFragment();
    document.body.append(host, target);
    const root = createRoot(host);
    roots.push(root);

    act(() => {
      root.render(
        <Portal container={() => target}>
          <span data-portal-content>Custom target</span>
        </Portal>
      );
    });
    const customTargetContent = target.querySelector("[data-portal-content]");
    expect(customTargetContent && customTargetContent.textContent).toBe("Custom target");

    act(() => {
      root.render(
        <Portal container={fragment}>
          <span data-portal-content>Fragment target</span>
        </Portal>
      );
    });
    expect(target.querySelector("[data-portal-content]")).toBeNull();
    const fragmentContent = fragment.querySelector("[data-portal-content]");
    expect(fragmentContent && fragmentContent.textContent).toBe("Fragment target");

    act(() => {
      root.render(
        <Portal container={null}>
          <span data-portal-content>Inline target</span>
        </Portal>
      );
    });
    expect(fragment.querySelector("[data-portal-content]")).toBeNull();
    const inlineContent = host.querySelector("[data-portal-content]");
    expect(inlineContent && inlineContent.textContent).toBe("Inline target");

    act(() => root.unmount());
    roots.pop();
    expect(host.querySelector("[data-portal-content]")).toBeNull();
  });
});
