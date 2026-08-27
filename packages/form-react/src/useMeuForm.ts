"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { FieldValues, Resolver, UseFormProps, UseFormReturn } from "react-hook-form";
import type { ZodType } from "zod";

export type MeuUseFormProps<TFieldValues extends FieldValues> = Omit<
  UseFormProps<TFieldValues>,
  "resolver"
> & {
  resolver?: Resolver<TFieldValues>;
  schema?: ZodType<TFieldValues, TFieldValues>;
};

export function useMeuForm<TFieldValues extends FieldValues>(
  options: MeuUseFormProps<TFieldValues> = {}
): UseFormReturn<TFieldValues> {
  const { resolver: suppliedResolver, schema, ...formOptions } = options;
  const resolver = schema
    ? (zodResolver(schema) as Resolver<TFieldValues>)
    : suppliedResolver;

  return useForm<TFieldValues>({
    ...formOptions,
    ...(resolver ? { resolver } : {})
  });
}
