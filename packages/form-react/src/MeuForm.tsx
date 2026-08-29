"use client";

import { FormProvider } from "react-hook-form";
import type {
  DefaultValues,
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn
} from "react-hook-form";
import { useCallback } from "react";
import type { FormHTMLAttributes, Ref, RefCallback } from "react";
import { flushSync } from "react-dom";

import { registerMeuFormRoot, unregisterMeuFormRoot } from "./form-root-registry";

/** @public */
export type MeuFormProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues
> = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  /** React Hook Form instance exposed to this form subtree through `FormProvider`. */
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  /** Called after a submit attempt fails validation, with the current field errors and event. */
  onInvalid?: SubmitErrorHandler<TFieldValues>;
  /** Called with validated, transformed values after a successful native form submission. */
  onSubmit: SubmitHandler<TTransformedValues>;
  /** Ref forwarded to the underlying native `form` element. */
  ref?: Ref<HTMLFormElement>;
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
  children,
  form,
  noValidate = true,
  onInvalid,
  onReset,
  onSubmit,
  ref,
  ...props
}: MeuFormProps<TFieldValues, TContext, TTransformedValues>) {
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

  return (
    <FormProvider {...form}>
      <form
        {...props}
        ref={setFormRef}
        noValidate={noValidate}
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit, onInvalid)(event);
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
