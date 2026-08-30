export function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const value = values.filter(Boolean).join(" ").trim();
  return value ? [...new Set(value.split(/\s+/))].join(" ") : undefined;
}
