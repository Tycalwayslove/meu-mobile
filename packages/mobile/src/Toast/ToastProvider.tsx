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

type ToastRecord = {
  key: number;
  open: boolean;
  options: ToastShowOptions;
};

const exitDuration = 180;
const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: ToastProviderProps) {
  const [records, setRecords] = useState<ToastRecord[]>([]);
  const activeKeysRef = useRef(new Set<number>());
  const idToKeyRef = useRef(new Map<string, number>());
  const keyToIdRef = useRef(new Map<number, string>());
  const nextKeyRef = useRef(0);
  const optionsRef = useRef(new Map<number, ToastShowOptions>());
  const removeTimersRef = useRef(new Map<number, number>());

  const removeRecordLater = useCallback((key: number) => {
    if (removeTimersRef.current.has(key)) return;
    const timer = window.setTimeout(() => {
      removeTimersRef.current.delete(key);
      setRecords((currentRecords) => currentRecords.filter((record) => record.key !== key));
    }, exitDuration);
    removeTimersRef.current.set(key, timer);
  }, []);

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
      if (onClose) onClose(details);

      setRecords((currentRecords) =>
        currentRecords.map((record) => (record.key === key ? { ...record, open: false } : record))
      );
      removeRecordLater(key);
    },
    [removeRecordLater]
  );

  const updateRecord = useCallback((key: number, options: ToastUpdateOptions) => {
    if (!activeKeysRef.current.has(key)) return;
    const currentOptions = optionsRef.current.get(key);
    if (!currentOptions) return;
    const nextOptions = { ...currentOptions, ...options };
    optionsRef.current.set(key, nextOptions);
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.key === key ? { ...record, options: nextOptions } : record
      )
    );
  }, []);

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
          updateRecord(existingKey, options);
          return createController(requestedId, existingKey);
        }
      }

      nextKeyRef.current += 1;
      const key = nextKeyRef.current;
      const id = requestedId === undefined ? `meu-toast-${key}` : requestedId;
      activeKeysRef.current.add(key);
      idToKeyRef.current.set(id, key);
      keyToIdRef.current.set(key, id);
      optionsRef.current.set(key, options);
      setRecords((currentRecords) => [...currentRecords, { key, open: true, options }]);
      return createController(id, key);
    },
    [createController, updateRecord]
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

  useEffect(
    () => () => {
      removeTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      removeTimersRef.current.clear();
      activeKeysRef.current.forEach((key) => {
        const currentOptions = optionsRef.current.get(key);
        const onClose = currentOptions ? currentOptions.onClose : undefined;
        if (onClose) onClose({ reason: "programmatic" });
      });
      activeKeysRef.current.clear();
      idToKeyRef.current.clear();
      keyToIdRef.current.clear();
      optionsRef.current.clear();
    },
    []
  );

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
      <Toast
        {...toastOptions}
        key={current.key}
        open={current.open}
        onOpenChange={(nextOpen, details) => {
          if (!nextOpen) closeRecord(current.key, details);
        }}
      />
    );
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {renderedToast}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used within a ToastProvider");
  return toast;
}
