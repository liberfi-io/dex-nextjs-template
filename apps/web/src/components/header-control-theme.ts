export const HEADER_CONTROL_SURFACE_CLASS = [
  "inline-flex h-8 min-h-0 items-center justify-center rounded-full",
  "border border-border-control/50 bg-surface-interactive/60",
  "text-sm font-medium text-text-secondary",
].join(" ");

export const HEADER_CONTROL_CLASS = [
  HEADER_CONTROL_SURFACE_CLASS,
  "cursor-pointer transition-colors duration-200",
  "hover:border-border-control hover:bg-surface-interactive hover:text-text-primary",
  "active:bg-surface-strong/80",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
].join(" ");

export const HEADER_ICON_CONTROL_CLASS = "w-8 min-w-8 px-0";
