import type { WatermarkFont } from "./types";

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 64;
const DEFAULT_GAP_X = 96;
const DEFAULT_GAP_Y = 96;
const DEFAULT_ROTATE = -22;

function finiteNumber(value: number | undefined, fallback: number) {
  return value === undefined || !Number.isFinite(value) ? fallback : value;
}

function positiveNumber(value: number | undefined, fallback: number) {
  return Math.min(2048, Math.max(1, finiteNumber(value, fallback)));
}

function gapNumber(value: number | undefined, fallback: number) {
  return Math.min(2048, Math.max(0, finiteNumber(value, fallback)));
}

export type WatermarkPattern = {
  font: Required<WatermarkFont>;
  gapX: number;
  gapY: number;
  lineHeight: number;
  lines: string[];
  markHeight: number;
  markWidth: number;
  offsetX: number;
  offsetY: number;
  rotate: number;
  rotatedHeight: number;
  rotatedWidth: number;
  tileHeight: number;
  tileWidth: number;
};

export function normalizeWatermarkLines(content: string | ReadonlyArray<string> | undefined) {
  const values = typeof content === "string" ? [content] : content || [];
  return values.flatMap((value) => String(value).split(/\r?\n/));
}

export function createWatermarkPattern(options: {
  content?: string | ReadonlyArray<string> | undefined;
  font?: WatermarkFont | undefined;
  gap?: readonly [number, number] | undefined;
  height?: number | undefined;
  offset?: readonly [number, number] | undefined;
  rotate?: number | undefined;
  width?: number | undefined;
}): WatermarkPattern {
  const font = options.font;
  const gap = options.gap;
  const offset = options.offset;
  const markWidth = positiveNumber(options.width, DEFAULT_WIDTH);
  const markHeight = positiveNumber(options.height, DEFAULT_HEIGHT);
  const gapX = gapNumber(gap ? gap[0] : undefined, DEFAULT_GAP_X);
  const gapY = gapNumber(gap ? gap[1] : undefined, DEFAULT_GAP_Y);
  const rotate = finiteNumber(options.rotate, DEFAULT_ROTATE);
  const radians = (rotate * Math.PI) / 180;
  const rotatedWidth = Math.ceil(
    Math.abs(markWidth * Math.cos(radians)) + Math.abs(markHeight * Math.sin(radians))
  );
  const rotatedHeight = Math.ceil(
    Math.abs(markWidth * Math.sin(radians)) + Math.abs(markHeight * Math.cos(radians))
  );
  const tileWidth = Math.max(1, rotatedWidth + gapX);
  const tileHeight = Math.max(1, (rotatedHeight + gapY) * 2);
  const fontSize = positiveNumber(font ? font.fontSize : undefined, 14);
  const lineHeight = positiveNumber(font ? font.lineHeight : undefined, Math.ceil(fontSize * 1.35));

  return {
    font: {
      color: (font && font.color) || "var(--meu-color-muted)",
      fontFamily: (font && font.fontFamily) || "var(--meu-font-ui)",
      fontSize,
      fontStyle: (font && font.fontStyle) || "normal",
      fontWeight: (font && font.fontWeight) || 600,
      lineHeight
    },
    gapX,
    gapY,
    lineHeight,
    lines: normalizeWatermarkLines(options.content),
    markHeight,
    markWidth,
    offsetX: finiteNumber(offset ? offset[0] : undefined, gapX / 2) - gapX / 2,
    offsetY: finiteNumber(offset ? offset[1] : undefined, gapY / 2) - gapY / 2,
    rotate,
    rotatedHeight,
    rotatedWidth,
    tileHeight,
    tileWidth
  };
}

export function clampWatermarkOpacity(opacity: number | undefined) {
  return Math.min(1, Math.max(0, finiteNumber(opacity, 0.16)));
}
