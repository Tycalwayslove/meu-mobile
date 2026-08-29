"use client";

import { ConfigProvider, Popup, ThemeProvider } from "@meu/mobile";
import { useCallback, useRef, useState } from "react";

type PortalTarget = "first" | "second";

export function OverlayLifecycleScenario() {
  const [open, setOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<PortalTarget>("first");
  const [status, setStatus] = useState("Popup closed");
  const [exitRequests, setExitRequests] = useState(0);
  const firstTargetRef = useRef<HTMLDivElement>(null);
  const secondTargetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const interruptTimerRef = useRef<number | null>(null);
  const resolvePortalTarget = useCallback(
    () => (portalTarget === "first" ? firstTargetRef.current! : secondTargetRef.current!),
    [portalTarget]
  );

  const openPopup = () => {
    if (interruptTimerRef.current !== null) window.clearTimeout(interruptTimerRef.current);
    interruptTimerRef.current = null;
    setPortalTarget("first");
    setStatus("Popup open");
    setOpen(true);
  };

  const interruptExit = () => {
    setExitRequests((current) => current + 1);
    setStatus("Exit requested");
    setOpen(false);
    interruptTimerRef.current = window.setTimeout(() => {
      interruptTimerRef.current = null;
      setStatus("Exit interrupted");
      setOpen(true);
    }, 80);
  };

  return (
    <ConfigProvider
      dir="rtl"
      locale="en-US"
      motion="reduced"
      portalContainer={resolvePortalTarget}
      theme="dark"
    >
      <main
        style={{
          display: "grid",
          gap: 16,
          minHeight: "140vh",
          padding: 24,
          color: "var(--meu-color-ink)",
          background: "var(--meu-color-canvas)"
        }}
      >
        <h1>Nested overlay lifecycle</h1>
        <p>This local route exercises Provider, Portal, and Popup as one browser contract.</p>
        <button id="outside-control" type="button">
          Outside control
        </button>
        <button ref={triggerRef} type="button" onClick={openPopup}>
          Open nested popup
        </button>
        <output aria-live="polite" data-exit-requests={exitRequests} data-testid="overlay-status">
          {status}
        </output>
        <div
          ref={firstTargetRef}
          data-testid="portal-target-first"
          style={{ position: "relative" }}
        />
        <div
          ref={secondTargetRef}
          data-testid="portal-target-second"
          style={{ position: "relative" }}
        />

        <ThemeProvider>
          <Popup
            aria-label="Nested delivery popup"
            closeOnMaskClick
            open={open}
            returnFocusRef={triggerRef}
            showCloseButton
            onOpenChange={(nextOpen, details) => {
              setOpen(nextOpen);
              setStatus(nextOpen ? "Popup open" : `Popup closed: ${details.reason}`);
            }}
          >
            <div style={{ display: "grid", gap: 12, minWidth: 280, padding: 24 }}>
              <label>
                Delivery note
                <input defaultValue="Inherited native theme" />
              </label>
              <button
                type="button"
                onClick={() => {
                  setPortalTarget((current) => (current === "first" ? "second" : "first"));
                  setStatus("Popup moved");
                }}
              >
                Move popup
              </button>
              <button type="button" onClick={interruptExit}>
                Interrupt exit
              </button>
            </div>
          </Popup>
        </ThemeProvider>
      </main>
    </ConfigProvider>
  );
}
