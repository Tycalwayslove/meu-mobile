import { describe, expect, it } from "vitest";

import { meuIconNodes } from "./icons";

describe("Meu icon data", () => {
  it("keeps the curated registry intentionally small", () => {
    expect(Object.keys(meuIconNodes)).toEqual(["chevron-left", "check", "plus", "search", "x"]);
  });

  it("uses platform-neutral SVG nodes", () => {
    expect(meuIconNodes.search[1]).toEqual(["circle", { cx: "11", cy: "11", r: "8" }]);
  });
});
