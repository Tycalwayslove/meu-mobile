import type { FieldPathByValue, FieldValues } from "react-hook-form";

/** A React Hook Form path whose value can be edited as text. @public */
export type MeuStringFieldPath<TFieldValues extends FieldValues> = FieldPathByValue<
  TFieldValues,
  string | null | undefined
>;

/** A React Hook Form path whose value can be edited as a boolean. @public */
export type MeuBooleanFieldPath<TFieldValues extends FieldValues> = FieldPathByValue<
  TFieldValues,
  boolean | null | undefined
>;

/** A React Hook Form path whose value can be edited as a number. @public */
export type MeuNumberFieldPath<TFieldValues extends FieldValues> = FieldPathByValue<
  TFieldValues,
  number | null | undefined
>;

/** A React Hook Form path whose value can hold one scalar selection. @public */
export type MeuSelectionFieldPath<TFieldValues extends FieldValues, TValue> = FieldPathByValue<
  TFieldValues,
  TValue | null | undefined
>;

/** A React Hook Form path whose value can hold a collection of selections. @public */
export type MeuCollectionFieldPath<TFieldValues extends FieldValues, TValue> = FieldPathByValue<
  TFieldValues,
  ReadonlyArray<TValue> | null | undefined
>;
