import type { Meta, StoryObj } from "@storybook/react";
import { LaunchPadHome } from "../src/components";

const meta = {
  component: LaunchPadHome,
} satisfies Meta<typeof LaunchPadHome>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
  args: {},
} satisfies Story;
