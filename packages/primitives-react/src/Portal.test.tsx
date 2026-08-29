// @vitest-environment jsdom
import { act, createContext, useCallback, useContext, useRef } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

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
    const getContainer = vi.fn(() => {
      throw new Error("The lazy container must not resolve during SSR");
    });
    expect(
      renderToString(
        <Portal container={getContainer}>
          <span data-testid="content">Server content</span>
        </Portal>
      )
    ).toContain("Server content");
    expect(getContainer).not.toHaveBeenCalled();
  });

  it("hydrates inline markup without recoverable errors before moving it to document.body", () => {
    const host = document.createElement("div");
    host.innerHTML = renderToString(
      <Portal>
        <span data-portal-content>Hydrated content</span>
      </Portal>
    );
    document.body.append(host);

    const recoverableErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot>;
    act(() => {
      root = hydrateRoot(
        host,
        <Portal>
          <span data-portal-content>Hydrated content</span>
        </Portal>,
        { onRecoverableError: (error) => recoverableErrors.push(error) }
      );
    });
    roots.push(root!);

    expect(host.querySelector("[data-portal-content]")).toBeNull();
    const hydratedContent = document.body.querySelector("[data-portal-content]");
    expect(hydratedContent && hydratedContent.textContent).toBe("Hydrated content");
    expect(recoverableErrors).toEqual([]);
  });

  it("retries a ref-backed lazy destination after client refs commit", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    roots.push(root);

    function RefBackedPortal() {
      const targetRef = useRef<HTMLDivElement>(null);
      const getTarget = useCallback(() => targetRef.current, []);

      return (
        <>
          <div ref={targetRef} data-lazy-target />
          <Portal container={getTarget}>
            <span data-lazy-content>Lazy content</span>
          </Portal>
        </>
      );
    }

    act(() => root.render(<RefBackedPortal />));

    const target = host.querySelector("[data-lazy-target]");
    const content = host.querySelector("[data-lazy-content]");
    expect(target).not.toBeNull();
    expect(content && content.parentElement).toBe(target);
  });

  it("preserves React context and synthetic events in another document", () => {
    const foreignDocument = document.implementation.createHTMLDocument("Portal destination");
    const target = foreignDocument.createElement("div");
    foreignDocument.body.append(target);
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    roots.push(root);
    const PortalContext = createContext("default");
    const onParentClick = vi.fn();

    function ContextValue() {
      return <span data-context-value>{useContext(PortalContext)}</span>;
    }

    act(() => {
      root.render(
        <PortalContext.Provider value="preserved">
          <button type="button" aria-label="Logical event boundary" onClick={onParentClick}>
            <Portal container={target}>
              <span data-foreign-action>
                <ContextValue />
              </span>
            </Portal>
          </button>
        </PortalContext.Provider>
      );
    });

    const action = target.querySelector<HTMLElement>("[data-foreign-action]");
    if (!action) throw new Error("Expected cross-document Portal content");
    expect(action.ownerDocument).toBe(foreignDocument);
    expect(action.textContent).toBe("preserved");
    act(() => action.click());
    expect(onParentClick).toHaveBeenCalledTimes(1);

    act(() => root.unmount());
    roots.pop();
    expect(target.childNodes).toHaveLength(0);
    expect(target.parentNode).toBe(foreignDocument.body);
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
