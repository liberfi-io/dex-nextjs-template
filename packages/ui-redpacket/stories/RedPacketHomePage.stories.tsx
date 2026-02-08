import type { Meta, StoryObj } from "@storybook/react";
import { RedPacketHomePage } from "../src";

const meta = {
  component: RedPacketHomePage,
} satisfies Meta<typeof RedPacketHomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  args: {},
} satisfies Story;
