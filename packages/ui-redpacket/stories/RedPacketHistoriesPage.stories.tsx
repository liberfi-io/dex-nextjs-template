import type { Meta, StoryObj } from "@storybook/react";
import { RedPacketHistoriesPage } from "../src";

const meta = {
  component: RedPacketHistoriesPage,
} satisfies Meta<typeof RedPacketHistoriesPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  args: {},
} satisfies Story;
