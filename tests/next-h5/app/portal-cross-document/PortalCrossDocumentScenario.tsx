"use client";

import { Portal } from "@meu/primitives-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore
} from "react";

const PortalBoundaryContext = createContext("missing-provider");
const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function PortalContextValue() {
  return <span data-testid="portal-provider-value">{useContext(PortalBoundaryContext)}</span>;
}

export function PortalCrossDocumentScenario() {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const logicalBoundaryRef = useRef<HTMLDivElement>(null);
  const [frameDocument, setFrameDocument] = useState<Document | null>(null);
  const [targetName, setTargetName] = useState<"first" | "second">("first");
  const [portalMounted, setPortalMounted] = useState(true);
  const [portalClicks, setPortalClicks] = useState(0);
  const [logicalClicks, setLogicalClicks] = useState(0);
  const [frameNativeClicks, setFrameNativeClicks] = useState(0);
  const [topNativeClicks, setTopNativeClicks] = useState(0);
  const target = frameDocument ? frameDocument.getElementById(`portal-target-${targetName}`) : null;
  const setFrame = useCallback((frame: HTMLIFrameElement | null) => {
    if (frame && frame.contentDocument) setFrameDocument(frame.contentDocument);
  }, []);

  useEffect(() => {
    if (!frameDocument) return;
    const handleFrameClick = () => setFrameNativeClicks((count) => count + 1);
    frameDocument.addEventListener("click", handleFrameClick);
    return () => frameDocument.removeEventListener("click", handleFrameClick);
  }, [frameDocument]);

  useEffect(() => {
    const logicalBoundary = logicalBoundaryRef.current;
    if (!logicalBoundary) return;
    const handleTopClick = () => setTopNativeClicks((count) => count + 1);
    logicalBoundary.addEventListener("click", handleTopClick);
    return () => logicalBoundary.removeEventListener("click", handleTopClick);
  }, []);

  return (
    <PortalBoundaryContext.Provider value="provider-preserved">
      <section
        aria-label="Portal cross-document scenario"
        className="portal-contract-card"
        data-hydrated={hydrated || undefined}
      >
        <div className="portal-contract-actions">
          <button
            type="button"
            onClick={() => setTargetName((name) => (name === "first" ? "second" : "first"))}
          >
            Switch Portal target
          </button>
          <button type="button" onClick={() => setPortalMounted((mounted) => !mounted)}>
            {portalMounted ? "Unmount Portal" : "Mount Portal"}
          </button>
        </div>

        {/* The handler proves React's logical Portal path; this div is not an interactive surface. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          ref={logicalBoundaryRef}
          data-testid="logical-react-boundary"
          onClick={() => setLogicalClicks((count) => count + 1)}
        >
          {portalMounted ? (
            <Portal container={target}>
              <button
                data-testid="iframe-portal-action"
                type="button"
                onClick={() => setPortalClicks((count) => count + 1)}
              >
                Portal action · <PortalContextValue />
              </button>
            </Portal>
          ) : null}
        </div>

        <iframe
          ref={setFrame}
          onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
          srcDoc={`<!doctype html>
            <html lang="en">
              <head>
                <style>
                  body { margin: 0; padding: 12px; font-family: system-ui, sans-serif; }
                  main { min-height: 48px; padding: 8px; border: 1px dashed #718078; }
                  main + main { margin-top: 8px; }
                  button { min-height: 44px; font: inherit; }
                </style>
              </head>
              <body>
                <main id="portal-target-first" aria-label="First iframe Portal target"></main>
                <main id="portal-target-second" aria-label="Second iframe Portal target"></main>
              </body>
            </html>`}
          title="Portal owner document"
        />

        <dl className="portal-contract-results">
          <div>
            <dt>Portal child clicks</dt>
            <dd data-testid="portal-click-count">{portalClicks}</dd>
          </div>
          <div>
            <dt>Logical React clicks</dt>
            <dd data-testid="logical-click-count">{logicalClicks}</dd>
          </div>
          <div>
            <dt>Iframe native clicks</dt>
            <dd data-testid="frame-native-click-count">{frameNativeClicks}</dd>
          </div>
          <div>
            <dt>Top native boundary clicks</dt>
            <dd data-testid="top-native-click-count">{topNativeClicks}</dd>
          </div>
        </dl>
      </section>
    </PortalBoundaryContext.Provider>
  );
}
