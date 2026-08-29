import { MeuIconChevronLeft, MeuIconSearch, MeuIconX } from "@meu/icons-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { IconButton } from "./IconButton";

function SearchButtonPreview() {
  const [pressed, setPressed] = useState(false);
  return (
    <>
      <IconButton
        aria-label="搜索"
        aria-pressed={pressed}
        onClick={() => setPressed((current) => !current)}
      >
        <MeuIconSearch />
      </IconButton>
      <output aria-live="polite">搜索状态：{pressed ? "已开启" : "已关闭"}</output>
    </>
  );
}

const meta = {
  title: "Actions/IconButton",
  component: IconButton,
  args: { "aria-label": "搜索", children: <MeuIconSearch /> }
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SearchButtonPreview />,
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>('button[aria-label="搜索"]');
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (!button || !output) throw new window.Error("Expected IconButton preview");
    if (button.getAttribute("aria-pressed") !== "false") {
      throw new window.Error("IconButton did not expose its initial pressed state");
    }

    button.focus();
    button.click();
    await Promise.resolve();
    if (
      button.getAttribute("aria-pressed") !== "true" ||
      output.textContent !== "搜索状态：已开启" ||
      canvasElement.ownerDocument.activeElement !== button
    ) {
      throw new window.Error("IconButton click did not update state while retaining focus");
    }
  }
};
export const Solid: Story = { args: { variant: "solid", tone: "accent" } };
export const OutlineDanger: Story = {
  args: { "aria-label": "关闭", children: <MeuIconX />, variant: "outline", tone: "danger" }
};
export const Loading: Story = { args: { loading: true } };
export const Pressed: Story = {
  args: { "aria-label": "取消收藏", "aria-pressed": true, variant: "outline", tone: "accent" }
};
export const Disabled: Story = { args: { disabled: true } };
export const ExternalLabel: Story = {
  render: () => (
    <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
      <span id="icon-button-search-label">搜索商品</span>
      <IconButton aria-labelledby="icon-button-search-label">
        <MeuIconSearch />
      </IconButton>
    </div>
  )
};
export const DirectionalRtl: Story = {
  render: () => (
    <div dir="rtl">
      <IconButton aria-label="返回上一页">
        <MeuIconChevronLeft style={{ transform: "scaleX(-1)" }} />
      </IconButton>
    </div>
  )
};
export const Sizes: Story = {
  render: () => (
    <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
      <IconButton aria-label="小尺寸搜索" size="small">
        <MeuIconSearch />
      </IconButton>
      <IconButton aria-label="中尺寸搜索" size="medium">
        <MeuIconSearch />
      </IconButton>
      <IconButton aria-label="大尺寸搜索" size="large">
        <MeuIconSearch />
      </IconButton>
    </div>
  )
};
