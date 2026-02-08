import { memo, useCallback, useLayoutEffect, useMemo } from "react";
import { useTvChartContext } from "./TvChartProvider";
import { TvChartWidgetContainer } from "./TvChartWidgetContainer";

export interface TvChartWidgetProviderProps {
  onReady?: () => void;
}

export const TvChartWidgetProvider = memo(({ onReady }: TvChartWidgetProviderProps) => {
  const { chartManager, chartSettings } = useTvChartContext();

  const renderId = useMemo(
    () =>
      `${chartSettings.timezone}_${chartSettings.linearTradeUnit}_${chartSettings.inverseTradeUnit}_${chartManager.reloadId}`,
    [
      chartSettings.timezone,
      chartSettings.linearTradeUnit,
      chartSettings.inverseTradeUnit,
      chartManager.reloadId,
    ],
  );

  useLayoutEffect(() => {
    chartManager.setLoading(true);
  }, [chartManager, chartSettings.chartType, renderId]);

  const handleReady = useCallback(() => {
    onReady?.();
    chartManager.onInternalWidgetReady();
    chartManager.setLoading(false);
  }, [chartManager, onReady]);

  return (
    <div className="flex-1 w-full overflow-hidden">
      <TvChartWidgetContainer
        onReady={handleReady}
        ref={(ref) => chartManager.setInternalWidget(ref ?? null)}
      />
      {/* {chartManager.loading && <div className="loading-container">...</div>} */}
    </div>
  );
});
