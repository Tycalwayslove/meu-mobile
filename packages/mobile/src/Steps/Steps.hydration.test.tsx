// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Steps } from "./Steps";

const items = [
  { key: "account", title: "账户" },
  { key: "profile", title: "资料" },
  { key: "confirm", title: "确认", disabled: true }
] as const;

describe("Steps hydration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it.each(["read-only", "interactive"] as const)(
    "hydrates the %s structure without recovery errors",
    async (mode) => {
      const recoverableErrors: unknown[] = [];
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      const element =
        mode === "interactive" ? (
          <Steps current={1} items={items} onChange={() => undefined} />
        ) : (
          <Steps current={1} items={items} />
        );
      const container = document.createElement("div");
      container.innerHTML = renderToString(element);
      document.body.append(container);

      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        root = hydrateRoot(container, element, {
          onRecoverableError: (error) => recoverableErrors.push(error)
        });
        await Promise.resolve();
      });

      expect(recoverableErrors).toEqual([]);
      expect(consoleError).not.toHaveBeenCalled();
      const list = container.querySelector("ol");
      expect(list && list.getAttribute("role")).toBe("list");
      expect(
        container.querySelectorAll(mode === "interactive" ? "button" : "ol > li > div")
      ).toHaveLength(3);
      if (mode === "interactive") {
        const currentButton = container.querySelector<HTMLButtonElement>(
          '[aria-current="step"] button'
        );
        expect(currentButton && currentButton.disabled).toBe(true);
      }

      await act(() => {
        if (root) root.unmount();
        return Promise.resolve();
      });
    }
  );
});
