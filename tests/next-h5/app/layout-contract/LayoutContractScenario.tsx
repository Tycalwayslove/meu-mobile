"use client";

import { ConfigProvider, FloatingPanel, PullToRefresh, Skeleton, SwipeActions } from "@meu/mobile";
import { useEffect, useMemo, useState } from "react";

function DynamicActionLabel() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const expand = () => setExpanded(true);
    window.addEventListener("meu-expand-swipe-action", expand);
    return () => window.removeEventListener("meu-expand-swipe-action", expand);
  }, []);

  return (
    <span
      data-testid="dynamic-action-label"
      style={{ display: "inline-block", width: expanded ? 220 : 72 }}
    >
      {expanded ? "Archive this order permanently" : "Archive"}
    </span>
  );
}

export function LayoutContractScenario() {
  const [skeletonLoaded, setSkeletonLoaded] = useState(false);
  const rightActions = useMemo(() => [{ key: "archive", label: <DynamicActionLabel /> }], []);

  return (
    <ConfigProvider locale="en-US" motion="reduced" theme="light">
      <main
        style={{
          display: "grid",
          gap: 24,
          minHeight: "140vh",
          padding: 24,
          color: "var(--meu-color-ink)",
          background: "var(--meu-color-canvas)"
        }}
      >
        <h1>Layout and hydration contracts</h1>

        <section aria-label="SwipeActions dynamic measurement" style={{ maxWidth: 360 }}>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("meu-expand-swipe-action"))}
          >
            Expand action width
          </button>
          <SwipeActions
            closeOnOutsidePress={false}
            defaultOpenSide="right"
            rightActions={rightActions}
          >
            <div style={{ minHeight: 64, padding: 16 }}>Measured swipe content</div>
          </SwipeActions>
        </section>

        <section aria-label="PullToRefresh hydration">
          <PullToRefresh onRefresh={() => new Promise<void>(() => undefined)}>
            <div style={{ minHeight: 80, padding: 16 }}>Hydrated refresh content</div>
          </PullToRefresh>
        </section>

        <section aria-label="Skeleton replacement geometry">
          <button
            type="button"
            onClick={() => window.setTimeout(() => setSkeletonLoaded(true), 600)}
          >
            Replace skeleton
          </button>
          <div data-testid="skeleton-frame" style={{ width: 300, maxWidth: "100%" }}>
            {skeletonLoaded ? (
              <div
                data-testid="skeleton-content"
                style={{
                  display: "grid",
                  boxSizing: "border-box",
                  width: "100%",
                  height: 180,
                  placeItems: "center",
                  border: "1px solid var(--meu-color-border)"
                }}
              >
                Loaded media
              </div>
            ) : (
              <Skeleton
                data-testid="skeleton-placeholder"
                animated
                height={180}
                variant="rectangle"
                width="100%"
              />
            )}
          </div>
        </section>

        <FloatingPanel
          data-testid="hydrated-floating-panel"
          anchors={[160, 300, 440]}
          defaultHeight={300}
          safeArea={false}
        >
          <div style={{ padding: 16 }}>Hydrated panel content</div>
        </FloatingPanel>
      </main>
    </ConfigProvider>
  );
}
