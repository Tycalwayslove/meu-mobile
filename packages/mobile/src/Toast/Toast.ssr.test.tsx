// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Toast } from "./Toast";
import { ToastProvider } from "./ToastProvider";

describe("Toast SSR", () => {
  it("renders closed declarative and empty provider states without browser globals", () => {
    expect(renderToString(<Toast message="Saved" />)).toBe("");
    expect(renderToString(<ToastProvider>content</ToastProvider>)).toContain("content");
  });
});
