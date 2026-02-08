import { extendVariants, Tooltip, TooltipProps } from "@heroui/react";
import { ComponentType } from "react";

const StyledTooltip = extendVariants(Tooltip, {
  variants: {
    variant: {
      default: {
        content: "bg-content1 text-neutral border-1 border-border",
      },
    },
    // size variant conflicts, use layout instead
    layout: {
      xs: { content: "px-1.5 py-1 text-xs" },
      sm: { content: "px-1.5 py-1 text-sm" },
      md: { content: "px-1.5 py-1 text-base" },
      lg: { content: "px-1.5 py-1 text-lg" },
    },
  },
  defaultVariants: {
    variant: "default",
    layout: "xs",
  },
}) as ComponentType<TooltipProps & { variant?: "default"; layout?: "xs" | "sm" | "md" | "lg" }>;

export { StyledTooltip };
