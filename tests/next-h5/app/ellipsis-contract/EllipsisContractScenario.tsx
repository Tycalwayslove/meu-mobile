"use client";

import { Ellipsis } from "@meu/mobile";
import { useRef, useState } from "react";

const content =
  "iiiiiiiiiiiiiiiiiiiiiiii WWWWWWWWWW typography must remain accurately measured after every replacement and font load.";
const loadedFontFamily = "MeuEllipsisLoadedMono";

export function EllipsisContractScenario() {
  const [replacementFamily, setReplacementFamily] = useState("sans-serif");
  const [fontStatus, setFontStatus] = useState<"fallback" | "loading" | "loaded">("fallback");
  const loadedFaceRef = useRef<FontFace | null>(null);

  async function loadFont() {
    if (loadedFaceRef.current || fontStatus === "loading") return;
    setFontStatus("loading");
    const face = new FontFace(loadedFontFamily, 'url("/ellipsis-contract/font") format("woff2")');
    loadedFaceRef.current = face;
    document.fonts.add(face);
    await face.load();
    await document.fonts.ready;
    setFontStatus("loaded");
  }

  const sharedStyle = {
    fontSize: 18,
    lineHeight: "24px"
  } as const;

  return (
    <main style={{ display: "grid", gap: 32, padding: 24 }}>
      <h1>Ellipsis typography contracts</h1>

      <section aria-label="Font family replacement" style={{ width: 240 }}>
        <button type="button" onClick={() => setReplacementFamily("monospace")}>
          Replace font family
        </button>
        <Ellipsis
          data-testid="replacement-ellipsis"
          content={content}
          rows={1}
          style={{ ...sharedStyle, fontFamily: replacementFamily }}
        />
      </section>

      <section aria-label="Font loading completion" style={{ width: 240 }}>
        <button type="button" onClick={() => void loadFont()}>
          Load web font
        </button>
        <output data-testid="font-status">{fontStatus}</output>
        <Ellipsis
          data-testid="loading-ellipsis"
          content={content}
          rows={1}
          style={{ ...sharedStyle, fontFamily: `"${loadedFontFamily}", sans-serif` }}
        />
      </section>
    </main>
  );
}
