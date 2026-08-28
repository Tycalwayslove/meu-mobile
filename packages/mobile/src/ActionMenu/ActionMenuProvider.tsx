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

import { ActionMenu } from "./ActionMenu";
import type {
  ActionMenuApi,
  ActionMenuCloseDetails,
  ActionMenuController,
  ActionMenuProviderProps,
  ActionMenuShowOptions
} from "./types";

type ActionMenuRecord = {
  id: number;
  open: boolean;
  options: Omit<ActionMenuShowOptions, "onClose">;
};

const exitDuration = 180;
const ActionMenuContext = createContext<ActionMenuApi | null>(null);

export function ActionMenuProvider({ children }: ActionMenuProviderProps) {
  const [records, setRecords] = useState<ActionMenuRecord[]>([]);
  const activeIdsRef = useRef(new Set<number>());
  const closeCallbacksRef = useRef(
    new Map<number, ((details: ActionMenuCloseDetails) => void) | undefined>()
  );
  const nextIdRef = useRef(0);
  const removeTimersRef = useRef(new Map<number, number>());

  const closeRecord = useCallback((id: number, details: ActionMenuCloseDetails) => {
    if (!activeIdsRef.current.has(id)) return;
    activeIdsRef.current.delete(id);
    const onClose = closeCallbacksRef.current.get(id);
    closeCallbacksRef.current.delete(id);
    if (onClose) onClose(details);
    setRecords((current) =>
      current.map((record) => (record.id === id ? { ...record, open: false } : record))
    );
    if (!removeTimersRef.current.has(id)) {
      const timer = window.setTimeout(() => {
        removeTimersRef.current.delete(id);
        setRecords((current) => current.filter((record) => record.id !== id));
      }, exitDuration);
      removeTimersRef.current.set(id, timer);
    }
  }, []);

  const show = useCallback(
    (options: ActionMenuShowOptions): ActionMenuController => {
      nextIdRef.current += 1;
      const id = nextIdRef.current;
      const { onClose, ...menuOptions } = options;
      activeIdsRef.current.add(id);
      closeCallbacksRef.current.set(id, onClose);
      setRecords((current) => [...current, { id, open: true, options: menuOptions }]);
      return { close: () => closeRecord(id, { reason: "programmatic" }) };
    },
    [closeRecord]
  );

  const clear = useCallback(() => {
    Array.from(activeIdsRef.current).forEach((id) => closeRecord(id, { reason: "clear" }));
  }, [closeRecord]);

  useEffect(
    () => () => {
      removeTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      removeTimersRef.current.clear();
      closeCallbacksRef.current.forEach((onClose) => {
        if (onClose) onClose({ reason: "programmatic" });
      });
      closeCallbacksRef.current.clear();
      activeIdsRef.current.clear();
    },
    []
  );

  const api = useMemo<ActionMenuApi>(() => ({ clear, show }), [clear, show]);

  return (
    <ActionMenuContext.Provider value={api}>
      {children}
      {records.map((record) => (
        <ActionMenu
          {...record.options}
          key={record.id}
          open={record.open}
          onOpenChange={(nextOpen, details) => {
            if (!nextOpen) closeRecord(record.id, details);
          }}
        />
      ))}
    </ActionMenuContext.Provider>
  );
}

export function useActionMenu() {
  const actionMenu = useContext(ActionMenuContext);
  if (!actionMenu) {
    throw new Error("useActionMenu must be used within an ActionMenuProvider");
  }
  return actionMenu;
}
