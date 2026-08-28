// @vitest-environment node
import { describe, expect, it } from "vitest";

import { renderMeuToString } from "./index";

describe("renderMeuToString in a server environment", () => {
  it("does not require window or document", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    const markup = renderMeuToString(<button type="button">Continue</button>, {
      direction: "rtl",
      locale: "en-US",
      theme: "dark"
    });

    expect(markup).toContain('lang="en-US"');
    expect(markup).toContain('data-meu-theme="dark"');
    expect(markup).toContain('dir="rtl"');
    expect(markup).toContain("Continue");
  });
});
