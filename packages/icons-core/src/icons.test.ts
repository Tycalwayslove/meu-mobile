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
      archiveIntegrity:
        "sha512-pSUvFhfhvDnhXN1fXerZEMgKLQQ3DneKwFYlqB5ji8OEAN0iPi/qgwQvCkcL519QgMeR66IpS/pT342VyT/g4g==",
      gitCommit: "1a60fd28ed7111bbf6acedc0896f3d83cd73945a",
      license: "ISC",
      licenseFile: "licenses/lucide-isc.txt",
      name: "Lucide Icons",
      package: "lucide-static",
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
          icon.licenses.join(",") === "ISC,MIT" &&
          icon.licenseFiles.join(",") === "licenses/lucide-isc.txt,licenses/feather-mit.txt" &&
          /^[a-f0-9]{64}$/.test(icon.sourceSha256) &&
          /^[a-f0-9]{64}$/.test(icon.geometrySha256) &&
          icon.upstreamUrl.includes(iconManifest.upstream.gitCommit) &&
          icon.modified === false
      )
    ).toBe(true);
  });

  it("records reproducible engineering evidence without claiming legal approval", () => {
    expect(iconManifest.provenanceAudit.status).toBe("verified");
    expect(iconManifest.provenanceAudit.verified).toContain(
      "Generated TypeScript and this manifest are covered by the offline drift check."
    );
    expect(iconManifest.provenanceAudit.legalReviewRequired).toContain("counsel");
  });
});
