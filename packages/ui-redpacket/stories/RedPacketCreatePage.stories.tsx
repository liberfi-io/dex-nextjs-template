import type { Meta, StoryObj } from "@storybook/react";
import { RedPacketCreatePage } from "../src";

const meta = {
  component: RedPacketCreatePage,
} satisfies Meta<typeof RedPacketCreatePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  args: {},
} satisfies Story;
