import type { HTMLAttributes, ReactNode, Ref } from "react";

import type { OverlayContainer } from "../overlayTypes";

/** Semantic visual tone and live-region urgency for Toast. */
export type ToastTone = "neutral" | "success" | "warning" | "danger";
/** Viewport placement for Toast. */
export type ToastPosition = "top" | "center" | "bottom";

/** Optional action rendered beside a Toast message. */
export type ToastAction = {
  /** Keeps the Toast open after a successful action when false. */
  closeOnPress?: boolean;
  /** Visible native button label. */
  label: ReactNode;
  /** Action handler. Returning false vetoes close; rejection is reported through `onActionError`. */
  onPress?: () => boolean | void | Promise<boolean | void>;
};

/** Reasons emitted by a declarative Toast close request. */
export type ToastOpenChangeDetails = { reason: "timeout" } | { reason: "action" };
/** Reasons emitted by provider-owned Toast records. */
export type ToastCloseDetails =
  ToastOpenChangeDetails | { reason: "programmatic" } | { reason: "clear" };

/**
 * Properties accepted by one declarative Toast component.
 *
 * @public
 */
export type ToastProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-atomic" | "aria-live" | "children" | "dangerouslySetInnerHTML" | "role"
> & {
  /** Optional action; actionable Toasts remain visible for at least five seconds. */
  action?: ToastAction;
  /** Portal target override. `null` renders in place. */
  container?: OverlayContainer;
  /** Initial state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Visible duration in milliseconds; zero disables timeout closing. */
  duration?: number;
  /** Keeps closed DOM mounted and hidden for integration or measurement. */
  forceMount?: boolean;
  /** Decorative icon; pass null to omit it. */
  icon?: ReactNode | null;
  /** Short feedback message announced by the live region. */
  message: ReactNode;
  /** Receives action rejection values; rejected actions stay open and expose `data-action-error`. */
  onActionError?: (error: unknown) => void;
  /** Receives declarative close intent. */
  onOpenChange?: (open: boolean, details: ToastOpenChangeDetails) => void;
  /** Controlled open state. */
  open?: boolean;
  /** Viewport position. */
  position?: ToastPosition;
  /** Toast root ref. */
  ref?: Ref<HTMLDivElement>;
  /** Visual and announcement urgency. */
  tone?: ToastTone;
};

type WithoutOpenState<T> = Omit<T, "defaultOpen" | "onOpenChange" | "open">;

/** Options accepted by {@link ToastApi.show}. */
export type ToastShowOptions = WithoutOpenState<ToastProps> & {
  /** Stable queue identity; showing the same active id updates instead of enqueueing. */
  id?: string;
  /** Called exactly once when the provider record closes. */
  onClose?: (details: ToastCloseDetails) => void;
};

/** Partial update accepted by a {@link ToastController}. */
export type ToastUpdateOptions = Partial<Omit<ToastShowOptions, "id">>;

/** Controller for one provider-owned Toast record. */
export type ToastController = {
  /** Closes the active or queued record programmatically. */
  close: () => void;
  /** Stable record id. */
  id: string;
  /** Updates an active record without changing its queue position. */
  update: (options: ToastUpdateOptions) => void;
};

/** Tone-specific show options. */
export type ToastToneOptions = Omit<ToastShowOptions, "tone">;

/** FIFO command API exposed by {@link ToastProvider}. */
export type ToastApi = {
  clear: () => void;
  danger: (options: ToastToneOptions) => ToastController;
  show: (options: ToastShowOptions) => ToastController;
  success: (options: ToastToneOptions) => ToastController;
  warning: (options: ToastToneOptions) => ToastController;
};

/** Props for {@link ToastProvider}. */
export type ToastProviderProps = {
  /** React subtree that can call {@link useToast}. */
  children: ReactNode;
};
