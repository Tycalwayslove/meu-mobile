import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Cell, List } from "../List";
import { IndexList } from "./IndexList";
import type { IndexListProps } from "./types";

const routeGroups = [
  {
    key: "A",
    title: "A",
    content: (
      <List divider="full">
        <Cell title="安静早晨路线" description="2.8 km · 35 分钟" />
        <Cell title="奥体中心路线" description="4.1 km · 50 分钟" />
      </List>
    )
  },
  {
    key: "B",
    title: "B",
    content: (
      <List divider="full">
        <Cell title="滨江夜跑路线" description="5.0 km · 62 分钟" />
        <Cell title="北山散步路线" description="3.4 km · 43 分钟" />
      </List>
    )
  },
  {
    key: "C",
    title: "C",
    content: (
      <List divider="full">
        <Cell title="城市绿道路线" description="6.2 km · 78 分钟" />
        <Cell title="茶园轻徒步" description="7.5 km · 96 分钟" />
      </List>
    )
  }
] as const;

function IndexListPreview({
  sections = routeGroups,
  sticky = true
}: Pick<IndexListProps, "sections" | "sticky">) {
  const firstSection = sections[0];
  const [activeKey, setActiveKey] = useState(firstSection ? firstSection.key : "");
  return (
    <>
      <IndexList
        aria-label="路线索引列表"
        sections={sections}
        sticky={sticky}
        style={{ width: 390, height: 420 }}
        onIndexChange={setActiveKey}
      />
      <output aria-live="polite">当前分组：{activeKey}</output>
    </>
  );
}

const meta = {
  title: "Navigation/IndexList",
  component: IndexList,
  parameters: { layout: "centered" },
  args: { "aria-label": "路线索引列表", sections: routeGroups, sticky: true },
  render: (args) => (
    <IndexListPreview
      sections={args.sections}
      {...(args.sticky === undefined ? {} : { sticky: args.sticky })}
    />
  )
} satisfies Meta<typeof IndexList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const first = canvasElement.querySelector<HTMLButtonElement>('nav button[aria-label="A"]');
    const second = canvasElement.querySelector<HTMLButtonElement>('nav button[aria-label="B"]');
    const output = canvasElement.querySelector<HTMLOutputElement>("output");
    if (!first || !second || !output) throw new window.Error("Expected IndexList index controls");
    if (first.getAttribute("aria-current") !== "location") {
      throw new window.Error("IndexList did not expose its initial active section");
    }

    first.focus();
    first.dispatchEvent(new window.KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }));
    await Promise.resolve();
    if (
      canvasElement.ownerDocument.activeElement !== second ||
      second.getAttribute("aria-current") !== "location" ||
      output.textContent !== "当前分组：B"
    ) {
      throw new window.Error("IndexList keyboard navigation did not activate the next section");
    }
  }
};

export const CustomBrief: Story = {
  args: {
    sections: routeGroups.map((group, index) => ({
      ...group,
      brief: `${index + 1}`,
      title: `分组 ${group.key}`
    }))
  }
};

export const NonSticky: Story = { args: { sticky: false } };
