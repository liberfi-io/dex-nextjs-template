import { extendVariants, Table, TableProps } from "@heroui/react";
import clsx from "clsx";
import { ComponentType } from "react";

const StyledTable = extendVariants(Table, {
  variants: {
    variant: {
      default: {
        wrapper: "bg-content1 p-0 border border-border",
        table: "table-fixed",
        thead: clsx(
          "text-neutral",
          "[&>tr>th]:font-medium",
          "[&>tr>th]:first:pl-6 [&>tr>th]:last:pr-6",
          // border bottom for the table header
          "[&>tr]:first:relative",
          "[&>tr]:first:after:content-['']",
          "[&>tr]:first:after:absolute",
          "[&>tr]:first:after:left-0 [&>tr]:first:after:bottom-0",
          "[&>tr]:first:after:w-full [&>tr]:first:after:h-px",
          "[&>tr]:first:after:bg-border",
        ),
        tbody: clsx(
          "[&:not([data-loading='true']):not([data-empty='true'])>tr]:hover:bg-content2",
          "[&:not([data-loading='true']):not([data-empty='true'])>tr]:cursor-pointer",
          "[&:not([data-loading='true']):not([data-empty='true'])>tr>td]:text-xs",
          "[&:not([data-loading='true']):not([data-empty='true'])>tr>td]:sm:text-sm",
          "[&:not([data-loading='true']):not([data-empty='true'])>tr>td]:first:pl-6",
          "[&:not([data-loading='true']):not([data-empty='true'])>tr>td]:last:pr-6",
          // border bottom for the table row
          "[&:not([data-loading='true']):not([data-empty='true'])>tr]:not-last:relative",
          "[&:not([data-loading='true']):not([data-empty='true'])>tr]:not-last:after:content-['']",
          "[&:not([data-loading='true']):not([data-empty='true'])>tr]:not-last:after:absolute",
          "[&:not([data-loading='true']):not([data-empty='true'])>tr]:not-last:after:left-0 [&>tr]:not-last:after:bottom-0",
          "[&:not([data-loading='true']):not([data-empty='true'])>tr]:not-last:after:w-full [&>tr]:not-last:after:h-px",
          "[&:not([data-loading='true']):not([data-empty='true'])>tr]:not-last:after:bg-border/50",
        ),
        loadingWrapper: "top-[calc(1px+0.25rem+var(--spacing)*10)]",
        emptyWrapper: "absolute inset-0 top-[calc(1px+0.25rem+var(--spacing)*10)] h-auto",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
}) as ComponentType<TableProps & { variant?: "default" }>;

export { StyledTable };
