"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { FieldValues, Resolver, UseFormProps, UseFormReturn } from "react-hook-form";
import type { ZodType } from "zod";

/** @public */
export type MeuUseFormProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues
> = Omit<UseFormProps<TFieldValues, TContext, TTransformedValues>, "resolver"> &
  (
    | {
        /** Unavailable when `schema` supplies the Zod-based resolver. */
        resolver?: never;
        /** Zod schema used to validate inputs and produce the submitted value shape. */
        schema: ZodType<TTransformedValues, TFieldValues>;
      }
    | {
        /** Custom React Hook Form resolver; mutually exclusive with `schema`. */
        resolver?: Resolver<TFieldValues, TContext, TTransformedValues>;
        /** Unavailable when a custom `resolver` is supplied. */
        schema?: never;
      }
  );

/**
 * Creates a React Hook Form instance with an optional Zod schema.
 *
 * `schema` and `resolver` are intentionally mutually exclusive. Use the input and transformed
 * generics when a schema changes the submitted value shape. By default, conditionally unmounted
 * fields unregister so RHF submission matches native successful-control behavior, and MeuForm owns
 * DOM-order error focus. Pass `shouldUnregister: false` or `shouldFocusError: true` to restore raw
 * React Hook Form behavior deliberately.
 *
 * @public
 */
export function useMeuForm<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues
>(
  options: MeuUseFormProps<TFieldValues, TContext, TTransformedValues> = {}
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  const { resolver: suppliedResolver, schema, ...formOptions } = options;
  const resolver = schema ? zodResolver(schema) : suppliedResolver;

  return useForm<TFieldValues, TContext, TTransformedValues>({
    shouldFocusError: false,
    shouldUnregister: true,
    ...formOptions,
    ...(resolver ? { resolver } : {})
  });
}
