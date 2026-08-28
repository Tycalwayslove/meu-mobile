// @vitest-environment jsdom
import { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useBodyScrollLock } from "./useBodyScrollLock";
import { useFocusTrap } from "./useFocusTrap";

const roots: Array<ReturnType<typeof createRoot>> = [];

afterEach(() => {
  while (roots.length > 0) {
    const root = roots.pop();
    if (root) act(() => root.unmount());
  }
  document.body.replaceChildren();
  document.body.removeAttribute("style");
  document.documentElement.removeAttribute("style");
  vi.restoreAllMocks();
});

function render(element: React.ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  act(() => root.render(element));
  return { host, root };
}

function ScrollLock({ locked }: { locked: boolean }) {
  useBodyScrollLock(locked);
  return null;
}

async function flushFocusTrap() {
  await act(async () => {
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  });
}

function FocusTrapHarness({
  active = true,
  label,
  onEscape,
  restoreFocus = true
}: {
  active?: boolean;
  label: string;
  onEscape?: () => void;
  restoreFocus?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenFocusRef = useRef<HTMLButtonElement>(null);
  useFocusTrap({
    active,
    containerRef,
    initialFocusRef: hiddenFocusRef,
    onEscape,
    restoreFocus
  });
  return (
    <div ref={containerRef} aria-label={label} role="dialog" tabIndex={-1}>
      <div hidden>
        <button ref={hiddenFocusRef} type="button">
          Hidden {label}
        </button>
      </div>
      <button type="button">First {label}</button>
      <button type="button">Last {label}</button>
    </div>
  );
}

describe("overlay hooks", () => {
  it("reference-counts body locks and compensates the RTL scrollbar edge", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1000 });
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      value: 980
    });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 120 });
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    document.body.dir = "rtl";
    document.body.style.paddingLeft = "4px";
    document.body.style.paddingRight = "7px";
    document.body.style.position = "relative";

    const { root } = render(
      <>
        <ScrollLock locked />
        <ScrollLock locked />
      </>
    );
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");
    expect(document.body.style.paddingLeft).toBe("24px");
    expect(document.body.style.paddingRight).toBe("7px");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-120px");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });

    act(() =>
      root.render(
        <>
          <ScrollLock locked={false} />
          <ScrollLock locked />
        </>
      )
    );
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");

    act(() => root.unmount());
    roots.pop();
    expect(document.body.hasAttribute("data-meu-scroll-locked")).toBe(false);
    expect(document.body.style.paddingLeft).toBe("4px");
    expect(document.body.style.paddingRight).toBe("7px");
    expect(document.body.style.position).toBe("relative");
    expect(scrollTo).toHaveBeenCalledWith(0, 120);
  });

  it("filters hidden initial targets, loops Tab and restores focus", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.append(trigger);
    trigger.focus();
    const { root } = render(<FocusTrapHarness label="Outer" />);
    await flushFocusTrap();
    const hidden = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Hidden Outer"
    );
    const visibleButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>("[role='dialog'] > button")
    );
    expect(visibleButtons).toHaveLength(2);
    expect(document.activeElement).toBe(visibleButtons[0]);

    visibleButtons[1]!.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Tab" }));
    expect(document.activeElement).toBe(visibleButtons[0]);
    expect(document.activeElement).not.toBe(hidden);

    act(() => root.unmount());
    roots.pop();
    expect(document.activeElement).toBe(trigger);
  });

  it("only lets the topmost nested trap handle Escape", async () => {
    const outerEscape = vi.fn();
    const innerEscape = vi.fn();
    const outer = render(<FocusTrapHarness label="Outer" onEscape={outerEscape} />);
    await flushFocusTrap();
    const inner = render(<FocusTrapHarness label="Inner" onEscape={innerEscape} />);
    await flushFocusTrap();

    document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
    expect(innerEscape).toHaveBeenCalledTimes(1);
    expect(outerEscape).not.toHaveBeenCalled();

    act(() => inner.root.unmount());
    roots.pop();
    document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
    expect(outerEscape).toHaveBeenCalledTimes(1);
    expect(outer.host.isConnected).toBe(true);
  });
});
