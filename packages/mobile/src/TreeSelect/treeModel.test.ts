import { describe, expect, it } from "vitest";

import {
  collectTreeSelectOptions,
  flattenTreeSelectOptions,
  normalizeTreeSelectValue
} from "./treeModel";

describe("TreeSelect tree model", () => {
  it("ignores duplicate global values and terminates cyclic input", () => {
    type MutableOption = { children?: MutableOption[]; label: string; value: string };
    const root: MutableOption = { label: "Root", value: "root" };
    const child: MutableOption = { label: "Child", value: "child", children: [root] };
    root.children = [child, { label: "Duplicate", value: "child" }];

    const flat = flattenTreeSelectOptions([root], new Set(["root", "child"]), "leaf", "");
    expect(flat.map((item) => item.option.value)).toEqual(["root", "child"]);
    expect(collectTreeSelectOptions([root]).options.size).toBe(2);
  });

  it("normalizes order, selectable nodes, mode and maximum count", () => {
    const options = [
      {
        label: "Parent",
        value: "parent",
        children: [
          { label: "One", value: "one" },
          { disabled: true, label: "Two", value: "two" }
        ]
      }
    ];
    expect(
      normalizeTreeSelectValue(options, ["two", "parent", "one", "one"], true, "leaf", 3)
    ).toEqual(["one"]);
    expect(normalizeTreeSelectValue(options, ["parent", "one"], false, "any", 3)).toEqual([
      "parent"
    ]);
  });
});
