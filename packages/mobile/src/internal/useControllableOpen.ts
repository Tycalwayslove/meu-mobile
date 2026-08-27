import { useCallback, useState } from "react";

import type { OverlayOpenChangeDetails } from "../overlayTypes";

type ControllableOpenOptions = {
  defaultOpen: boolean;
  onOpenChange?: ((open: boolean, details: OverlayOpenChangeDetails) => void) | undefined;
  open?: boolean | undefined;
};

export function useControllableOpen({ defaultOpen, onOpenChange, open }: ControllableOpenOptions) {
  const controlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedOpen = controlled ? open : uncontrolledOpen;

  const requestOpenChange = useCallback(
    (nextOpen: boolean, details: OverlayOpenChangeDetails) => {
      if (resolvedOpen === nextOpen) return;
      if (!controlled) setUncontrolledOpen(nextOpen);
      if (onOpenChange) onOpenChange(nextOpen, details);
    },
    [controlled, onOpenChange, resolvedOpen]
  );

  return [resolvedOpen, requestOpenChange] as const;
}
