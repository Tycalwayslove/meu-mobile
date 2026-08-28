"use client";

import { MeuIconPlus, MeuIconX } from "@meu/icons-react";
import {
  Fragment,
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import type { CSSProperties, ChangeEvent, ReactElement } from "react";

import { useMeuConfig } from "../ConfigProvider";
import { useFieldContext } from "../Field/FieldContext";
import { Image } from "../Image";
import { ImageViewer } from "../ImageViewer";
import {
  actionButton,
  cell,
  cellContent,
  nativeInput,
  previewButton,
  progressFill,
  progressTrack,
  retryButton,
  root,
  staticPreview,
  taskMask,
  uploadButton,
  uploadIcon
} from "./ImageUploader.css";
import type {
  ImageUploaderItem,
  ImageUploaderProps,
  ImageUploaderRef,
  ImageUploaderRejectReason,
  ImageUploaderTask
} from "./types";

type InternalTask = ImageUploaderTask & { controller: AbortController; objectUrl?: string };
type RootStyle = CSSProperties & { "--meu-image-uploader-columns"?: number };
type ProgressStyle = CSSProperties & { "--meu-image-uploader-progress"?: number };

function normalizeColumns(columns: number | undefined) {
  if (!columns || !Number.isFinite(columns)) return 4;
  return Math.min(8, Math.max(1, Math.floor(columns)));
}

function normalizeProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(100, Math.max(0, progress));
}

function fileMatchesAccept(file: File, accept: string) {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return fileName.endsWith(rule);
    if (rule.endsWith("/*")) return fileType.startsWith(rule.slice(0, -1));
    return fileType === rule;
  });
}

function isOversize(file: File, maxSize: ImageUploaderProps["maxSize"]) {
  if (typeof maxSize === "function") return maxSize(file);
  return typeof maxSize === "number" && Number.isFinite(maxSize) && file.size > maxSize;
}

function itemKey(item: ImageUploaderItem, index: number) {
  return item.key === undefined ? `${item.url}-${index}` : item.key;
}

export const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  function ImageUploader(
    {
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      accept = "image/*",
      addLabel,
      beforeUpload,
      capture,
      className,
      columns,
      defaultValue = [],
      deletable = true,
      disabled = false,
      id,
      imageFit = "cover",
      maxCount,
      maxSize,
      multiple = false,
      name,
      onBlur,
      onChange,
      onCountExceed,
      onDelete,
      onPreview,
      onReject,
      onUploadQueueChange,
      preview = true,
      readOnly = false,
      renderItem,
      renderUpload,
      retryLabel,
      showFailed = true,
      showUpload = true,
      status = "default",
      style,
      upload,
      value,
      ...props
    },
    ref
  ) {
    const config = useMeuConfig();
    const fieldContext = useFieldContext();
    const generatedId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const taskCounterRef = useRef(0);
    const controlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<ImageUploaderItem[]>(() => [
      ...defaultValue
    ]);
    const items = controlled ? [...value] : uncontrolledValue;
    const itemsRef = useRef(items);
    const [tasks, setTasks] = useState<InternalTask[]>([]);
    const tasksRef = useRef(tasks);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [deletingKeys, setDeletingKeys] = useState<Set<string>>(() => new Set());
    const resolvedId =
      id || (fieldContext ? fieldContext.controlId : `meu-image-uploader-${generatedId}`);
    const describedBy = ariaDescribedBy || (fieldContext ? fieldContext.describedBy : undefined);
    const labelledBy = ariaLabelledBy || (fieldContext ? fieldContext.labelId : undefined);
    const invalid =
      ariaInvalid === true ||
      ariaInvalid === "true" ||
      status === "error" ||
      Boolean(fieldContext && fieldContext.invalid);
    const localizedAddLabel = addLabel || (config.locale === "en-US" ? "Add image" : "添加图片");
    const localizedRetryLabel = retryLabel || (config.locale === "en-US" ? "Retry" : "重试");
    const localizedRemoveLabel = config.locale === "en-US" ? "Remove" : "删除";
    const resolvedColumns = normalizeColumns(columns);
    const activeTaskCount = tasks.filter((task) => task.status !== "error").length;
    const count = items.length + activeTaskCount;
    const atLimit = typeof maxCount === "number" && maxCount >= 0 && count >= maxCount;
    const canUpload = showUpload && !atLimit;
    const rootStyle: RootStyle = { ...style, "--meu-image-uploader-columns": resolvedColumns };

    itemsRef.current = items;
    tasksRef.current = tasks;

    const viewerImages = items.map((item) => ({
      alt: item.alt,
      src: item.url,
      ...(item.key === undefined ? {} : { key: item.key })
    }));

    function publish(
      nextItems: ImageUploaderItem[],
      item: ImageUploaderItem,
      reason: "upload" | "remove"
    ) {
      itemsRef.current = nextItems;
      if (!controlled) setUncontrolledValue(nextItems);
      if (onChange) onChange(nextItems, { item, reason });
    }

    function revokeTaskUrl(task: InternalTask) {
      if (task.objectUrl && typeof URL !== "undefined" && URL.revokeObjectURL) {
        URL.revokeObjectURL(task.objectUrl);
      }
    }

    function removeTask(taskId: string, abort = true) {
      setTasks((current) => {
        const target = current.find((task) => task.id === taskId);
        if (target) {
          if (abort) target.controller.abort();
          revokeTaskUrl(target);
        }
        return current.filter((task) => task.id !== taskId);
      });
    }

    function reportReject(
      reason: ImageUploaderRejectReason,
      files: readonly File[],
      accepted: readonly File[],
      rejected: readonly File[]
    ) {
      if (onReject) onReject({ accepted, files, reason, rejected });
    }

    async function runUpload(task: InternalTask) {
      setTasks((current) =>
        current.map((entry) =>
          entry.id === task.id
            ? { ...entry, error: undefined, progress: 0, status: "uploading" }
            : entry
        )
      );
      try {
        const result = await upload(task.file, {
          onProgress: (progress) => {
            const nextProgress = normalizeProgress(progress);
            setTasks((current) =>
              current.map((entry) =>
                entry.id === task.id ? { ...entry, progress: nextProgress } : entry
              )
            );
          },
          signal: task.controller.signal,
          taskId: task.id
        });
        if (task.controller.signal.aborted) return;
        const nextItems = [...itemsRef.current, result];
        publish(nextItems, result, "upload");
        removeTask(task.id, false);
      } catch (error) {
        if (task.controller.signal.aborted) return;
        setTasks((current) =>
          current.map((entry) =>
            entry.id === task.id ? { ...entry, error, status: "error" } : entry
          )
        );
      }
    }

    function createTask(file: File) {
      const idValue = `${generatedId}-${taskCounterRef.current++}`;
      const controller = new AbortController();
      let objectUrl: string | undefined;
      if (typeof URL !== "undefined" && URL.createObjectURL) objectUrl = URL.createObjectURL(file);
      const task: InternalTask = {
        controller,
        file,
        id: idValue,
        name: file.name,
        progress: 0,
        status: "pending",
        ...(objectUrl ? { objectUrl, previewUrl: objectUrl } : {})
      };
      setTasks((current) => [...current, task]);
      void runUpload(task);
    }

    async function handleSelection(event: ChangeEvent<HTMLInputElement>) {
      const input = event.currentTarget;
      const selected = input.files ? Array.from(input.files) : [];
      input.value = "";
      if (selected.length === 0) return;

      const acceptRejected = selected.filter((file) => !fileMatchesAccept(file, accept));
      let accepted = selected.filter((file) => fileMatchesAccept(file, accept));
      if (acceptRejected.length > 0) reportReject("accept", selected, accepted, acceptRejected);

      const sizeRejected = accepted.filter((file) => isOversize(file, maxSize));
      if (sizeRejected.length > 0) {
        accepted = accepted.filter((file) => !sizeRejected.includes(file));
        reportReject("max-size", selected, accepted, sizeRejected);
      }

      if (beforeUpload && accepted.length > 0) {
        const processed = await Promise.all(
          accepted.map(async (file) => ({
            original: file,
            result: await beforeUpload(file, accepted)
          }))
        );
        const beforeRejected = processed
          .filter((entry) => !entry.result)
          .map((entry) => entry.original);
        accepted = processed
          .map((entry) => entry.result)
          .filter((file): file is File => Boolean(file));
        if (beforeRejected.length > 0) {
          reportReject("before-upload", selected, accepted, beforeRejected);
        }
      }

      if (typeof maxCount === "number" && maxCount >= 0) {
        const available = Math.max(0, maxCount - count);
        if (accepted.length > available) {
          const rejected = accepted.slice(available);
          accepted = accepted.slice(0, available);
          const exceed = rejected.length;
          if (onCountExceed) onCountExceed(exceed);
          reportReject("max-count", selected, accepted, rejected);
        }
      }

      accepted.forEach(createTask);
    }

    function retryTask(taskId: string) {
      const previous = tasksRef.current.find((task) => task.id === taskId);
      if (!previous || previous.status !== "error" || disabled || readOnly) return;
      previous.controller.abort();
      const nextTask: InternalTask = {
        ...previous,
        controller: new AbortController(),
        error: undefined
      };
      setTasks((current) => current.map((task) => (task.id === taskId ? nextTask : task)));
      void runUpload(nextTask);
    }

    async function requestDelete(item: ImageUploaderItem) {
      const currentIndex = itemsRef.current.indexOf(item);
      const deletionKey = String(itemKey(item, currentIndex));
      if (deletingKeys.has(deletionKey)) return;
      setDeletingKeys((current) => new Set(current).add(deletionKey));
      try {
        const result = onDelete ? await onDelete(item) : undefined;
        if (result === false) return;
        publish(
          itemsRef.current.filter((entry) => entry !== item),
          item,
          "remove"
        );
      } finally {
        setDeletingKeys((current) => {
          const next = new Set(current);
          next.delete(deletionKey);
          return next;
        });
      }
    }

    useImperativeHandle(ref, () => ({
      chooseFiles: () => {
        if (!disabled && !readOnly && inputRef.current) inputRef.current.click();
      },
      clearFailed: () => {
        tasksRef.current
          .filter((task) => task.status === "error")
          .forEach((task) => removeTask(task.id));
      },
      get input() {
        return inputRef.current;
      },
      get nativeElement() {
        return rootRef.current;
      },
      retry: retryTask
    }));

    useEffect(() => {
      if (!onUploadQueueChange) return;
      onUploadQueueChange(
        tasks.map(
          ({
            error,
            file,
            id: taskId,
            name: taskName,
            previewUrl,
            progress,
            status: taskStatus
          }) => ({
            file,
            id: taskId,
            name: taskName,
            progress,
            status: taskStatus,
            ...(error === undefined ? {} : { error }),
            ...(previewUrl ? { previewUrl } : {})
          })
        )
      );
    }, [onUploadQueueChange, tasks]);

    useEffect(
      () => () => {
        tasksRef.current.forEach((task) => {
          task.controller.abort();
          revokeTaskUrl(task);
        });
      },
      []
    );

    const input = (
      <input
        ref={inputRef}
        id={resolvedId}
        className={nativeInput}
        type="file"
        name={name}
        accept={accept}
        capture={capture}
        multiple={multiple}
        disabled={disabled || readOnly || atLimit}
        aria-label={ariaLabel || (labelledBy ? undefined : localizedAddLabel)}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onBlur={onBlur}
        onChange={(event) => {
          void handleSelection(event);
        }}
      />
    );

    return (
      <>
        <div
          {...props}
          ref={rootRef}
          className={className ? `${root} ${className}` : root}
          style={rootStyle}
          role="group"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : labelledBy}
          aria-describedby={describedBy}
          data-disabled={disabled || undefined}
          data-meu-component="image-uploader"
          data-readonly={readOnly || undefined}
          data-state={invalid ? "error" : "default"}
        >
          {items.map((item, index) => {
            const deletionKey = String(itemKey(item, index));
            const deleting = deletingKeys.has(deletionKey);
            const imageNode = (
              <Image
                src={item.thumbnailUrl || item.url}
                alt={item.alt}
                fit={imageFit}
                width="100%"
                height="100%"
                radius="control"
              />
            );
            const originNode = (
              <div key={itemKey(item, index)} className={cell} data-state="success">
                <div className={cellContent}>
                  {preview ? (
                    <button
                      type="button"
                      className={previewButton}
                      aria-label={`${item.alt}，${config.locale === "en-US" ? "Preview" : "预览"}`}
                      disabled={disabled}
                      onClick={() => {
                        setPreviewIndex(index);
                        setViewerOpen(true);
                        if (onPreview) onPreview(item, index);
                      }}
                    >
                      {imageNode}
                    </button>
                  ) : (
                    <div className={staticPreview}>{imageNode}</div>
                  )}
                  {deletable && !disabled && !readOnly ? (
                    <button
                      type="button"
                      className={actionButton}
                      aria-label={`${localizedRemoveLabel} ${item.alt}`}
                      aria-busy={deleting || undefined}
                      disabled={deleting}
                      onClick={() => {
                        void requestDelete(item);
                      }}
                    >
                      <MeuIconX size={18} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
            return renderItem ? (
              <Fragment key={itemKey(item, index)}>{renderItem(originNode, item, index)}</Fragment>
            ) : (
              originNode
            );
          })}
          {tasks.map((task) => {
            if (!showFailed && task.status === "error") return null;
            const progressStyle: ProgressStyle = {
              "--meu-image-uploader-progress": task.progress
            };
            return (
              <div
                key={task.id}
                className={cell}
                data-state={task.status}
                data-disabled={disabled || readOnly || undefined}
              >
                <div className={cellContent}>
                  {task.previewUrl ? (
                    <div className={staticPreview}>
                      <Image
                        src={task.previewUrl}
                        alt={task.name}
                        fit={imageFit}
                        width="100%"
                        height="100%"
                        radius="control"
                      />
                    </div>
                  ) : null}
                  <div className={taskMask}>
                    {task.status === "error" ? (
                      <button
                        type="button"
                        className={retryButton}
                        disabled={disabled || readOnly}
                        onClick={() => retryTask(task.id)}
                      >
                        {localizedRetryLabel}
                      </button>
                    ) : (
                      <>
                        <span
                          role="progressbar"
                          aria-label={task.name}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(task.progress)}
                        >
                          {Math.round(task.progress)}%
                        </span>
                        <span className={progressTrack} aria-hidden="true">
                          <span className={progressFill} style={progressStyle} />
                        </span>
                      </>
                    )}
                  </div>
                  {!disabled && !readOnly ? (
                    <button
                      type="button"
                      className={actionButton}
                      aria-label={`${localizedRemoveLabel} ${task.name}`}
                      onClick={() => removeTask(task.id)}
                    >
                      <MeuIconX size={18} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
          {canUpload ? (
            <div className={cell} data-disabled={disabled || readOnly || undefined}>
              <div className={cellContent}>
                {renderUpload ? (
                  renderUpload(input as ReactElement)
                ) : (
                  <>
                    <button
                      type="button"
                      className={uploadButton}
                      disabled={disabled || readOnly}
                      onClick={() => {
                        if (inputRef.current) inputRef.current.click();
                      }}
                    >
                      <span className={uploadIcon} aria-hidden="true">
                        <MeuIconPlus size={24} />
                      </span>
                      <span>{localizedAddLabel}</span>
                    </button>
                    {input}
                  </>
                )}
              </div>
            </div>
          ) : (
            input
          )}
        </div>
        <ImageViewer
          open={viewerOpen}
          images={viewerImages}
          index={previewIndex}
          onIndexChange={setPreviewIndex}
          onOpenChange={setViewerOpen}
        />
      </>
    );
  }
);
