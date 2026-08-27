import type { HTMLAttributes, ReactNode, Ref } from "react";

import type { OverlayContainer } from "../overlayTypes";

export type ToastTone = "neutral" | "success" | "warning" | "danger";
export type ToastPosition = "top" | "center" | "bottom";

export type ToastAction = {
  closeOnPress?: boolean;
  label: ReactNode;
  onPress?: () => boolean | void | Promise<boolean | void>;
};

export type ToastOpenChangeDetails = { reason: "timeout" } | { reason: "action" };
export type ToastCloseDetails =
  ToastOpenChangeDetails | { reason: "programmatic" } | { reason: "clear" };

export type ToastProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-atomic" | "aria-live" | "children" | "dangerouslySetInnerHTML" | "role"
> & {
  action?: ToastAction;
  container?: OverlayContainer;
  defaultOpen?: boolean;
  duration?: number;
  forceMount?: boolean;
  icon?: ReactNode | null;
  message: ReactNode;
  onActionError?: (error: unknown) => void;
  onOpenChange?: (open: boolean, details: ToastOpenChangeDetails) => void;
  open?: boolean;
  position?: ToastPosition;
  ref?: Ref<HTMLDivElement>;
  tone?: ToastTone;
};

type WithoutOpenState<T> = Omit<T, "defaultOpen" | "onOpenChange" | "open">;

export type ToastShowOptions = WithoutOpenState<ToastProps> & {
  id?: string;
  onClose?: (details: ToastCloseDetails) => void;
};

export type ToastUpdateOptions = Partial<Omit<ToastShowOptions, "id">>;

export type ToastController = {
  close: () => void;
  id: string;
  update: (options: ToastUpdateOptions) => void;
};

export type ToastToneOptions = Omit<ToastShowOptions, "tone">;

export type ToastApi = {
  clear: () => void;
  danger: (options: ToastToneOptions) => ToastController;
  show: (options: ToastShowOptions) => ToastController;
  success: (options: ToastToneOptions) => ToastController;
  warning: (options: ToastToneOptions) => ToastController;
};

export type ToastProviderProps = {
  children: ReactNode;
};
