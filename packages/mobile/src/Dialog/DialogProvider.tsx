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
import { Dialog } from "./Dialog";
import type {
  DialogAlertOptions,
  DialogApi,
  DialogConfirmOptions,
  DialogController,
  DialogOpenChangeDetails,
  DialogProviderProps,
  DialogShowOptions
} from "./types";

type InternalDismissDetails = DialogOpenChangeDetails | { reason: "programmatic" };

type DialogRecord = {
  id: number;
  open: boolean;
  options: DialogShowOptions;
};

type Lifecycle = {
  onDismiss?: ((details: InternalDismissDetails) => void) | undefined;
  onProviderUnmount?: (() => void) | undefined;
};

const exitDuration = 180;
const DialogContext = createContext<DialogApi | null>(null);

/**
 * Provides the imperative dialog API to its React subtree.
 *
 * @public
 */
export function DialogProvider({ children }: DialogProviderProps) {
  const config = useMeuConfig();
  const [records, setRecords] = useState<DialogRecord[]>([]);
  const activeIdsRef = useRef(new Set<number>());
  const dismissCallbacksRef = useRef(
    new Map<number, ((details: InternalDismissDetails) => void) | undefined>()
  );
  const dismissDetailsRef = useRef(new Map<number, InternalDismissDetails>());
  const nextIdRef = useRef(0);
  const removeTimersRef = useRef(new Map<number, number>());
  const unmountCallbacksRef = useRef(new Map<number, (() => void) | undefined>());

  const closeRecord = useCallback((id: number, details: InternalDismissDetails) => {
    if (!activeIdsRef.current.has(id)) return;
    activeIdsRef.current.delete(id);
    dismissDetailsRef.current.set(id, details);

    setRecords((currentRecords) =>
      currentRecords.map((record) => (record.id === id ? { ...record, open: false } : record))
    );
  }, []);

  const settleClosedRecord = useCallback((id: number) => {
    const details = dismissDetailsRef.current.get(id);
    if (details === undefined) return;
    dismissDetailsRef.current.delete(id);
    const onDismiss = dismissCallbacksRef.current.get(id);
    dismissCallbacksRef.current.delete(id);
    unmountCallbacksRef.current.delete(id);
    if (onDismiss) onDismiss(details);

    if (!removeTimersRef.current.has(id)) {
      const timer = window.setTimeout(() => {
        removeTimersRef.current.delete(id);
        setRecords((currentRecords) => currentRecords.filter((record) => record.id !== id));
      }, exitDuration);
      removeTimersRef.current.set(id, timer);
    }
  }, []);

  const showInternal = useCallback(
    (options: DialogShowOptions, lifecycle: Lifecycle = {}): DialogController => {
      nextIdRef.current += 1;
      const id = nextIdRef.current;
      activeIdsRef.current.add(id);
      dismissCallbacksRef.current.set(id, lifecycle.onDismiss);
      unmountCallbacksRef.current.set(id, lifecycle.onProviderUnmount);
      setRecords((currentRecords) => [...currentRecords, { id, open: true, options }]);
      return { close: () => closeRecord(id, { reason: "programmatic" }) };
    },
    [closeRecord]
  );

  const show = useCallback((options: DialogShowOptions) => showInternal(options), [showInternal]);

  const alert = useCallback(
    (options: DialogAlertOptions) =>
      new Promise<void>((resolve) => {
        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        const { confirmText, onConfirm, ...dialogOptions } = options;
        showInternal(
          {
            ...dialogOptions,
            actions: [
              {
                autoFocus: true,
                key: "confirm",
                label: confirmText || (config.locale === "en-US" ? "OK" : "我知道了"),
                onPress: async () => {
                  return onConfirm ? await onConfirm() : undefined;
                },
                tone: "accent"
              }
            ]
          },
          {
            onDismiss: settle,
            onProviderUnmount: settle
          }
        );
      }),
    [config.locale, showInternal]
  );

  const confirm = useCallback(
    (options: DialogConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        let settled = false;
        const settle = (result: boolean) => {
          if (settled) return;
          settled = true;
          resolve(result);
        };
        const {
          cancelText,
          confirmText,
          confirmTone = "accent",
          onCancel,
          onConfirm,
          ...dialogOptions
        } = options;
        showInternal(
          {
            ...dialogOptions,
            actions: [
              {
                autoFocus: true,
                key: "cancel",
                label: cancelText || (config.locale === "en-US" ? "Cancel" : "取消"),
                onPress: async () => {
                  return onCancel ? await onCancel() : undefined;
                },
                tone: "neutral"
              },
              {
                key: "confirm",
                label: confirmText || (config.locale === "en-US" ? "Confirm" : "确认"),
                onPress: async () => {
                  return onConfirm ? await onConfirm() : undefined;
                },
                tone: confirmTone
              }
            ]
          },
          {
            onDismiss: (details) => {
              settle(details.reason === "action" && details.actionKey === "confirm");
            },
            onProviderUnmount: () => settle(false)
          }
        );
      }),
    [config.locale, showInternal]
  );

  const clear = useCallback(() => {
    Array.from(activeIdsRef.current).forEach((id) => closeRecord(id, { reason: "programmatic" }));
  }, [closeRecord]);

  useEffect(() => {
    records.forEach((record) => {
      if (!record.open) settleClosedRecord(record.id);
    });
  }, [records, settleClosedRecord]);

  useEffect(
    () => () => {
      removeTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      removeTimersRef.current.clear();
      unmountCallbacksRef.current.forEach((onProviderUnmount) => {
        if (onProviderUnmount) onProviderUnmount();
      });
      unmountCallbacksRef.current.clear();
      dismissCallbacksRef.current.clear();
      dismissDetailsRef.current.clear();
      activeIdsRef.current.clear();
    },
    []
  );

  const api = useMemo<DialogApi>(
    () => ({ alert, clear, confirm, show }),
    [alert, clear, confirm, show]
  );

  return (
    <DialogContext.Provider value={api}>
      {children}
      {records.map((record) => (
        <Dialog
          {...record.options}
          key={record.id}
          open={record.open}
          onOpenChange={(nextOpen, details) => {
            if (!nextOpen) closeRecord(record.id, details);
          }}
        />
      ))}
    </DialogContext.Provider>
  );
}

/**
 * Returns the imperative dialog API from the nearest provider.
 *
 * @public
 */
export function useDialog() {
  const dialog = useContext(DialogContext);
  if (!dialog) throw new Error("useDialog must be used within a DialogProvider");
  return dialog;
}
