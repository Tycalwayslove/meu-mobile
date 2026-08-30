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
  /**
   * Whether a successful action requests closure; returning `false` from `onPress` still vetoes it.
   *
   * @defaultValue true
   */
  closeOnPress?: boolean;
  /** Visible native button label. */
  label: ReactNode;
  /** Runs after the action button is pressed. While its promise is pending, the button and timeout are paused; `false` vetoes closure. */
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
      /** A controller closed the record or its owning provider unmounted. */
      reason: "programmatic";
    }
  | {
      /** {@link ToastApi.clear} closed the record. */
      reason: "clear";
    }
  | {
      /** The provider rejected a new record or evicted a queued record after its capacity decreased. */
      reason: "overflow";
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
  /** Optional action rendered outside the live region; actionable Toasts remain visible for at least five seconds. */
  action?: ToastAction;
  /** Portal target override. `null` renders in place. */
  container?: OverlayContainer;
  /** Initial state for uncontrolled usage. */
  defaultOpen?: boolean;
  /**
   * Visible duration in milliseconds. `0` and negative values disable timeout closure, non-finite values use 3000, and larger finite values are capped at the browser timer limit.
   *
   * @defaultValue 3000
   */
  duration?: number;
  /** Keeps closed DOM mounted and hidden for integration or measurement. */
  forceMount?: boolean;
  /** Decorative icon; pass null to omit it. */
  icon?: ReactNode | null;
  /** Short feedback message announced by the live region. */
  message: ReactNode;
  /** Receives a current action's rejection value; rejected actions stay open and expose `data-action-error`. Obsolete runs are ignored after close, replacement, or unmount, and observer failures are contained. */
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
  /** Stable queue identity. Showing the same id fully replaces its options without changing queue position; an active replacement restarts its countdown and invalidates any pending prior action. Visible content updates immediately, while provider-owned live announcements coalesce to the latest message at most once per 500 ms; escalation from polite status to assertive alert bypasses that interval. */
  id?: string;
  /** Called exactly once when the provider record closes or a new record is rejected at capacity. */
  onClose?: (details: ToastCloseDetails) => void;
};

/**
 * Partial update accepted by a {@link ToastController}.
 *
 * @public
 */
export type ToastUpdateOptions = {
  /**
   * Each supplied field replaces the current value. Explicit `undefined` removes an optional field,
   * such as `action`, `onActionError`, or `onClose`.
   */
  [Key in keyof Omit<ToastShowOptions, "id">]?:
    Exclude<Omit<ToastShowOptions, "id">[Key], undefined> | undefined;
};

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
  /** Partially updates an active or queued record without changing its queue position; explicit `undefined` clears an optional field, and an active update restarts the countdown. Changing a visible message or its urgency follows the provider's 500 ms latest-value announcement contract. */
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
  /** React subtree that can call {@link useToast}. The provider renders visual updates immediately but rate-limits its managed live announcer to the latest message every 500 ms, except when escalating from polite status to assertive alert. */
  children: ReactNode;
  /**
   * Maximum provider-owned records, including the visible item, queued items, and a closing item awaiting removal. New unique records are rejected at the limit while same-id replacements remain accepted. Lowering the limit preserves the FIFO head, evicts newest queued records with reason `overflow`, and converges after their exit period. Finite values are truncated and clamped to 1–100.
   *
   * @defaultValue 20
   */
  maxToasts?: number;
};
