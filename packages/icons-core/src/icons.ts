export type MeuIconNodeAttributes = Readonly<Record<string, string>>;
export type MeuIconNode = ReadonlyArray<readonly [tag: string, attributes: MeuIconNodeAttributes]>;

export const meuIconChevronLeft = [["path", { d: "m15 18-6-6 6-6" }]] as const;

export const meuIconCheck = [["path", { d: "M20 6 9 17l-5-5" }]] as const;

export const meuIconX = [
  ["path", { d: "M18 6 6 18" }],
  ["path", { d: "m6 6 12 12" }]
] as const;

export const meuIconPlus = [
  ["path", { d: "M5 12h14" }],
  ["path", { d: "M12 5v14" }]
] as const;

export const meuIconSearch = [
  ["path", { d: "m21 21-4.34-4.34" }],
  ["circle", { cx: "11", cy: "11", r: "8" }]
] as const;

export const meuIconNodes = {
  "chevron-left": meuIconChevronLeft,
  check: meuIconCheck,
  plus: meuIconPlus,
  search: meuIconSearch,
  x: meuIconX
} as const satisfies Record<string, MeuIconNode>;

export type MeuIconName = keyof typeof meuIconNodes;
