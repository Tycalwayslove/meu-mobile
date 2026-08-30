export function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const tokens = values.flatMap((value) => (value ? value.trim().split(/\s+/) : []));
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  return uniqueTokens.length > 0 ? uniqueTokens.join(" ") : undefined;
}
