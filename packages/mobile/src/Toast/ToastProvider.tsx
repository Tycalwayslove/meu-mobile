"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useMeuConfig } from "../ConfigProvider";
import { Toast } from "./Toast";
import type {
  ToastApi,
  ToastCloseDetails,
  ToastController,
  ToastProviderProps,
  ToastShowOptions,
  ToastTone,
  ToastToneOptions,
  ToastUpdateOptions
} from "./types";
import { ToastTimerResetContext } from "./ToastTimerContext";

type ToastRecord = {
  key: number;
  open: boolean;
  options: ToastShowOptions;
  revision: number;
};

const exitDuration = 160;
const defaultMaxToasts = 20;
const maximumMaxToasts = 100;
const ToastContext = createContext<ToastApi | null>(null);

function normalizeMaxToasts(value: number) {
  return Number.isFinite(value)
    ? Math.min(Math.max(1, Math.trunc(value)), maximumMaxToasts)
    : defaultMaxToasts;
}

function mergeToastOptions(current: ToastShowOptions, updates: ToastUpdateOptions) {
  const next: Partial<ToastShowOptions> = { ...current };
  (Object.keys(updates) as Array<keyof ToastUpdateOptions>).forEach((key) => {
    const value: unknown = updates[key];
    if (value === undefined) Reflect.deleteProperty(next, key);
    else Reflect.set(next, key, value);
  });
  return next as ToastShowOptions;
}

/**
 * Provides a scoped FIFO queue for command-driven Toast feedback.
 *
 * @public
 */
export function ToastProvider({ children, maxToasts = defaultMaxToasts }: ToastProviderProps) {
  const config = useMeuConfig();
  const resolvedMaxToasts = normalizeMaxToasts(maxToasts);
  const [records, setRecords] = useState<ToastRecord[]>([]);
  const allocatedKeysRef = useRef(new Set<number>());
  const mountedRef = useRef(true);
  const activeKeysRef = useRef(new Set<number>());
  const idToKeyRef = useRef(new Map<string, number>());
  const keyToIdRef = useRef(new Map<number, string>());
  const nextKeyRef = useRef(0);
  const optionsRef = useRef(new Map<number, ToastShowOptions>());
  const removeTimersRef = useRef(new Map<number, number>());

  const removeRecordLater = useCallback(
    (key: number) => {
      if (removeTimersRef.current.has(key)) return;
      const timer = window.setTimeout(
        () => {
          removeTimersRef.current.delete(key);
          allocatedKeysRef.current.delete(key);
          setRecords((currentRecords) => currentRecords.filter((record) => record.key !== key));
        },
        config.motion === "reduced" ? 0 : exitDuration
      );
      removeTimersRef.current.set(key, timer);
    },
    [config.motion]
  );

  const closeRecord = useCallback(
    (key: number, details: ToastCloseDetails) => {
      if (!activeKeysRef.current.has(key)) return;
      activeKeysRef.current.delete(key);

      const currentOptions = optionsRef.current.get(key);
      const onClose = currentOptions ? currentOptions.onClose : undefined;
      optionsRef.current.delete(key);
      const id = keyToIdRef.current.get(key);
      keyToIdRef.current.delete(key);
      if (id !== undefined) idToKeyRef.current.delete(id);
      setRecords((currentRecords) =>
        currentRecords.map((record) => (record.key === key ? { ...record, open: false } : record))
      );
      removeRecordLater(key);
      if (onClose) onClose(details);
    },
    [removeRecordLater]
  );

  const replaceRecord = useCallback((key: number, options: ToastShowOptions) => {
    if (!activeKeysRef.current.has(key)) return;
    optionsRef.current.set(key, options);
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.key === key ? { ...record, options, revision: record.revision + 1 } : record
      )
    );
  }, []);

  const updateRecord = useCallback(
    (key: number, updates: ToastUpdateOptions) => {
      const currentOptions = optionsRef.current.get(key);
      if (!currentOptions) return;
      replaceRecord(key, mergeToastOptions(currentOptions, updates));
    },
    [replaceRecord]
  );

  const createController = useCallback(
    (id: string, key: number): ToastController => ({
      id,
      close: () => closeRecord(key, { reason: "programmatic" }),
      update: (options) => updateRecord(key, options)
    }),
    [closeRecord, updateRecord]
  );

  const show = useCallback(
    (options: ToastShowOptions): ToastController => {
      const requestedId = options.id;
      if (requestedId !== undefined) {
        const existingKey = idToKeyRef.current.get(requestedId);
        if (existingKey !== undefined && activeKeysRef.current.has(existingKey)) {
          replaceRecord(existingKey, options);
          return createController(requestedId, existingKey);
        }
      }

      nextKeyRef.current += 1;
      const key = nextKeyRef.current;
      const id = requestedId === undefined ? `meu-toast-${key}` : requestedId;
      if (!mountedRef.current) return createController(id, key);
      if (allocatedKeysRef.current.size >= resolvedMaxToasts) {
        const replaceableKey = Array.from(allocatedKeysRef.current).find(
          (allocatedKey) => !activeKeysRef.current.has(allocatedKey)
        );
        if (replaceableKey !== undefined) {
          const removeTimer = removeTimersRef.current.get(replaceableKey);
          if (removeTimer !== undefined) window.clearTimeout(removeTimer);
          removeTimersRef.current.delete(replaceableKey);
          allocatedKeysRef.current.delete(replaceableKey);
          setRecords((currentRecords) =>
            currentRecords.filter((record) => record.key !== replaceableKey)
          );
        }
      }
      if (allocatedKeysRef.current.size >= resolvedMaxToasts) {
        if (options.onClose) options.onClose({ reason: "overflow" });
        return createController(id, key);
      }
      allocatedKeysRef.current.add(key);
      activeKeysRef.current.add(key);
      idToKeyRef.current.set(id, key);
      keyToIdRef.current.set(key, id);
      optionsRef.current.set(key, options);
      setRecords((currentRecords) => [
        ...currentRecords,
        { key, open: true, options, revision: 0 }
      ]);
      return createController(id, key);
    },
    [createController, replaceRecord, resolvedMaxToasts]
  );

  const showTone = useCallback(
    (tone: ToastTone, options: ToastToneOptions) => show({ ...options, tone }),
    [show]
  );

  const success = useCallback(
    (options: ToastToneOptions) => showTone("success", options),
    [showTone]
  );
  const warning = useCallback(
    (options: ToastToneOptions) => showTone("warning", options),
    [showTone]
  );
  const danger = useCallback(
    (options: ToastToneOptions) => showTone("danger", options),
    [showTone]
  );

  const clear = useCallback(() => {
    Array.from(activeKeysRef.current).forEach((key) => closeRecord(key, { reason: "clear" }));
  }, [closeRecord]);

  useEffect(() => {
    if (allocatedKeysRef.current.size <= resolvedMaxToasts) return;
    const capacityTimer = window.setTimeout(() => {
      let excess = allocatedKeysRef.current.size - resolvedMaxToasts;
      if (excess <= 0) return;
      const removedExitingKeys = new Set<number>();
      for (const key of allocatedKeysRef.current) {
        if (excess <= 0) break;
        if (activeKeysRef.current.has(key)) continue;
        const timer = removeTimersRef.current.get(key);
        if (timer !== undefined) window.clearTimeout(timer);
        removeTimersRef.current.delete(key);
        allocatedKeysRef.current.delete(key);
        removedExitingKeys.add(key);
        excess -= 1;
      }
      if (removedExitingKeys.size > 0) {
        setRecords((currentRecords) =>
          currentRecords.filter((record) => !removedExitingKeys.has(record.key))
        );
      }

      if (excess <= 0) return;
      const activeKeys = Array.from(activeKeysRef.current);
      activeKeys.slice(Math.max(0, activeKeys.length - excess)).forEach((key) => {
        closeRecord(key, { reason: "overflow" });
      });
    }, 0);
    return () => window.clearTimeout(capacityTimer);
  }, [closeRecord, resolvedMaxToasts]);

  useEffect(() => {
    const activeKeys = activeKeysRef.current;
    const allocatedKeys = allocatedKeysRef.current;
    const idToKey = idToKeyRef.current;
    const keyToId = keyToIdRef.current;
    const options = optionsRef.current;
    const removeTimers = removeTimersRef.current;
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      removeTimers.forEach((timer) => window.clearTimeout(timer));
      removeTimers.clear();
      const remainingCallbacks = Array.from(activeKeys).map((key) => {
        const currentOptions = options.get(key);
        return currentOptions ? currentOptions.onClose : undefined;
      });
      activeKeys.clear();
      allocatedKeys.clear();
      idToKey.clear();
      keyToId.clear();
      options.clear();
      remainingCallbacks.forEach((onClose) => {
        if (onClose) onClose({ reason: "programmatic" });
      });
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ clear, danger, show, success, warning }),
    [clear, danger, show, success, warning]
  );
  const current = records[0];

  let renderedToast = null;
  if (current) {
    const toastOptions = { ...current.options };
    delete toastOptions.id;
    delete toastOptions.onClose;
    renderedToast = (
      <ToastTimerResetContext.Provider value={current.revision}>
        <Toast
          {...toastOptions}
          key={current.key}
          open={current.open}
          onOpenChange={(nextOpen, details) => {
            if (!nextOpen) closeRecord(current.key, details);
          }}
        />
      </ToastTimerResetContext.Provider>
    );
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {renderedToast}
    </ToastContext.Provider>
  );
}

/**
 * Returns the FIFO Toast command API from the nearest {@link ToastProvider}.
 *
 * @public
 */
export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used within a ToastProvider");
  return toast;
}
