import type { FieldPathByValue, FieldValues } from "react-hook-form";

/**
 * One scalar that a form adapter can mirror into a native `FormData` entry.
 *
 * `null` and `undefined` omit the entry. Other values are converted with `String`; return an
 * array from a serializer to emit repeated entries with the same field name in array order.
 * Objects, files, and promises are intentionally excluded so complex values require an explicit
 * backend contract instead of relying on implicit string coercion.
 *
 * @public
 */
export type MeuFormDataValue = string | number | boolean | bigint | null | undefined;

/**
 * Result accepted from a complex-value adapter's synchronous native form serializer.
 *
 * An empty array, `null`, or `undefined` omits the field. Repeated values are exposed through
 * `FormData.getAll(name)` in the returned order.
 *
 * @public
 */
export type MeuFormDataSerialization = MeuFormDataValue | ReadonlyArray<MeuFormDataValue>;

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
