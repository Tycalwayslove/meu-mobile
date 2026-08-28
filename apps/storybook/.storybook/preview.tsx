import "@meu/tokens/css";
import "@meu/primitives-react/styles.css";
import "@meu/mobile/styles.css";

import { ConfigProvider } from "../../../packages/mobile/src/ConfigProvider";
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    theme: {
      description: "Meu color theme",
      toolbar: {
        icon: "paintbrush",
        items: [
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" },
          { title: "System", value: "system" }
        ]
      }
    },
    dir: {
      description: "Text direction",
      toolbar: {
        icon: "transfer",
        items: [
          { title: "LTR", value: "ltr" },
          { title: "RTL", value: "rtl" }
        ]
      }
    },
    locale: {
      description: "Built-in component locale",
      toolbar: {
        icon: "globe",
        items: [
          { title: "简体中文", value: "zh-CN" },
          { title: "English", value: "en-US" }
        ]
      }
    },
    motion: {
      description: "Motion preference",
      toolbar: {
        icon: "lightning",
        items: [
          { title: "System", value: "system" },
          { title: "Reduced", value: "reduced" }
        ]
      }
    }
  },
  decorators: [
    (Story, context) => {
      const selectedDir = String(context.globals["dir"]);
      const selectedLocale = String(context.globals["locale"]);
      const selectedMotion = String(context.globals["motion"]);
      const selectedTheme = String(context.globals["theme"]);
      const theme =
        selectedTheme === "dark" || selectedTheme === "system" ? selectedTheme : "light";

      return (
        <ConfigProvider
          dir={selectedDir === "rtl" ? "rtl" : "ltr"}
          locale={selectedLocale === "en-US" ? "en-US" : "zh-CN"}
          motion={selectedMotion === "reduced" ? "reduced" : "system"}
          theme={theme}
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
      );
    }
  ],
  initialGlobals: {
    dir: "ltr",
    locale: "zh-CN",
    motion: "system",
    theme: "light",
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
