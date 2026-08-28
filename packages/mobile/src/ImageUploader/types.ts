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

export type ImageUploaderStatus = "default" | "error";
export type ImageUploaderTaskStatus = "pending" | "uploading" | "error";
export type ImageUploaderChangeReason = "remove" | "upload";
export type ImageUploaderRejectReason = "accept" | "before-upload" | "max-count" | "max-size";

export type ImageUploaderItem = {
  alt: string;
  key?: Key;
  name?: string;
  thumbnailUrl?: string;
  url: string;
};

export type ImageUploaderUploadContext = {
  onProgress: (progress: number) => void;
  signal: AbortSignal;
  taskId: string;
};

export type ImageUploaderTask = {
  error?: unknown;
  file: File;
  id: string;
  name: string;
  previewUrl?: string;
  progress: number;
  status: ImageUploaderTaskStatus;
};

export type ImageUploaderChangeDetails = {
  item: ImageUploaderItem;
  reason: ImageUploaderChangeReason;
};

export type ImageUploaderRejectDetails = {
  accepted: readonly File[];
  files: readonly File[];
  reason: ImageUploaderRejectReason;
  rejected: readonly File[];
};

export type ImageUploaderRef = {
  chooseFiles: () => void;
  clearFailed: () => void;
  input: HTMLInputElement | null;
  nativeElement: HTMLDivElement | null;
  retry: (taskId: string) => void;
};

export type ImageUploaderProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onBlur" | "onChange" | "onError" | "onProgress"
> & {
  accept?: string;
  addLabel?: string;
  beforeUpload?: (file: File, files: readonly File[]) => File | null | Promise<File | null>;
  capture?: InputHTMLAttributes<HTMLInputElement>["capture"];
  columns?: number;
  defaultValue?: readonly ImageUploaderItem[];
  deletable?: boolean;
  disabled?: boolean;
  imageFit?: ImageFit;
  maxCount?: number;
  maxSize?: number | ((file: File) => boolean);
  multiple?: boolean;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: (items: ImageUploaderItem[], details: ImageUploaderChangeDetails) => void;
  onCountExceed?: (exceed: number) => void;
  onDelete?: (item: ImageUploaderItem) => boolean | void | Promise<boolean | void>;
  onPreview?: (item: ImageUploaderItem, index: number) => void;
  onReject?: (details: ImageUploaderRejectDetails) => void;
  onUploadQueueChange?: (tasks: readonly ImageUploaderTask[]) => void;
  preview?: boolean;
  readOnly?: boolean;
  ref?: Ref<ImageUploaderRef>;
  renderItem?: (originNode: ReactElement, item: ImageUploaderItem, index: number) => ReactNode;
  renderUpload?: (input: ReactElement) => ReactNode;
  retryLabel?: string;
  showFailed?: boolean;
  showUpload?: boolean;
  status?: ImageUploaderStatus;
  upload: (file: File, context: ImageUploaderUploadContext) => Promise<ImageUploaderItem>;
  value?: readonly ImageUploaderItem[];
};
