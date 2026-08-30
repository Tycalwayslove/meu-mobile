"use client";

import { MeuForm, MeuFormTextInput, useMeuForm } from "@meu/form-react";
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
import { useState, useSyncExternalStore } from "react";
import type { TreeSelectOption } from "@meu/mobile";

const hydrationItems = Array.from({ length: 250 }, (_, index) => ({
  id: `hydration-${index + 1}`,
  label: `Hydration row ${index + 1}`
}));

const initialHydrationTree: ReadonlyArray<TreeSelectOption<string>> = [
  {
    children: [{ isLeaf: false, label: "Hydration remote branch", value: "hydration-remote" }],
    label: "Hydration loaded branch",
    value: "hydration-loaded"
  },
  ...Array.from({ length: 120 }, (_, index) => ({
    label: `Hydration option ${index + 1}`,
    value: `hydration-option-${index + 1}`
  }))
];

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function HydrationFormScenario({ initialName }: { initialName: string }) {
  const form = useMeuForm<{ name: string }>({ defaultValues: { name: initialName } });

  return (
    <MeuForm form={form} onSubmit={() => undefined}>
      <MeuFormTextInput name="name" label="Hydration form name" />
      <Button type="button" onClick={() => form.reset({ name: "Client default" })}>
        Apply client default
      </Button>
      <Button type="reset">Reset hydration form</Button>
    </MeuForm>
  );
}

export function HydrationScenario({
  initialFormName,
  kind
}: {
  initialFormName: string;
  kind: string;
}) {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const [hydrationTree, setHydrationTree] = useState(initialHydrationTree);
  const [treeAsyncStatus, setTreeAsyncStatus] = useState("idle");

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
          defaultExpandedValues={["hydration-loaded"]}
          lockScroll={false}
          open
          options={hydrationTree}
          overscan={1}
          treeAriaLabel="Hydration tree"
          treeHeight={208}
          loadChildren={(_option, { signal }) =>
            new Promise<void>((resolve, reject) => {
              setTreeAsyncStatus("loading");
              const timeout = window.setTimeout(() => {
                setHydrationTree((current) =>
                  current.map((option) =>
                    option.value === "hydration-loaded"
                      ? {
                          ...option,
                          children: [
                            {
                              children: [
                                {
                                  label: "Hydration remote child",
                                  value: "hydration-remote-child"
                                }
                              ],
                              label: "Hydration remote branch",
                              value: "hydration-remote"
                            }
                          ]
                        }
                      : option
                  )
                );
                setTreeAsyncStatus("loaded");
                resolve();
              }, 300);
              signal.addEventListener(
                "abort",
                () => {
                  window.clearTimeout(timeout);
                  setTreeAsyncStatus("aborted");
                  reject(new Error("Hydration tree load aborted"));
                },
                { once: true }
              );
            })
          }
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
    case "form":
      content = <HydrationFormScenario initialName={initialFormName} />;
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
    <ConfigProvider
      {...(kind === "form" ? { dir: "rtl" as const, motion: "reduced" as const } : {})}
      theme="system"
    >
      <section
        aria-label="专项 Hydration 场景"
        data-case={kind}
        data-hydrated={hydrated || undefined}
      >
        {content}
        {kind === "tree-select" ? (
          <output aria-label="Hydration tree async status">{treeAsyncStatus}</output>
        ) : null}
      </section>
    </ConfigProvider>
  );
}
