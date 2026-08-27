// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";

import { ConfigProvider } from "../ConfigProvider";
import { DialogProvider, useDialog } from "./DialogProvider";
import type { DialogController } from "./types";

function DialogConsumer() {
  const dialog = useDialog();
  const [result, setResult] = useState("idle");
  return (
    <>
      <button
        type="button"
        onClick={() => {
          void dialog
            .confirm({ description: "This cannot be undone.", title: "Delete order?" })
            .then((confirmed) => setResult(confirmed ? "confirmed" : "cancelled"));
        }}
      >
        Open confirm
      </button>
      <button
        type="button"
        onClick={() => {
          void dialog
            .alert({ description: "The order has been saved.", title: "Saved" })
            .then(() => setResult("acknowledged"));
        }}
      >
        Open alert
      </button>
      <output>{result}</output>
    </>
  );
}

function DialogControllerConsumer() {
  const dialog = useDialog();
  const controllerRef = useRef<DialogController | null>(null);
  const options = {
    actions: [{ key: "done", label: "完成", tone: "accent" as const }],
    description: "Controller lifecycle",
    title: "Managed dialog"
  };
  return (
    <>
      <button
        type="button"
        onClick={() => {
          controllerRef.current = dialog.show(options);
        }}
      >
        Open managed
      </button>
      <button
        type="button"
        onClick={() => {
          if (controllerRef.current) controllerRef.current.close();
        }}
      >
        Close managed
      </button>
      <button
        type="button"
        onClick={() => {
          dialog.show(options);
          dialog.show({ ...options, title: "Second managed dialog" });
        }}
      >
        Open stack
      </button>
      <button type="button" onClick={dialog.clear}>
        Clear dialogs
      </button>
    </>
  );
}

describe("DialogProvider", () => {
  it("resolves confirm results inside the current locale context", async () => {
    render(
      <ConfigProvider locale="en-US">
        <DialogProvider>
          <DialogConsumer />
        </DialogProvider>
      </ConfigProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open confirm" }));
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await waitFor(() => expect(document.activeElement).toBe(cancelButton));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("confirmed"));
    expect(screen.queryByRole("alertdialog", { name: "Delete order?" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open confirm" }));
    const secondCancelButton = screen.getByRole("button", { name: "Cancel" });
    await waitFor(() => expect(document.activeElement).toBe(secondCancelButton));
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("cancelled"));
  });

  it("resolves alert after the acknowledgement action", async () => {
    render(
      <DialogProvider>
        <DialogConsumer />
      </DialogProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Open alert" }));
    const confirmButton = screen.getByRole("button", { name: "我知道了" });
    await waitFor(() => expect(document.activeElement).toBe(confirmButton));
    fireEvent.click(confirmButton);
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("acknowledged"));
  });

  it("closes controllers and clears every provider-owned dialog", async () => {
    render(
      <DialogProvider>
        <DialogControllerConsumer />
      </DialogProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Open managed" }));
    await waitFor(() => expect(screen.getByRole("alertdialog")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Close managed" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open stack" }));
    await waitFor(() => expect(screen.getAllByRole("alertdialog")).toHaveLength(2));
    expect(document.body.getAttribute("data-meu-scroll-locked")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Clear dialogs" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(document.body.hasAttribute("data-meu-scroll-locked")).toBe(false);
  });
});
