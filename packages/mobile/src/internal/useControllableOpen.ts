import { useCallback, useState } from "react";

type ControllableOpenOptions<TDetails> = {
  defaultOpen: boolean;
  onOpenChange?: ((open: boolean, details: TDetails) => void) | undefined;
  open?: boolean | undefined;
};

export function useControllableOpen<TDetails>({
  defaultOpen,
  onOpenChange,
  open
}: ControllableOpenOptions<TDetails>) {
  const controlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedOpen = controlled ? open : uncontrolledOpen;

  const requestOpenChange = useCallback(
    (nextOpen: boolean, details: TDetails) => {
      if (resolvedOpen === nextOpen) return;
      if (!controlled) setUncontrolledOpen(nextOpen);
      if (onOpenChange) onOpenChange(nextOpen, details);
    },
    [controlled, onOpenChange, resolvedOpen]
  );

  return [resolvedOpen, requestOpenChange] as const;
}
