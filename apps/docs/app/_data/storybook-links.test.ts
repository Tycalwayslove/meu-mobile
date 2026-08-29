import { describe, expect, it } from "vitest";

import { getStoryLabel } from "./storybook-links";

describe("getStoryLabel", () => {
  it("turns canonical story IDs into readable state labels", () => {
    expect(getStoryLabel("feedback-dialog--confirm")).toBe("Confirm");
    expect(getStoryLabel("information-cell-list--long-content-and-rtl")).toBe(
      "Long content and RTL"
    );
  });
});
