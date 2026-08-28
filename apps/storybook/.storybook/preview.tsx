import "@meu/tokens/css";
import "@meu/mobile/styles.css";

import { ConfigProvider } from "../../../packages/mobile/src/ConfigProvider";
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ConfigProvider
        theme="light"
        style={{
          boxSizing: "border-box",
          minHeight: "100dvh",
          padding: 16,
          width: "100%",
          background: "var(--meu-color-canvas)",
          color: "var(--meu-color-ink)"
        }}
      >
        <Story />
      </ConfigProvider>
    )
  ],
  initialGlobals: {
    viewport: { value: "meuMobile", isRotated: false }
  },
  parameters: {
    a11y: { test: "error" },
    backgrounds: { disable: true },
    controls: { expanded: true },
    layout: "fullscreen",
    viewport: {
      options: {
        meuMobile: {
          name: "Meu Mobile 390",
          styles: { width: "390px", height: "844px" },
          type: "mobile"
        }
      }
    }
  }
};

export default preview;
