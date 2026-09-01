export const TOKEN_TRADE_MIN_CHART_HEIGHT = 200;
export const TOKEN_TRADE_SPLIT_HANDLE_HEIGHT = 4;

export interface ClampTokenTradeChartHeightOptions {
  currentHeight: number;
  delta: number;
  outerHeight: number;
  headerHeight: number;
}

export function clampTokenTradeChartHeight({
  currentHeight,
  delta,
  outerHeight,
  headerHeight,
}: ClampTokenTradeChartHeightOptions): number {
  const nextHeight = currentHeight + delta;
  const maxHeight =
    outerHeight -
    headerHeight -
    TOKEN_TRADE_SPLIT_HANDLE_HEIGHT;

  return Math.max(
    TOKEN_TRADE_MIN_CHART_HEIGHT,
    Math.min(nextHeight, maxHeight),
  );
}
