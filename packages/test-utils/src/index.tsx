import { ConfigProvider } from "@meu/mobile";
import { render } from "@testing-library/react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";

export function renderWithMeu(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult {
  return render(ui, {
    ...options,
    wrapper: ({ children }) => (
      <ConfigProvider locale="zh-CN" theme="light">
        {children}
      </ConfigProvider>
    )
  });
}
