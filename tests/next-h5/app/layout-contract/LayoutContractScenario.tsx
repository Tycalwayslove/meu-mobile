"use client";

import {
  ConfigProvider,
  Divider,
  FloatingPanel,
  PullToRefresh,
  Result,
  Skeleton,
  Space,
  SwipeActions
} from "@meu/mobile";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [resultStatus, setResultStatus] = useState<"error" | "pending" | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const rightActions = useMemo(() => [{ key: "archive", label: <DynamicActionLabel /> }], []);

  useEffect(() => {
    if (!resultStatus) return;
    const result = resultRef.current;
    if (!result) return;
    const heading = result.querySelector<HTMLElement>("h1, h2, h3, h4, h5, h6");
    if (!heading) return;
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }, [resultStatus]);

  return (
    <>
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

          <section
            aria-label="Divider geometry"
            dir="rtl"
            style={{ display: "grid", gap: 16, maxWidth: 240 }}
          >
            <Divider data-testid="long-rtl-divider" align="start">
              Extremely long localized section heading that must wrap safely
            </Divider>
            <div
              data-testid="vertical-divider-host"
              style={{ display: "flex", alignItems: "center", height: 72 }}
            >
              <span>Price</span>
              <Divider
                data-testid="stretch-vertical-divider"
                aria-label="Price and inventory boundary"
                direction="vertical"
              />
              <span>Inventory</span>
            </div>
          </section>

          <section aria-label="Space geometry" dir="rtl" style={{ maxWidth: 220 }}>
            <Space data-testid="rtl-wrapped-space" align="start" gap={3} wrap>
              <span data-testid="space-item-one" style={{ width: 96 }}>
                First item
              </span>
              <span data-testid="space-item-two" style={{ width: 96 }}>
                Second item
              </span>
              <span data-testid="space-item-three" style={{ width: 96 }}>
                Third item
              </span>
            </Space>
            <Space data-testid="baseline-space" align="baseline" gap={2}>
              <span data-testid="baseline-small" style={{ fontSize: 12, lineHeight: 1 }}>
                Small
              </span>
              <span data-testid="baseline-large" style={{ fontSize: 28, lineHeight: 1 }}>
                Large
              </span>
            </Space>
          </section>

          <section aria-label="Result route focus" style={{ maxWidth: 360 }}>
            {resultStatus ? (
              <Result
                ref={resultRef}
                actions={
                  resultStatus === "pending" ? (
                    <button type="button" onClick={() => setResultStatus("error")}>
                      Fail request
                    </button>
                  ) : (
                    <button type="button" onClick={() => setResultStatus("pending")}>
                      Retry request
                    </button>
                  )
                }
                description={
                  resultStatus === "pending"
                    ? "The request is awaiting confirmation."
                    : "Check the connection and try again."
                }
                role={resultStatus === "error" ? "alert" : "status"}
                status={resultStatus}
                title={resultStatus === "pending" ? "Request pending" : "Request failed"}
              />
            ) : (
              <button type="button" onClick={() => setResultStatus("pending")}>
                Show route result
              </button>
            )}
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

      <ConfigProvider locale="en-US" motion="system" theme="light">
        <section aria-label="Skeleton system motion" style={{ padding: 24 }}>
          <Skeleton
            data-testid="system-motion-skeleton"
            animated
            height={80}
            variant="rectangle"
            width={300}
          />
        </section>
      </ConfigProvider>
    </>
  );
}
