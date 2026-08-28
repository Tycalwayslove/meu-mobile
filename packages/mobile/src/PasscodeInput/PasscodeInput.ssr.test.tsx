import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Field } from "../Field";
import { PasscodeInput } from "./PasscodeInput";

describe("PasscodeInput SSR", () => {
  it("renders deterministic native input and visual cells without browser globals", () => {
    const html = renderToString(
      <Field label="短信验证码" description="六位 ASCII 数字" required>
        <PasscodeInput defaultValue="12a3" length={6} name="code" separated />
      </Field>
    );

    expect(html).toContain('data-meu-component="passcode-input"');
    expect(html).toContain('name="code"');
    expect(html).toContain('value="123"');
    expect(html).toContain('autoComplete="one-time-code"');
    expect(html).toContain('required=""');
    expect(html.match(/data-meu-passcode-cell=/g)).toHaveLength(6);
    expect(html).not.toContain('data-meu-component="number-keyboard"');
  });

  it("does not apply UTF-16 maxlength to Unicode text mode", () => {
    const html = renderToString(
      <PasscodeInput
        aria-label="短码"
        defaultValue="😀好"
        inputMode="text"
        length={2}
        mask={false}
      />
    );

    expect(html).toContain('inputMode="text"');
    expect(html).not.toContain("maxLength=");
    expect(html).toContain("😀");
    expect(html).toContain("好");
  });
});
