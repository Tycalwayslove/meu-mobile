"use client";

import { SafeArea } from "@meu/mobile";
import { useEffect, useState } from "react";

function readVisualViewportHeight() {
  const viewport = window.visualViewport;
  return viewport ? viewport.height : window.innerHeight;
}

export function SafeAreaContractScenario() {
  const [visualViewportHeight, setVisualViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    const updateHeight = () => setVisualViewportHeight(readVisualViewportHeight());

    updateHeight();
    if (!viewport) return;
    viewport.addEventListener("resize", updateHeight);
    return () => viewport.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <main style={{ display: "grid", gap: 24, minHeight: "100vh", padding: 24 }}>
      <h1>SafeArea viewport contract</h1>

      <section aria-label="SafeArea physical edges" style={{ display: "grid", gap: 16 }}>
        <div
          data-testid="safe-area-vertical-host"
          style={{ display: "flex", flexDirection: "column", height: 120, width: "100%" }}
        >
          <SafeArea data-testid="safe-area-top" fallback={17} position="top" />
          <div style={{ flex: 1 }} />
          <SafeArea data-testid="safe-area-bottom" fallback={17} position="bottom" />
        </div>

        <div
          data-testid="safe-area-horizontal-host"
          style={{ display: "flex", height: 120, width: "100%" }}
        >
          <SafeArea data-testid="safe-area-left" fallback={17} position="left" />
          <div style={{ flex: 1 }} />
          <SafeArea data-testid="safe-area-right" fallback={17} position="right" />
        </div>
      </section>

      <section aria-label="SafeArea keyboard ownership" style={{ display: "grid", gap: 12 }}>
        <label htmlFor="safe-area-keyboard-input">Keyboard owner input</label>
        <input id="safe-area-keyboard-input" inputMode="text" />
        <output data-testid="visual-viewport-height">
          {visualViewportHeight === null ? "pending" : String(visualViewportHeight)}
        </output>
        <div data-testid="safe-area-keyboard-footer">
          <span>Page-owned keyboard boundary</span>
          <SafeArea data-testid="safe-area-keyboard-bottom" fallback={17} position="bottom" />
        </div>
      </section>
    </main>
  );
}
