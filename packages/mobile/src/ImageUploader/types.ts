import type {
  FocusEventHandler,
  HTMLAttributes,
  InputHTMLAttributes,
  Key,
  ReactElement,
  ReactNode,
  Ref
} from "react";

import type { ImageFit } from "../Image";

/**
 * Validation state displayed by an image uploader.
 *
 * @public
 */
export type ImageUploaderStatus = "default" | "error";
/**
 * Lifecycle state of one upload task.
 *
 * @public
 */
export type ImageUploaderTaskStatus = "pending" | "uploading" | "error";
/**
 * Operation that changed the completed item list.
 *
 * @public
 */
export type ImageUploaderChangeReason = "remove" | "upload";
/**
 * Validation stage that rejected one or more selected files.
 *
 * @public
 */
export type ImageUploaderRejectReason = "accept" | "before-upload" | "max-count" | "max-size";

/**
 * One completed image managed by {@link ImageUploader}.
 *
 * @public
 */
export type ImageUploaderItem = {
  /** Text alternative used by the thumbnail and full-screen preview. */
  alt: string;
  /** Stable React identity; when omitted, the uploader combines `url` and the item index. */
  key?: Key;
  /** Optional display or source filename retained for application use. */
  name?: string;
  /** Lightweight thumbnail URL; the full `url` is used when omitted. */
  thumbnailUrl?: string;
  /** Full image URL used by the preview viewer. */
  url: string;
};

/**
 * Progress and cancellation controls supplied to an upload callback.
 *
 * @public
 */
export type ImageUploaderUploadContext = {
  /** Reports percentage progress; values are clamped to the inclusive 0–100 range. */
  onProgress: (progress: number) => void;
  /** Aborts when the task is removed, replaced for retry, or the uploader unmounts. */
  signal: AbortSignal;
  /** Stable identifier for correlating this upload with queue updates. */
  taskId: string;
};

/**
 * Observable state for one pending, active, or failed upload.
 *
 * @public
 */
export type ImageUploaderTask = {
  /** Rejection value captured from the most recent failed upload attempt. */
  error?: unknown;
  /** File submitted to the upload callback, after any `beforeUpload` replacement. */
  file: File;
  /** Stable identifier accepted by the imperative `retry` method. */
  id: string;
  /** Filename displayed in progress and retry UI. */
  name: string;
  /** Temporary object URL used for a local preview when the browser supports it. */
  previewUrl?: string;
  /** Normalized upload percentage in the inclusive 0–100 range. */
  progress: number;
  /** Current lifecycle stage; failed tasks remain queued until retried, removed, or cleared. */
  status: ImageUploaderTaskStatus;
};

/**
 * Details reported after a completed item is added or removed.
 *
 * @public
 */
export type ImageUploaderChangeDetails = {
  /** Uploaded or removed item associated with the change. */
  item: ImageUploaderItem;
  /** Operation that produced the next item array. */
  reason: ImageUploaderChangeReason;
};

/**
 * Files accepted and rejected at one validation stage.
 *
 * @public
 */
export type ImageUploaderRejectDetails = {
  /** Files that remain eligible after this rejection stage. */
  accepted: readonly File[];
  /** Complete selection from the native file input. */
  files: readonly File[];
  /** Validation stage that rejected the files. */
  reason: ImageUploaderRejectReason;
  /** Files rejected at this validation stage. */
  rejected: readonly File[];
};

/**
 * Imperative handle exposed by {@link ImageUploader}.
 *
 * @public
 */
export type ImageUploaderRef = {
  /** Opens the native file chooser unless the uploader is disabled or read-only. */
  chooseFiles: () => void;
  /** Aborts and removes every failed task from the queue. */
  clearFailed: () => void;
  /** Current native file input, including when the visible upload tile is hidden. */
  input: HTMLInputElement | null;
  /** Current uploader group element. */
  nativeElement: HTMLDivElement | null;
  /** Restarts a failed task unless disabled, read-only, or external values have overfilled capacity. */
  retry: (taskId: string) => void;
};

/**
 * Props for an asynchronous image upload queue and preview grid.
 *
 * @public
 */
export type ImageUploaderProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onBlur" | "onChange" | "onError" | "onProgress"
> & {
  /** Native file-accept filter and client-side validation rule. @defaultValue "image/*" */
  accept?: string;
  /** Visible and accessible label for adding an image. Defaults to localized text. */
  addLabel?: string;
  /** Transforms each accepted file before upload; returning `null` or rejecting rejects that file. */
  beforeUpload?: (file: File, files: readonly File[]) => File | null | Promise<File | null>;
  /** Native capture hint for camera- or microphone-capable file inputs. */
  capture?: InputHTMLAttributes<HTMLInputElement>["capture"];
  /** Grid column count, floored and clamped from 1 through 8. @defaultValue 4 */
  columns?: number;
  /** Initial completed items when `value` is uncontrolled. @defaultValue [] */
  defaultValue?: readonly ImageUploaderItem[];
  /** Shows remove controls for completed items. @defaultValue true */
  deletable?: boolean;
  /** Blocks choosing, previewing, deleting, canceling, and retrying. @defaultValue false */
  disabled?: boolean;
  /** CSS `object-fit` used for completed and pending thumbnails. @defaultValue "cover" */
  imageFit?: ImageFit;
  /** Maximum completed-plus-queued item count; finite non-negative values are floored and failed tasks reserve capacity. */
  maxCount?: number;
  /** Byte limit, or predicate returning `true` when a file must be rejected. */
  maxSize?: number | ((file: File) => boolean);
  /** Allows the native file chooser to select more than one file. @defaultValue false */
  multiple?: boolean;
  /** Native form field name assigned to the file input. */
  name?: string;
  /** Receives blur from the visually hidden native file input. */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /** Called after a completed upload is added or a completed item is removed; controlled consumers must update `value`. */
  onChange?: (items: ImageUploaderItem[], details: ImageUploaderChangeDetails) => void;
  /** Called with the number of otherwise accepted files that exceed remaining `maxCount` capacity. */
  onCountExceed?: (exceed: number) => void;
  /** Runs before removing a completed item; returning `false` or rejecting prevents removal. Stable item keys are required across async controlled-list reorders. */
  onDelete?: (item: ImageUploaderItem) => boolean | void | Promise<boolean | void>;
  /** Called after a completed thumbnail opens the built-in viewer. */
  onPreview?: (item: ImageUploaderItem, index: number) => void;
  /** Called for each validation stage, rejected preprocessing hook, or capacity-blocked retry. */
  onReject?: (details: ImageUploaderRejectDetails) => void;
  /** Called whenever pending, uploading, or failed task state changes. */
  onUploadQueueChange?: (tasks: readonly ImageUploaderTask[]) => void;
  /** Makes completed thumbnails open the built-in full-screen viewer. @defaultValue true */
  preview?: boolean;
  /** Blocks add, delete, cancel, and retry actions while retaining preview access. @defaultValue false */
  readOnly?: boolean;
  /** Imperative handle for the native input, queue cleanup, and retries. */
  ref?: Ref<ImageUploaderRef>;
  /** Replaces a completed item's tile; receives the default tile, item, and zero-based index. */
  renderItem?: (originNode: ReactElement, item: ImageUploaderItem, index: number) => ReactNode;
  /** Replaces the add tile; render the supplied native input to preserve chooser and form behavior. */
  renderUpload?: (input: ReactElement) => ReactNode;
  /** Label for failed-task retry buttons. Defaults to localized text. */
  retryLabel?: string;
  /** Keeps failed tasks visible and reserved for retry; false discards failures and releases their capacity. @defaultValue true */
  showFailed?: boolean;
  /** Shows the visible add tile when capacity remains; the native input stays mounted when hidden. @defaultValue true */
  showUpload?: boolean;
  /**
   * Visual validation state. `error` exposes `aria-invalid="true"` on the uploader group and
   * overrides a caller grammar, spelling, true, or false token.
   *
   * @defaultValue "default"
   */
  status?: ImageUploaderStatus;
  /** Uploads one validated file; public item fields are runtime-validated and copied, while rejection or a malformed item retains a failed task. */
  upload: (file: File, context: ImageUploaderUploadContext) => Promise<ImageUploaderItem>;
  /** Controlled completed items; pair with `onChange` to accept uploads and removals. */
  value?: readonly ImageUploaderItem[];
};
