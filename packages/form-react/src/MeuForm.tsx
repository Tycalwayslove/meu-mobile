"use client";

import { FormProvider } from "react-hook-form";
import type {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn
} from "react-hook-form";
import type { FormHTMLAttributes } from "react";

export type MeuFormProps<TFieldValues extends FieldValues> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  form: UseFormReturn<TFieldValues>;
  onInvalid?: SubmitErrorHandler<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
};

export function MeuForm<TFieldValues extends FieldValues>({
  children,
  form,
  noValidate = true,
  onInvalid,
  onSubmit,
  ...props
}: MeuFormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form
        {...props}
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
