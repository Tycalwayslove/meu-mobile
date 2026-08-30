import { createContext } from "react";
import type { ReactNode } from "react";

import type { ToastTone } from "./types";

export type ToastAnnouncement = {
  key: number;
  message: ReactNode;
  sequence: number;
  tone: ToastTone;
};

/**
 * `undefined` keeps the declarative Toast live region behavior. ToastProvider
 * supplies `null` while its managed announcer is primed and an announcement
 * object when the provider's rate limiter publishes the latest message.
 */
export const ToastAnnouncementContext = createContext<ToastAnnouncement | null | undefined>(
  undefined
);
