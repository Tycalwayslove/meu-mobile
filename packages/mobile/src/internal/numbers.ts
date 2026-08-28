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
  const finiteMin = min !== undefined && Number.isFinite(min) ? min : undefined;
  const finiteMax = max !== undefined && Number.isFinite(max) ? max : undefined;
  const lower =
    finiteMin !== undefined && finiteMax !== undefined ? Math.min(finiteMin, finiteMax) : finiteMin;
  const upper =
    finiteMin !== undefined && finiteMax !== undefined ? Math.max(finiteMin, finiteMax) : finiteMax;
  const base = lower === undefined ? 0 : lower;
  // Bound before snapping so a max that is not on the step grid resolves to
  // the last reachable value instead of an off-grid endpoint. This also makes
  // normalization idempotent (for example 10 -> 9 for min=0/max=10/step=3).
  const bounded = clampNumber(value, lower, upper);
  let stepIndex = Math.round((bounded - base) / safeStep);
  if (lower !== undefined) {
    const lowerRatio = (lower - base) / safeStep;
    const tolerance = Number.EPSILON * Math.max(1, Math.abs(lowerRatio)) * 4;
    stepIndex = Math.max(stepIndex, Math.ceil(lowerRatio - tolerance));
  }
  if (upper !== undefined) {
    const upperRatio = (upper - base) / safeStep;
    const tolerance = Number.EPSILON * Math.max(1, Math.abs(upperRatio)) * 4;
    stepIndex = Math.min(stepIndex, Math.floor(upperRatio + tolerance));
  }
  const snapped = base + stepIndex * safeStep;
  const resolvedPrecision =
    precision === undefined
      ? Math.max(decimalPlaces(safeStep), decimalPlaces(base))
      : Math.min(Math.max(Math.trunc(precision), 0), 12);
  return clampNumber(roundNumber(snapped, resolvedPrecision), lower, upper);
}
