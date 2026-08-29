"use client";

import {
  Button,
  ConfigProvider,
  PickerTrigger,
  SwipeActions,
  TreeSelect,
  VirtualList
} from "@meu/mobile";
import { useRef, useState, useSyncExternalStore } from "react";
import type { TreeSelectOption, VirtualListRange, VirtualListRef } from "@meu/mobile";

const virtualItems = Array.from({ length: 10_000 }, (_, index) => ({
  id: `PERF-${String(index + 1).padStart(5, "0")}`,
  label: `性能订单 ${index + 1}`
}));

const treeOptions: ReadonlyArray<TreeSelectOption<string>> = Array.from(
  { length: 1_500 },
  (_, index) => ({
    label: `性能分类 ${index + 1}`,
    value: `category-${index + 1}`
  })
);

function afterTwoFrames(callback: () => void) {
  window.requestAnimationFrame(() => window.requestAnimationFrame(callback));
}

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function PerformanceScenario() {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const [treeOpen, setTreeOpen] = useState(false);
  const [treeSearch, setTreeSearch] = useState("");
  const [treeMetric, setTreeMetric] = useState("");
  const [virtualMetric, setVirtualMetric] = useState("");
  const [virtualRange, setVirtualRange] = useState<VirtualListRange | null>(null);
  const treeTriggerRef = useRef<HTMLButtonElement>(null);
  const virtualRef = useRef<VirtualListRef>(null);
  const virtualStartRef = useRef<number | null>(null);

  return (
    <ConfigProvider theme="light" motion="system">
      <section
        aria-label="运行时性能场景"
        data-hydrated={hydrated || undefined}
        data-tree-metric={treeMetric || undefined}
        data-virtual-metric={virtualMetric || undefined}
      >
        <section aria-label="万条虚拟列表性能">
          <Button
            size="small"
            variant="outline"
            onClick={() => {
              virtualStartRef.current = window.performance.now();
              setVirtualMetric("");
              const list = virtualRef.current;
              if (list) list.scrollToIndex(9_000, { align: "start" });
            }}
          >
            跳转到性能订单 9001
          </Button>
          <VirtualList
            ref={virtualRef}
            aria-label="万条性能订单"
            estimateSize={56}
            getItemKey={(item) => item.id}
            height={320}
            items={virtualItems}
            overscan={3}
            onRangeChange={(range) => {
              setVirtualRange(range);
              if (range.visibleStartIndex < 8_900 || virtualStartRef.current === null) return;
              const startedAt = virtualStartRef.current;
              virtualStartRef.current = null;
              afterTwoFrames(() =>
                setVirtualMetric((window.performance.now() - startedAt).toFixed(2))
              );
            }}
            renderItem={(item) => (
              <div style={{ minHeight: 56, display: "flex", alignItems: "center" }}>
                {item.id} · {item.label}
              </div>
            )}
          />
          <output aria-live="polite">
            {virtualRange
              ? `性能范围 ${virtualRange.visibleStartIndex + 1}-${virtualRange.visibleEndIndex + 1}`
              : "等待虚拟范围"}
          </output>
        </section>

        <section aria-label="大树选择性能">
          <PickerTrigger
            ref={treeTriggerRef}
            aria-label="选择性能分类"
            open={treeOpen}
            placeholder="选择性能分类"
            onClick={() => {
              const startedAt = window.performance.now();
              setTreeMetric("");
              setTreeOpen(true);
              afterTwoFrames(() =>
                setTreeMetric(`open:${(window.performance.now() - startedAt).toFixed(2)}`)
              );
            }}
          />
          <TreeSelect
            aria-label="性能分类选择"
            open={treeOpen}
            options={treeOptions}
            returnFocusRef={treeTriggerRef}
            searchValue={treeSearch}
            title="选择性能分类"
            treeAriaLabel="一千五百个性能分类"
            onOpenChange={(nextOpen) => {
              setTreeOpen(nextOpen);
            }}
            onSearchValueChange={(nextSearch) => {
              const startedAt = window.performance.now();
              setTreeMetric("");
              setTreeSearch(nextSearch);
              afterTwoFrames(() =>
                setTreeMetric(`search:${(window.performance.now() - startedAt).toFixed(2)}`)
              );
            }}
          />
        </section>

        <section aria-label="滑动操作性能">
          <SwipeActions
            rightActions={[
              { key: "archive", label: "归档" },
              { key: "delete", label: "删除", tone: "danger" }
            ]}
          >
            <div style={{ minHeight: 64, display: "flex", alignItems: "center" }}>
              高频指针移动性能样本
            </div>
          </SwipeActions>
        </section>
      </section>
    </ConfigProvider>
  );
}
