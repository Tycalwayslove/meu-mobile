"use client";

import {
  BottomSheet,
  Button,
  ConfigProvider,
  FloatingPanel,
  ImageViewer,
  Popover,
  Popup,
  SwipeActions,
  TreeSelect,
  VirtualList
} from "@meu/mobile";
import { useSyncExternalStore } from "react";

const hydrationItems = Array.from({ length: 250 }, (_, index) => ({
  id: `hydration-${index + 1}`,
  label: `Hydration row ${index + 1}`
}));

const hydrationTree = Array.from({ length: 120 }, (_, index) => ({
  label: `Hydration option ${index + 1}`,
  value: `hydration-option-${index + 1}`
}));

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function HydrationScenario({ kind }: { kind: string }) {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );

  let content;
  switch (kind) {
    case "popup":
      content = (
        <Popup aria-label="Hydration popup" lockScroll={false} open>
          <Button>Popup action</Button>
        </Popup>
      );
      break;
    case "bottom-sheet":
      content = (
        <BottomSheet lockScroll={false} open title="Hydration sheet">
          <Button>Sheet action</Button>
        </BottomSheet>
      );
      break;
    case "popover":
      content = (
        <Popover
          aria-label="Hydration popover"
          defaultOpen
          content={<Button>Popover action</Button>}
        >
          <Button>Popover trigger</Button>
        </Popover>
      );
      break;
    case "image-viewer":
      content = (
        <ImageViewer
          aria-label="Hydration image viewer"
          images={[{ alt: "Hydration image", src: "/demo-media.svg" }]}
          lockScroll={false}
          open
        />
      );
      break;
    case "tree-select":
      content = (
        <TreeSelect
          aria-label="Hydration tree select"
          lockScroll={false}
          open
          options={hydrationTree}
          treeAriaLabel="Hydration tree"
        />
      );
      break;
    case "floating-panel":
      content = (
        <div style={{ position: "relative", minHeight: 480 }}>
          <FloatingPanel anchors={[160, 300, 440]} defaultHeight={300}>
            Hydration panel content
          </FloatingPanel>
        </div>
      );
      break;
    case "swipe-actions":
      content = (
        <SwipeActions defaultOpenSide="right" rightActions={[{ key: "archive", label: "Archive" }]}>
          <div style={{ minHeight: 64 }}>Hydration swipe content</div>
        </SwipeActions>
      );
      break;
    default:
      content = (
        <VirtualList
          aria-label="Hydration virtual list"
          estimateSize={48}
          getItemKey={(item) => item.id}
          height={240}
          items={hydrationItems}
          renderItem={(item) => <div style={{ minHeight: 48 }}>{item.label}</div>}
        />
      );
  }

  return (
    <ConfigProvider theme="system">
      <section
        aria-label="专项 Hydration 场景"
        data-case={kind}
        data-hydrated={hydrated || undefined}
      >
        {content}
      </section>
    </ConfigProvider>
  );
}
