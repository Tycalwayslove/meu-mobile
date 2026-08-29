// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TextInput } from "../TextInput";
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

  it("renders Field context semantics through a native layout wrapper", () => {
    const markup = renderToString(
      <Field id="contact-field" label="联系人" description="用于配送通知" required>
        <div>
          <TextInput name="contact" />
        </div>
      </Field>
    );

    expect(markup.match(/id="contact-field-control"/g)).toHaveLength(1);
    expect(markup).toContain('aria-labelledby="contact-field-control-label"');
    expect(markup).toContain(
      'aria-describedby="contact-field-control-required contact-field-control-description"'
    );
    expect(markup).toContain('required=""');
  });
});
