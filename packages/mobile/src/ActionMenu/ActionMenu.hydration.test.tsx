// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { ActionMenu } from "./ActionMenu";
import { ActionMenuProvider, useActionMenu } from "./ActionMenuProvider";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];

function hydrate(element: ReactNode) {
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  document.body.append(container);
  const recoverableErrors: unknown[] = [];

  act(() => {
    mountedRoots.push(
      hydrateRoot(container, element, {
        onRecoverableError: (error) => recoverableErrors.push(error)
      })
    );
  });

  return { container, recoverableErrors };
}

function ProviderConsumer({ onClose }: { onClose: () => void }) {
  const actionMenu = useActionMenu();
  return (
    <button
      type="button"
      onClick={() =>
        actionMenu.show({
          "aria-label": "Hydrated actions",
          actions: [{ key: "delete", label: "Delete order", tone: "danger" }],
          onClose
        })
      }
    >
      Open hydrated menu
    </button>
  );
}

afterEach(async () => {
  await act(() => {
    for (const root of mountedRoots.splice(0)) root.unmount();
    return Promise.resolve();
  });
  document.body.replaceChildren();
});

describe("ActionMenu hydration", () => {
  it("hydrates an initially open menu and moves its portal without recovery", async () => {
    const element = (
      <ConfigProvider dir="rtl" locale="en-US" motion="reduced" theme="dark">
        <ActionMenu
          open
          title="Order actions"
          description="Choose one action"
          actions={[
            { key: "delete", label: "Delete", tone: "danger" },
            { key: "copy", label: "Copy", description: "ORDER-TRACE-2026-0828" }
          ]}
        />
      </ConfigProvider>
    );
    const { container, recoverableErrors } = hydrate(element);

    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeNull());
    const dialog = screen.getByRole("dialog", { name: "Order actions" });
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(recoverableErrors).toEqual([]);
    expect(labelledBy).toBeTruthy();
    const titleElement = document.getElementById(labelledBy || "");
    expect(titleElement === null ? null : titleElement.textContent).toBe("Order actions");
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    const layer = dialog.closest('[data-meu-overlay-layer="popup"]');
    expect(layer === null ? null : layer.getAttribute("dir")).toBe("rtl");
    const copyAction = within(dialog).getByRole("button", { name: "Copy" });
    const actionDescribedBy = copyAction.getAttribute("aria-describedby");
    const actionDescription = document.getElementById(actionDescribedBy || "");
    expect(actionDescription === null ? null : actionDescription.textContent).toBe(
      "ORDER-TRACE-2026-0828"
    );
    expect(
      Array.from(dialog.querySelectorAll("[data-action-group]")).map((group) =>
        group.getAttribute("data-action-group")
      )
    ).toEqual(["neutral", "danger", "cancel"]);
  });

  it("keeps provider context and nested confirmation interactive after hydration", async () => {
    const onClose = vi.fn();
    const element = (
      <ConfigProvider locale="en-US">
        <ActionMenuProvider>
          <ProviderConsumer onClose={onClose} />
        </ActionMenuProvider>
      </ConfigProvider>
    );
    const { recoverableErrors } = hydrate(element);

    fireEvent.click(screen.getByRole("button", { name: "Open hydrated menu" }));
    const menu = await screen.findByRole("dialog", { name: "Hydrated actions" });
    fireEvent.click(within(menu).getByRole("button", { name: "Delete order" }));
    const confirmation = await screen.findByRole("alertdialog", {
      name: "Continue with this action?"
    });
    const cancelButton = within(confirmation).getByText("Cancel").closest("button");
    if (!(cancelButton instanceof HTMLButtonElement)) {
      throw new Error("Expected the hydrated confirmation cancel button");
    }
    fireEvent.click(cancelButton);

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(screen.getByRole("dialog", { name: "Hydrated actions" })).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    expect(recoverableErrors).toEqual([]);
  });
});
