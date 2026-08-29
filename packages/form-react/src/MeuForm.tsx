"use client";

import { FormProvider } from "react-hook-form";
import type {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn
} from "react-hook-form";
import type { FormHTMLAttributes, Ref } from "react";

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
  onSubmit,
  ref,
  ...props
}: MeuFormProps<TFieldValues, TContext, TTransformedValues>) {
  return (
    <FormProvider {...form}>
      <form
        {...props}
        ref={ref}
        noValidate={noValidate}
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit, onInvalid)(event);
        }}
        data-meu-component="form"
      >
        {children}
      </form>
    </FormProvider>
  );
}
