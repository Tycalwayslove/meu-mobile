// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Field } from "./Field";

describe("Field SSR", () => {
  it("renders stable native relationships without browser globals", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    const markup = renderToString(
      <Field
        id="profile-name-field"
        label="姓名"
        description="与证件保持一致"
        error="请输入姓名"
        required
      >
        <input name="name" />
      </Field>
    );

    expect(markup).toContain('id="profile-name-field"');
    expect(markup).toContain('for="profile-name-field-control"');
    expect(markup).toContain('id="profile-name-field-control"');
    expect(markup).toContain('required=""');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain(
      'aria-describedby="profile-name-field-control-description profile-name-field-control-error"'
    );
  });
});
