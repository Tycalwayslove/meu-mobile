import { useEffect, useState } from "react";

export type OverlayVisualState = "closed" | "open";

const exitDuration = 160;

export function useOverlayPresence(open: boolean, forceMount: boolean) {
  const [present, setPresent] = useState(open);
  const [visualState, setVisualState] = useState<OverlayVisualState>(open ? "open" : "closed");

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    let exitTimer = 0;

    if (open) {
      firstFrame = window.requestAnimationFrame(() => {
        setPresent(true);
        secondFrame = window.requestAnimationFrame(() => setVisualState("open"));
      });
    } else {
      firstFrame = window.requestAnimationFrame(() => {
        setVisualState("closed");
        exitTimer = window.setTimeout(() => setPresent(false), exitDuration);
      });
    }

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(exitTimer);
    };
  }, [open]);

  return {
    hidden: forceMount && !present,
    shouldRender: forceMount || open || present,
    visualState
  };
}
