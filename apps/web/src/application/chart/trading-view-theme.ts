import type { TvChartConfig } from "@liberfi.io/ui-tradingview";

type ThemeAwareChartColors = Pick<TvChartConfig, "backgroundColor"> & {
  increaseColor: string;
  decreaseColor: string;
};

export const TRADING_VIEW_THEME_COLORS: ThemeAwareChartColors = {
  backgroundColor: "var(--color-surface-base)",
  increaseColor: "var(--color-positive)",
  decreaseColor: "var(--color-negative)",
};
