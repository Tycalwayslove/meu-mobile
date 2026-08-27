import "@meu/tokens/css";
import "@meu/mobile/styles.css";

import { ConfigProvider } from "../../../packages/mobile/src/ConfigProvider";
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  decorators: [
    (Story) => (
      <ConfigProvider theme="light" style={{ minHeight: "100vh", padding: 24 }}>
        <Story />
      </ConfigProvider>
    )
  ],
  parameters: {
    a11y: { test: "error" },
    backgrounds: { disable: true },
    controls: { expanded: true },
    viewport: {
      options: {
        meuMobile: {
          name: "Meu Mobile 390",
          styles: { width: "390px", height: "844px" }
        }
      }
    }
  }
};

export default preview;
