import { describe, expect, it } from "vitest";

import iconManifest from "./icons.manifest.json";
import { meuIconNodes } from "./icons";

describe("Meu icon data", () => {
  it("keeps the curated registry intentionally small", () => {
    expect(Object.keys(meuIconNodes)).toEqual(["chevron-left", "check", "plus", "search", "x"]);
  });

  it("uses platform-neutral SVG nodes", () => {
    expect(meuIconNodes.search[1]).toEqual(["circle", { cx: "11", cy: "11", r: "8" }]);
  });

  it("keeps package-relative license provenance for every exported icon", () => {
    expect(iconManifest.upstream).toMatchObject({
      license: "ISC",
      licenseFile: "licenses/lucide-isc.txt",
      name: "Lucide Icons",
      version: "1.34.0"
    });
    expect(iconManifest.icons.map((icon) => icon.id)).toEqual(Object.keys(meuIconNodes));
    expect(iconManifest.icons.map((icon) => icon.react)).toEqual([
      "MeuIconChevronLeft",
      "MeuIconCheck",
      "MeuIconPlus",
      "MeuIconSearch",
      "MeuIconX"
    ]);
    expect(
      iconManifest.icons.every(
        (icon) =>
          icon.license === "MIT" &&
          icon.licenseFile === "licenses/feather-mit.txt" &&
          icon.modified === false
      )
    ).toBe(true);
  });

  it("does not overstate the available provenance evidence", () => {
    expect(iconManifest.provenanceAudit.status).toBe("incomplete");
    expect(iconManifest.provenanceAudit.missing).toContain(
      "An immutable upstream source URL or commit for Lucide Icons 1.34.0."
    );
    expect(iconManifest.provenanceAudit.missing).toContain(
      "A generation log or geometry checksum tying each local SVG path to that upstream revision."
    );
  });
});
