/**
 * SVG attributes stored by the platform-neutral Meu icon registry.
 *
 * @public
 */
export type MeuIconNodeAttributes = Readonly<Record<string, string>>;

/**
 * A read-only list of SVG element names and attributes using the shared 24 × 24 viewBox.
 *
 * @public
 */
export type MeuIconNode = ReadonlyArray<readonly [tag: string, attributes: MeuIconNodeAttributes]>;

/**
 * Geometry for the Meu `chevron-left` icon.
 *
 * @public
 */
export const meuIconChevronLeft = [["path", { d: "m15 18-6-6 6-6" }]] as const;

/**
 * Geometry for the Meu `check` icon.
 *
 * @public
 */
export const meuIconCheck = [["path", { d: "M20 6 9 17l-5-5" }]] as const;

/**
 * Geometry for the Meu `x` icon.
 *
 * @public
 */
export const meuIconX = [
  ["path", { d: "M18 6 6 18" }],
  ["path", { d: "m6 6 12 12" }]
] as const;

/**
 * Geometry for the Meu `plus` icon.
 *
 * @public
 */
export const meuIconPlus = [
  ["path", { d: "M5 12h14" }],
  ["path", { d: "M12 5v14" }]
] as const;

/**
 * Geometry for the Meu `search` icon.
 *
 * @public
 */
export const meuIconSearch = [
  ["path", { d: "m21 21-4.34-4.34" }],
  ["circle", { cx: "11", cy: "11", r: "8" }]
] as const;

/**
 * The complete curated Meu icon registry, keyed by stable kebab-case semantic IDs.
 *
 * @public
 */
export const meuIconNodes = {
  "chevron-left": meuIconChevronLeft,
  check: meuIconCheck,
  plus: meuIconPlus,
  search: meuIconSearch,
  x: meuIconX
} as const satisfies Record<string, MeuIconNode>;

/**
 * Stable semantic IDs accepted by the Meu icon registry.
 *
 * @public
 */
export type MeuIconName = keyof typeof meuIconNodes;
