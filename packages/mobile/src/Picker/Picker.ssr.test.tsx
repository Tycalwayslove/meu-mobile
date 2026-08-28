// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Picker } from "./Picker";
import { PickerTrigger } from "./PickerTrigger";

describe("Picker SSR", () => {
  it("renders deterministic dialog, wheel and trigger semantics without browser globals", () => {
    const picker = renderToString(
      <Picker
        open
        title="配送方式"
        columns={[[{ label: "普通配送", value: "standard" }]]}
        defaultValue={["standard"]}
      />
    );
    expect(picker).toContain('role="dialog"');
    expect(picker).toContain('role="listbox"');
    expect(picker).toContain('aria-selected="true"');
    const trigger = renderToString(<PickerTrigger open value="普通配送" />);
    expect(trigger).toContain('aria-haspopup="dialog"');
    expect(trigger).toContain('aria-expanded="true"');
  });
});
