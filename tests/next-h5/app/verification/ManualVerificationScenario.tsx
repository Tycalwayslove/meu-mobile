"use client";

import {
  BottomSheet,
  Button,
  Carousel,
  Cell,
  ConfigProvider,
  FloatingPanel,
  ImageViewer,
  SwipeActions
} from "@meu/mobile";
import { useCallback, useEffect, useRef, useState } from "react";

type ChecklistStatus = "pending" | "pass" | "fail";

type ChecklistItem = {
  id: `D-0${number}`;
  label: string;
  notes: string;
  status: ChecklistStatus;
};

type CaptureResult = {
  durationMs: number;
  estimatedFps: number;
  frameCount: number;
  heap: {
    available: boolean;
    finalBytes?: number;
    initialBytes?: number;
    peakBytes?: number;
  };
  longTasks: {
    available: boolean;
    count: number;
    maximumMs: number;
    totalMs: number;
  };
  maximumFrameMs: number;
  p95FrameMs: number;
  requiredDurationMet: boolean;
  slowFrameCount: number;
};

type NetworkEvent = {
  attempt: number;
  durationMs: number;
  finishedAt: string;
  result: "aborted" | "failed" | "success";
};

type PerformanceWithMemory = Performance & {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    downlink?: number;
    effectiveType?: string;
    rtt?: number;
    saveData?: boolean;
  };
};

const checklistSeed: ChecklistItem[] = [
  { id: "D-01", label: "基础显示与输入", notes: "", status: "pending" },
  { id: "D-02", label: "表单生命周期", notes: "", status: "pending" },
  { id: "D-03", label: "Overlay 与焦点", notes: "", status: "pending" },
  { id: "D-04", label: "手势与滚动", notes: "", status: "pending" },
  { id: "D-05", label: "集合、图片与弱网", notes: "", status: "pending" },
  { id: "D-06", label: "兼容与降级", notes: "", status: "pending" }
];

function percentile(values: number[], percentage: number) {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  const index = Math.min(ordered.length - 1, Math.ceil(ordered.length * percentage) - 1);
  return ordered[index] || 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function environmentSnapshot() {
  const navigatorWithConnection = navigator as NavigatorWithConnection;
  const connection = navigatorWithConnection.connection;
  return {
    colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    connection: connection
      ? {
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData
        }
      : { available: false },
    devicePixelRatio: window.devicePixelRatio,
    language: navigator.language,
    online: navigator.onLine,
    platform: navigator.platform,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    screen: { height: window.screen.height, width: window.screen.width },
    userAgent: navigator.userAgent,
    viewport: { height: window.innerHeight, width: window.innerWidth }
  };
}

export function ManualVerificationScenario() {
  const [tester, setTester] = useState("");
  const [device, setDevice] = useState("");
  const [candidateSha, setCandidateSha] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [captureStatus, setCaptureStatus] = useState<"idle" | "running" | "complete">("idle");
  const [captureRemaining, setCaptureRemaining] = useState(60);
  const [captureResult, setCaptureResult] = useState<CaptureResult | null>(null);
  const [checklist, setChecklist] = useState(checklistSeed);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [floatingHeight, setFloatingHeight] = useState(160);
  const [networkStatus, setNetworkStatus] = useState("网络探针尚未运行");
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const captureCleanupRef = useRef<(() => void) | null>(null);
  const networkControllerRef = useRef<AbortController | null>(null);
  const networkAttemptRef = useRef(0);

  const stopCapture = useCallback(() => {
    if (!captureCleanupRef.current) return;
    captureCleanupRef.current();
    captureCleanupRef.current = null;
  }, []);

  useEffect(() => stopCapture, [stopCapture]);

  const startCapture = useCallback(() => {
    stopCapture();
    const durationMs = durationSeconds * 1_000;
    const frameDurations: number[] = [];
    const heapSamples: number[] = [];
    const longTaskDurations: number[] = [];
    const performanceWithMemory = window.performance as PerformanceWithMemory;
    const initialHeap = performanceWithMemory.memory
      ? performanceWithMemory.memory.usedJSHeapSize
      : undefined;
    if (initialHeap !== undefined) heapSamples.push(initialHeap);
    const startedAt = performance.now();
    let previousFrame: number | undefined;
    let frameId = 0;
    let stopped = false;

    const longTaskAvailable =
      typeof PerformanceObserver !== "undefined" &&
      PerformanceObserver.supportedEntryTypes.includes("longtask");
    const observer = longTaskAvailable
      ? new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => longTaskDurations.push(entry.duration));
        })
      : null;
    if (observer) observer.observe({ entryTypes: ["longtask"] });

    const heapTimer = window.setInterval(() => {
      const heap = performanceWithMemory.memory
        ? performanceWithMemory.memory.usedJSHeapSize
        : undefined;
      if (heap !== undefined) heapSamples.push(heap);
    }, 500);
    const remainingTimer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      setCaptureRemaining(Math.max(0, Math.ceil((durationMs - elapsed) / 1_000)));
    }, 250);

    const cleanup = () => {
      stopped = true;
      window.cancelAnimationFrame(frameId);
      window.clearInterval(heapTimer);
      window.clearInterval(remainingTimer);
      if (observer) observer.disconnect();
    };
    captureCleanupRef.current = cleanup;

    const finish = (finishedAt: number) => {
      cleanup();
      captureCleanupRef.current = null;
      const elapsed = finishedAt - startedAt;
      const finalHeap = performanceWithMemory.memory
        ? performanceWithMemory.memory.usedJSHeapSize
        : undefined;
      if (finalHeap !== undefined) heapSamples.push(finalHeap);
      setCaptureResult({
        durationMs: round(elapsed),
        estimatedFps: round((frameDurations.length / elapsed) * 1_000),
        frameCount: frameDurations.length,
        heap: {
          available: heapSamples.length > 0,
          ...(initialHeap === undefined ? {} : { initialBytes: initialHeap }),
          ...(finalHeap === undefined ? {} : { finalBytes: finalHeap }),
          ...(heapSamples.length === 0 ? {} : { peakBytes: Math.max(...heapSamples) })
        },
        longTasks: {
          available: longTaskAvailable,
          count: longTaskDurations.length,
          maximumMs: round(longTaskDurations.length ? Math.max(...longTaskDurations) : 0),
          totalMs: round(longTaskDurations.reduce((sum, value) => sum + value, 0))
        },
        maximumFrameMs: round(frameDurations.length ? Math.max(...frameDurations) : 0),
        p95FrameMs: round(percentile(frameDurations, 0.95)),
        requiredDurationMet: elapsed >= 59_500,
        slowFrameCount: frameDurations.filter((value) => value > 32).length
      });
      setCaptureRemaining(0);
      setCaptureStatus("complete");
    };

    const frame = (timestamp: number) => {
      if (stopped) return;
      if (previousFrame !== undefined) frameDurations.push(timestamp - previousFrame);
      previousFrame = timestamp;
      if (timestamp - startedAt >= durationMs) {
        finish(timestamp);
        return;
      }
      frameId = window.requestAnimationFrame(frame);
    };

    setCaptureResult(null);
    setCaptureRemaining(durationSeconds);
    setCaptureStatus("running");
    frameId = window.requestAnimationFrame(frame);
  }, [durationSeconds, stopCapture]);

  const runNetworkProbe = useCallback(async () => {
    if (networkControllerRef.current) networkControllerRef.current.abort();
    const controller = new AbortController();
    networkControllerRef.current = controller;
    networkAttemptRef.current += 1;
    const attempt = networkAttemptRef.current;
    const startedAt = performance.now();
    setNetworkStatus(`网络探针第 ${attempt} 次请求中`);
    try {
      const response = await fetch(`/demo-media.svg?manual-probe=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await response.arrayBuffer();
      const event: NetworkEvent = {
        attempt,
        durationMs: round(performance.now() - startedAt),
        finishedAt: new Date().toISOString(),
        result: "success"
      };
      setNetworkEvents((current) => [...current, event]);
      setNetworkStatus(`网络探针第 ${attempt} 次成功，用时 ${event.durationMs}ms`);
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      const event: NetworkEvent = {
        attempt,
        durationMs: round(performance.now() - startedAt),
        finishedAt: new Date().toISOString(),
        result: aborted ? "aborted" : "failed"
      };
      setNetworkEvents((current) => [...current, event]);
      setNetworkStatus(`网络探针第 ${attempt} 次${aborted ? "已取消" : "失败"}`);
    } finally {
      if (networkControllerRef.current === controller) networkControllerRef.current = null;
    }
  }, []);

  const exportEvidence = useCallback(() => {
    if (!captureResult) return;
    const report = {
      schemaVersion: "1.0.0",
      capturedAt: new Date().toISOString(),
      candidate: candidateSha.trim() || "working-tree",
      checklist,
      device: device.trim() || "not-recorded",
      environment: environmentSnapshot(),
      networkEvents,
      performance: captureResult,
      tester: tester.trim() || "not-recorded"
    };
    const blob = new Blob([`${JSON.stringify(report, null, 2)}\n`], {
      type: "application/json"
    });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `meu-device-evidence-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(href), 0);
  }, [candidateSha, captureResult, checklist, device, networkEvents, tester]);

  return (
    <ConfigProvider theme="system" motion="system">
      <section className="verification-workbench" aria-label="商用验收工作台">
        <section className="verification-card" aria-labelledby="verification-metadata-title">
          <h2 id="verification-metadata-title">验收元数据</h2>
          <div className="verification-fields">
            <label>
              执行人
              <input value={tester} onChange={(event) => setTester(event.currentTarget.value)} />
            </label>
            <label>
              设备与系统
              <input
                value={device}
                placeholder="例如 iPhone 15 Pro / iOS 18.6 / Safari"
                onChange={(event) => setDevice(event.currentTarget.value)}
              />
            </label>
            <label>
              候选 commit SHA
              <input
                value={candidateSha}
                placeholder="完整 40 位 SHA；未冻结可留空"
                onChange={(event) => setCandidateSha(event.currentTarget.value)}
              />
            </label>
          </div>
        </section>

        <section className="verification-card" aria-labelledby="verification-capture-title">
          <h2 id="verification-capture-title">持续性能采样</h2>
          <p>正式 PERF-01 使用 60 秒；5 秒仅用于确认工作台可运行，导出结果不会标记达标。</p>
          <div className="verification-actions">
            <label>
              时长
              <select
                disabled={captureStatus === "running"}
                value={durationSeconds}
                onChange={(event) => setDurationSeconds(Number(event.currentTarget.value))}
              >
                <option value={5}>5 秒（工具自检）</option>
                <option value={60}>60 秒（正式验收）</option>
              </select>
            </label>
            <Button disabled={captureStatus === "running"} onClick={startCapture}>
              开始采样
            </Button>
          </div>
          <output aria-live="polite" data-capture-status={captureStatus}>
            {captureStatus === "running"
              ? `采样中，剩余约 ${captureRemaining} 秒`
              : captureStatus === "complete"
                ? "采样完成"
                : "等待开始"}
          </output>
          {captureResult ? (
            <dl className="verification-metrics">
              <div>
                <dt>估算 FPS</dt>
                <dd>{captureResult.estimatedFps}</dd>
              </div>
              <div>
                <dt>P95 帧耗时</dt>
                <dd>{captureResult.p95FrameMs}ms</dd>
              </div>
              <div>
                <dt>慢帧</dt>
                <dd>{captureResult.slowFrameCount}</dd>
              </div>
              <div>
                <dt>长任务</dt>
                <dd>
                  {captureResult.longTasks.available ? captureResult.longTasks.count : "不支持"}
                </dd>
              </div>
              <div>
                <dt>60 秒达标</dt>
                <dd>{captureResult.requiredDurationMet ? "是" : "否"}</dd>
              </div>
            </dl>
          ) : null}
        </section>

        <section className="verification-card" aria-labelledby="verification-gesture-title">
          <h2 id="verification-gesture-title">手势与 Overlay 样本</h2>
          <p>采样期间持续操作轮播、滑动行、浮动面板、BottomSheet 与 ImageViewer。</p>
          <Carousel
            aria-label="验收轮播"
            index={carouselIndex}
            items={[
              { key: "one", ariaLabel: "验收轮播一", content: <span>轮播样本 1</span> },
              { key: "two", ariaLabel: "验收轮播二", content: <span>轮播样本 2</span> },
              { key: "three", ariaLabel: "验收轮播三", content: <span>轮播样本 3</span> }
            ]}
            loop
            onIndexChange={setCarouselIndex}
          />
          <SwipeActions
            rightActions={[
              { key: "archive", label: "归档" },
              { key: "delete", label: "删除", tone: "danger" }
            ]}
          >
            <Cell title="滑动操作验收行" description="反复打开、关闭并与纵向滚动竞争" />
          </SwipeActions>
          <div className="verification-panel-stage">
            <FloatingPanel
              anchors={[160, 300, 460]}
              height={floatingHeight}
              onHeightChange={setFloatingHeight}
              style={{ position: "absolute" }}
            >
              <div className="verification-panel-content">浮动面板拖拽样本</div>
            </FloatingPanel>
          </div>
          <div className="verification-actions">
            <Button variant="outline" onClick={() => setBottomSheetOpen(true)}>
              打开 BottomSheet
            </Button>
            <Button variant="outline" onClick={() => setViewerOpen(true)}>
              打开 ImageViewer
            </Button>
          </div>
          <BottomSheet
            open={bottomSheetOpen}
            title="验收 BottomSheet"
            snapPoints={[0.35, 0.65, 0.9]}
            onOpenChange={setBottomSheetOpen}
          >
            <div style={{ minHeight: 520, padding: 16 }}>拖动、滚动、取消并关闭。</div>
          </BottomSheet>
          <ImageViewer
            aria-label="验收图片预览"
            images={[
              { alt: "验收图片一", key: "one", src: "/demo-media.svg" },
              { alt: "验收图片二", key: "two", src: "/demo-media.svg" },
              { alt: "验收图片三", key: "three", src: "/demo-media.svg" }
            ]}
            index={viewerIndex}
            open={viewerOpen}
            onIndexChange={setViewerIndex}
            onOpenChange={setViewerOpen}
          />
        </section>

        <section className="verification-card" aria-labelledby="verification-network-title">
          <h2 id="verification-network-title">网络取消与恢复探针</h2>
          <p>在慢 3G、离线或切换网络期间运行；先开始、主动取消，再恢复网络并重试。</p>
          <div className="verification-actions">
            <Button variant="outline" onClick={() => void runNetworkProbe()}>
              运行网络探针
            </Button>
            <Button
              tone="neutral"
              variant="outline"
              disabled={!networkControllerRef.current}
              onClick={() => {
                const controller = networkControllerRef.current;
                if (controller) controller.abort();
              }}
            >
              取消当前请求
            </Button>
          </div>
          <output aria-live="polite">{networkStatus}</output>
          <p>已记录 {networkEvents.length} 次请求事件。</p>
        </section>

        <section className="verification-card" aria-labelledby="verification-checklist-title">
          <h2 id="verification-checklist-title">D-01 至 D-06 检查记录</h2>
          <div className="verification-checklist">
            {checklist.map((item, index) => (
              <fieldset key={item.id}>
                <legend>
                  {item.id} · {item.label}
                </legend>
                <label>
                  结果
                  <select
                    value={item.status}
                    onChange={(event) => {
                      const status = event.currentTarget.value as ChecklistStatus;
                      setChecklist((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, status } : entry
                        )
                      );
                    }}
                  >
                    <option value="pending">pending</option>
                    <option value="pass">pass</option>
                    <option value="fail">fail</option>
                  </select>
                </label>
                <label>
                  证据或问题
                  <textarea
                    value={item.notes}
                    onChange={(event) => {
                      const notes = event.currentTarget.value;
                      setChecklist((current) =>
                        current.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, notes } : entry
                        )
                      );
                    }}
                  />
                </label>
              </fieldset>
            ))}
          </div>
          <Button disabled={!captureResult} onClick={exportEvidence}>
            导出验收 JSON
          </Button>
        </section>
      </section>
    </ConfigProvider>
  );
}
