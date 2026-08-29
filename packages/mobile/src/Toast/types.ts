import type { HTMLAttributes, ReactNode, Ref } from "react";

import type { OverlayContainer } from "../overlayTypes";

/**
 * Semantic visual tone and live-region urgency for Toast.
 *
 * @public
 */
export type ToastTone = "neutral" | "success" | "warning" | "danger";
/**
 * Viewport placement for Toast.
 *
 * @public
 */
export type ToastPosition = "top" | "center" | "bottom";

/**
 * Optional action rendered beside a Toast message.
 *
 * @public
 */
export type ToastAction = {
  /** Keeps the Toast open after a successful action when false. */
  closeOnPress?: boolean;
  /** Visible native button label. */
  label: ReactNode;
  /** Action handler. Returning false vetoes close; rejection is reported through `onActionError`. */
  onPress?: () => boolean | void | Promise<boolean | void>;
};

/**
 * Reasons emitted by a declarative Toast close request.
 *
 * @public
 */
export type ToastOpenChangeDetails =
  | {
      /** Automatic duration expiry requested closure. */
      reason: "timeout";
    }
  | {
      /** A successful action requested closure. */
      reason: "action";
    };
/**
 * Reasons emitted by provider-owned Toast records.
 *
 * @public
 */
export type ToastCloseDetails =
  | ToastOpenChangeDetails
  | {
      /** A controller explicitly closed the record. */
      reason: "programmatic";
    }
  | {
      /** {@link ToastApi.clear} closed the record. */
      reason: "clear";
    };

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

/**
 * Options accepted by {@link ToastApi.show}.
 *
 * @public
 */
export type ToastShowOptions = WithoutOpenState<ToastProps> & {
  /** Stable queue identity; showing the same active id updates instead of enqueueing. */
  id?: string;
  /** Called exactly once when the provider record closes. */
  onClose?: (details: ToastCloseDetails) => void;
};

/**
 * Partial update accepted by a {@link ToastController}.
 *
 * @public
 */
export type ToastUpdateOptions = Partial<Omit<ToastShowOptions, "id">>;

/**
 * Controller for one provider-owned Toast record.
 *
 * @public
 */
export type ToastController = {
  /** Closes the active or queued record programmatically. */
  close: () => void;
  /** Stable record id. */
  id: string;
  /** Updates an active record without changing its queue position. */
  update: (options: ToastUpdateOptions) => void;
};

/**
 * Options for a Toast API method that fixes the visual tone.
 *
 * @public
 */
export type ToastToneOptions = Omit<ToastShowOptions, "tone">;

/**
 * FIFO command API exposed by {@link ToastProvider}.
 *
 * @public
 */
export type ToastApi = {
  /** Closes every active and queued provider record with reason `clear`. */
  clear: () => void;
  /** Enqueues or updates a danger-tone Toast and returns its controller. */
  danger: (options: ToastToneOptions) => ToastController;
  /** Enqueues or updates a Toast and returns its controller. */
  show: (options: ToastShowOptions) => ToastController;
  /** Enqueues or updates a success-tone Toast and returns its controller. */
  success: (options: ToastToneOptions) => ToastController;
  /** Enqueues or updates a warning-tone Toast and returns its controller. */
  warning: (options: ToastToneOptions) => ToastController;
};

/**
 * Props for {@link ToastProvider}.
 *
 * @public
 */
export type ToastProviderProps = {
  /** React subtree that can call {@link useToast}. */
  children: ReactNode;
};
