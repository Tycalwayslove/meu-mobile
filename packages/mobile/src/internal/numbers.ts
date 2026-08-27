export function clampNumber(value: number, min?: number, max?: number) {
  const lower = min !== undefined && Number.isFinite(min) ? min : -Infinity;
  const upper = max !== undefined && Number.isFinite(max) ? max : Infinity;
  const orderedLower = Math.min(lower, upper);
  const orderedUpper = Math.max(lower, upper);
  const fallback = Number.isFinite(orderedLower) ? orderedLower : 0;
  return Math.min(Math.max(Number.isFinite(value) ? value : fallback, orderedLower), orderedUpper);
}

export function decimalPlaces(value: number) {
  if (!Number.isFinite(value)) return 0;
  const text = String(value).toLowerCase();
  if (text.includes("e-")) {
    const [coefficient, exponentText] = text.split("e-");
    const coefficientParts = coefficient ? coefficient.split(".") : [];
    const coefficientDecimals = coefficientParts[1] ? coefficientParts[1].length : 0;
    return Number(exponentText) + coefficientDecimals;
  }
  const decimalPart = text.split(".")[1];
  return decimalPart ? decimalPart.length : 0;
}

export function roundNumber(value: number, precision: number) {
  if (!Number.isFinite(value)) return value;
  const safePrecision = Math.min(Math.max(Math.trunc(precision), 0), 12);
  return Number(value.toFixed(safePrecision));
}

export function normalizeSteppedNumber({
  max,
  min,
  precision,
  step,
  value
}: {
  max?: number | undefined;
  min?: number | undefined;
  precision?: number | undefined;
  step: number;
  value: number;
}) {
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const base = min !== undefined && Number.isFinite(min) ? min : 0;
  const snapped = base + Math.round((value - base) / safeStep) * safeStep;
  const resolvedPrecision =
    precision === undefined
      ? Math.max(decimalPlaces(safeStep), decimalPlaces(base))
      : Math.min(Math.max(Math.trunc(precision), 0), 12);
  return clampNumber(roundNumber(snapped, resolvedPrecision), min, max);
}
