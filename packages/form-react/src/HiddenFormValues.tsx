import type { MeuFormDataSerialization, MeuFormDataValue } from "./adapter-types";

type HiddenFormValuesProps = {
  disabled?: boolean;
  name: string;
  values: ReadonlyArray<MeuFormDataValue>;
};

type SerializationResult = {
  values: ReadonlyArray<MeuFormDataValue>;
};

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

function isFormDataValue(value: unknown): value is MeuFormDataValue {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  );
}

/**
 * Runs a synchronous form serializer without letting thrown errors or accidental rejected
 * promises escape. Native `FormData` is synchronous, so promise results are omitted.
 */
export function serializeHiddenFormValues(
  serialize: () => MeuFormDataSerialization
): SerializationResult {
  try {
    const result: unknown = serialize();
    if (isPromiseLike(result)) {
      void Promise.resolve(result).catch(() => undefined);
      return { values: [] };
    }
    const values: unknown[] = Array.isArray(result) ? result : [result];
    return values.every(isFormDataValue) ? { values } : { values: [] };
  } catch {
    return { values: [] };
  }
}

/**
 * Mirrors non-native adapter values into successful form controls without exposing layout or
 * accessibility nodes. Repeated values intentionally use the same name so FormData preserves
 * collection order through `getAll(name)`.
 */
export function HiddenFormValues({ disabled = false, name, values }: HiddenFormValuesProps) {
  return values.flatMap((value, index) =>
    value === null || value === undefined
      ? []
      : [
          <input
            key={`${index}-${String(value)}`}
            type="hidden"
            name={name}
            value={String(value)}
            disabled={disabled}
            data-meu-form-value="hidden"
          />
        ]
  );
}
