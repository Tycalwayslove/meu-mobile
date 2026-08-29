"use client";

import { FormProvider } from "react-hook-form";
import type {
  DefaultValues,
  FieldErrors,
  FieldValues,
  Path,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn
} from "react-hook-form";
import { useCallback, useRef } from "react";
import type { FormHTMLAttributes, Ref, RefCallback } from "react";
import { flushSync } from "react-dom";

import {
  firstFieldInMeuForm,
  getMeuFormRoot,
  registerMeuFormRoot,
  unregisterMeuFormRoot
} from "./form-root-registry";

/** Concurrent native-submit behavior. @public */
export type MeuFormSubmitConcurrency = "allow" | "ignore";

function collectErrorPaths(errors: FieldErrors<FieldValues>, prefix = ""): string[] {
  const paths: string[] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== "object") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    const record = value as Record<string, unknown>;
    if (typeof record.type === "string" || typeof record.message === "string" || record.ref) {
      paths.push(path);
    } else {
      paths.push(...collectErrorPaths(value as FieldErrors<FieldValues>, path));
    }
  }
  return paths;
}

function resolveSubmitter(
  candidate: EventTarget | null,
  form: HTMLFormElement
): HTMLButtonElement | HTMLInputElement | null {
  if (!candidate || typeof candidate !== "object") return null;
  const element = candidate as HTMLButtonElement | HTMLInputElement;
  return element.form === form && !element.disabled ? element : null;
}

/** @public */
export type MeuFormProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues
> = Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit"> & {
  /** Runs after RHF validation and `onSubmit`; function actions receive current native FormData. */
  action?: FormHTMLAttributes<HTMLFormElement>["action"];
  /** React Hook Form instance exposed to this form subtree through `FormProvider`. */
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  /** Called after a submit attempt fails validation, with the current field errors and event. */
  onInvalid?: SubmitErrorHandler<TFieldValues>;
  /** Reports a rejected `onSubmit`/`onInvalid` promise instead of producing an unhandled rejection. */
  onSubmitError?: (error: unknown) => void;
  /** Called with validated, transformed values after a successful native form submission. */
  onSubmit: SubmitHandler<TTransformedValues>;
  /** Ref forwarded to the underlying native `form` element. */
  ref?: Ref<HTMLFormElement>;
  /** Focuses the first enabled invalid field in this form's DOM order. @defaultValue true */
  shouldFocusError?: boolean;
  /** Ignores a second native submit while the current submit promise is pending. @defaultValue "ignore" */
  submitConcurrency?: MeuFormSubmitConcurrency;
};

/**
 * Connects a Meu form surface to a React Hook Form instance.
 *
 * Native constraint validation is disabled by default so React Hook Form owns validation. Set
 * `noValidate={false}` only when the application intentionally uses browser validation UI.
 *
 * @public
 */
export function MeuForm<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues
>({
  action,
  children,
  form,
  noValidate = true,
  onInvalid,
  onReset,
  onSubmit,
  onSubmitError,
  ref,
  shouldFocusError = true,
  submitConcurrency = "ignore",
  ...props
}: MeuFormProps<TFieldValues, TContext, TTransformedValues>) {
  const nativeSubmitRef = useRef(false);
  const pendingSubmitRef = useRef<Promise<unknown> | null>(null);
  const setFormRef = useCallback<RefCallback<HTMLFormElement>>(
    (element) => {
      if (!element) return undefined;
      registerMeuFormRoot(form, element);

      const consumerCleanup = typeof ref === "function" ? ref(element) : undefined;
      if (ref && typeof ref !== "function") ref.current = element;

      return () => {
        unregisterMeuFormRoot(form, element);
        if (typeof consumerCleanup === "function") consumerCleanup();
        if (ref && typeof ref !== "function" && ref.current === element) ref.current = null;
      };
    },
    [form, ref]
  );

  function scheduleFirstErrorFocus(errors: FieldErrors<TFieldValues>) {
    if (!shouldFocusError) return;
    const paths = collectErrorPaths(errors as FieldErrors<FieldValues>).filter(
      (path) => path !== "root" && !path.startsWith("root.")
    );
    const firstPath = firstFieldInMeuForm(form, new Set(paths));
    if (!firstPath) return;
    form.setFocus(firstPath as Path<TFieldValues>);
  }

  function reportSubmitError(error: unknown) {
    if (onSubmitError) {
      onSubmitError(error);
      return;
    }
    window.setTimeout(() => {
      throw error;
    }, 0);
  }

  async function submitValidatedAction(
    values: TTransformedValues,
    event: Parameters<SubmitHandler<TTransformedValues>>[1]
  ) {
    await onSubmit(values, event);
    if (action === undefined) return;
    const formElement = getMeuFormRoot(form);
    if (!formElement) return;
    const nativeEvent = event ? (event.nativeEvent as SubmitEvent | undefined) : undefined;
    const submitter = resolveSubmitter(nativeEvent ? nativeEvent.submitter : null, formElement);
    const namedSubmitter = submitter && submitter.name ? submitter : null;
    const ownerWindow = formElement.ownerDocument.defaultView;
    if (typeof action === "function") {
      const FormDataConstructor = ownerWindow ? ownerWindow.FormData : FormData;
      const formData = new FormDataConstructor(formElement);
      if (namedSubmitter) formData.append(namedSubmitter.name, namedSubmitter.value);
      await action(formData);
      return;
    }
    if (typeof formElement.requestSubmit === "function") {
      nativeSubmitRef.current = true;
      try {
        formElement.requestSubmit(submitter || undefined);
      } finally {
        nativeSubmitRef.current = false;
      }
      return;
    }
    const submitterMirror = namedSubmitter
      ? formElement.ownerDocument.createElement("input")
      : null;
    if (submitterMirror && namedSubmitter) {
      submitterMirror.type = "hidden";
      submitterMirror.name = namedSubmitter.name;
      submitterMirror.value = namedSubmitter.value;
      formElement.append(submitterMirror);
    }
    try {
      const formPrototype = ownerWindow
        ? ownerWindow.HTMLFormElement.prototype
        : HTMLFormElement.prototype;
      formPrototype.submit.call(formElement);
    } finally {
      if (submitterMirror) submitterMirror.remove();
    }
  }

  return (
    <FormProvider {...form}>
      <form
        {...props}
        action={action}
        ref={setFormRef}
        noValidate={noValidate}
        onSubmit={(event) => {
          if (nativeSubmitRef.current) return;
          if (submitConcurrency === "ignore" && pendingSubmitRef.current) {
            event.preventDefault();
            return;
          }
          const submission = form.handleSubmit(submitValidatedAction, (errors, invalidEvent) => {
            scheduleFirstErrorFocus(errors);
            if (onInvalid) return onInvalid(errors, invalidEvent);
            return undefined;
          })(event);
          pendingSubmitRef.current = submission;
          void submission.then(
            () => {
              if (pendingSubmitRef.current === submission) pendingSubmitRef.current = null;
            },
            (error: unknown) => {
              if (pendingSubmitRef.current === submission) pendingSubmitRef.current = null;
              reportSubmitError(error);
            }
          );
        }}
        onReset={(event) => {
          if (onReset) onReset(event);
          if (event.defaultPrevented) return;

          const storedDefaultValues = form.formState.defaultValues;
          const defaultValues = (
            storedDefaultValues === undefined ? {} : storedDefaultValues
          ) as DefaultValues<TFieldValues>;
          // Commit RHF state before the browser applies the native reset default action.
          flushSync(() => form.reset(defaultValues));
        }}
        data-meu-component="form"
      >
        {children}
      </form>
    </FormProvider>
  );
}
