"use client";

import {
  Button,
  ConfigProvider,
  FloatingPanel,
  Image,
  ImageUploader,
  InfiniteList,
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
  const [floatingPanelHeight, setFloatingPanelHeight] = useState(160);
  const [imageAttempt, setImageAttempt] = useState(0);
  const [imageStatus, setImageStatus] = useState("图片请求等待开始");
  const [infinitePage, setInfinitePage] = useState(1);
  const [infiniteStatus, setInfiniteStatus] = useState("分页请求等待开始");
  const [uploadStatus, setUploadStatus] = useState("上传请求等待开始");
  const [uploadQueueStatus, setUploadQueueStatus] = useState("上传队列 0");
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

        <section
          aria-label="浮动面板性能"
          style={{ height: 520, marginTop: 24, overflow: "hidden", position: "relative" }}
        >
          <FloatingPanel
            anchors={[160, 300, 480]}
            height={floatingPanelHeight}
            inertiaFactor={0}
            onHeightChange={setFloatingPanelHeight}
            style={{ position: "absolute" }}
          >
            <div style={{ minHeight: 420, padding: 16 }}>浮动面板持续手势样本</div>
          </FloatingPanel>
          <output aria-live="polite">浮动面板高度 {floatingPanelHeight}</output>
        </section>

        <section aria-label="图片网络恢复" style={{ display: "grid", gap: 12, marginTop: 24 }}>
          <Image
            alt="网络恢复样本"
            height={120}
            src={`/performance-image.svg?attempt=${imageAttempt}`}
            width="100%"
            onError={() => setImageStatus(`图片请求失败 ${imageAttempt}`)}
            onLoad={() => setImageStatus(`图片请求成功 ${imageAttempt}`)}
          />
          <Button
            size="small"
            variant="outline"
            onClick={() => {
              setImageStatus("图片请求重试中");
              setImageAttempt((current) => current + 1);
            }}
          >
            重试网络图片
          </Button>
          <output aria-live="polite">{imageStatus}</output>
        </section>

        <section aria-label="分页网络恢复" style={{ display: "grid", gap: 12, marginTop: 24 }}>
          <div role="list" aria-label="网络分页结果">
            {Array.from({ length: infinitePage }, (_, index) => (
              <div role="listitem" key={index}>
                网络分页 {index + 1}
              </div>
            ))}
          </div>
          <InfiniteList
            autoLoad={false}
            hasMore={infinitePage < 3}
            loadMore={async ({ signal, trigger }) => {
              setInfiniteStatus(`分页请求中 ${trigger}`);
              const response = await fetch(`/performance-page?current=${infinitePage}`, { signal });
              const result = (await response.json()) as { ok?: boolean };
              if (!response.ok || result.ok !== true) {
                throw new Error(`分页请求失败 ${response.status}`);
              }
              setInfinitePage((current) => current + 1);
              setInfiniteStatus(`分页请求成功 ${trigger}`);
            }}
            onLoadError={() => setInfiniteStatus("分页请求失败")}
          />
          <output aria-live="polite">{infiniteStatus}</output>
        </section>

        <section aria-label="上传网络恢复" style={{ display: "grid", gap: 12, marginTop: 24 }}>
          <ImageUploader
            aria-label="网络图片上传"
            maxCount={2}
            upload={async (file, context) => {
              setUploadStatus(`上传请求中 ${file.name}`);
              context.onProgress(20);
              const response = await fetch(
                `/performance-upload?name=${encodeURIComponent(file.name)}`,
                { body: file, method: "POST", signal: context.signal }
              );
              const result = (await response.json()) as { ok?: boolean };
              if (!response.ok || result.ok !== true) {
                throw new Error(`上传请求失败 ${response.status}`);
              }
              context.onProgress(100);
              setUploadStatus(`上传请求成功 ${file.name}`);
              return {
                alt: file.name,
                key: `${file.name}-${file.lastModified}`,
                name: file.name,
                url: "/demo-media.svg"
              };
            }}
            onUploadQueueChange={(tasks) => {
              setUploadQueueStatus(
                `上传队列 ${tasks.length}${tasks[0] ? ` ${tasks[0].status}` : ""}`
              );
            }}
          />
          <output aria-live="polite">{uploadStatus}</output>
          <output aria-live="polite">{uploadQueueStatus}</output>
        </section>
      </section>
    </ConfigProvider>
  );
}
