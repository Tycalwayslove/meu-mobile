import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Switch } from "./Switch";

describe("Switch SSR", () => {
  it("renders stable native form and switch semantics without browser globals", () => {
    const markup = renderToString(
      <Switch aria-label="自动续费" defaultChecked name="renew" value="yes" />
    );

    expect(markup).toContain('role="switch"');
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain('name="renew"');
    expect(markup).toContain('value="yes"');
  });
});
