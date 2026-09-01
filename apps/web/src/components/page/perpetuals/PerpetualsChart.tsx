"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import {
  TradingView,
  TvChartHandle,
  TvChartKlineStyle,
  TvChartLayout,
  TvChartTheme,
  TvChartType,
  getTvChartLibraryLocale,
  type TradingViewProps,
  type TvChartConfig,
  type WidgetConstructor,
} from "@liberfi.io/ui-tradingview";
import { asJsxWithRef } from "../../../application/jsx";

const TradingViewChart = asJsxWithRef<TradingViewProps, TvChartHandle>(TradingView);
import {
  PERPETUALS_CHART_RESOLUTIONS,
  createPerpetualsTradingViewDatafeed,
  type PerpetualsChartClient,
} from "../../../application/chart/perpetuals-data-feed";
import { loadTradingViewWidgetConstructor } from "../../../application/chart/load-tradingview-widget";
import { TRADING_VIEW_THEME_COLORS } from "../../../application/chart/trading-view-theme";

export type PerpetualsChartProps = {
  symbol: string;
  client: PerpetualsChartClient;
};

export const PerpetualsChart = memo(function PerpetualsChart({
  symbol,
  client,
}: PerpetualsChartProps) {
  const { t, i18n } = useTranslation();
  const chartRef = useRef<TvChartHandle>(null);
  const [widgetConstructor, setWidgetConstructor] = useState<WidgetConstructor | null>(null);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadTradingViewWidgetConstructor().then((ctor) => {
      if (!cancelled) setWidgetConstructor(() => ctor);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const datafeed = useMemo(() => createPerpetualsTradingViewDatafeed(client), [client]);

  const initConfig = useMemo<TvChartConfig>(
    () => ({
      storageId: "perps-kline",
      tickerSymbol: symbol,
      datafeed,
      resolution: "1m",
      supportedResolutions: PERPETUALS_CHART_RESOLUTIONS,
      layout: TvChartLayout.Layout1A,
      chartType: TvChartType.TradingView,
      kLineStyle: TvChartKlineStyle.Candles,
      theme: TvChartTheme.Dark,
      ...TRADING_VIEW_THEME_COLORS,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: getTvChartLibraryLocale(i18n.language),
      chartNames: {
        [TvChartType.TradingView]: t("perpetuals.page.chart.tradingview"),
        [TvChartType.Original]: t("perpetuals.page.chart.original"),
      },
    }),
    [datafeed, i18n.language, symbol, t],
  );

  useEffect(() => {
    if (!chartReady) return;
    void chartRef.current?.chartManager.activeArea?.setSymbol(symbol);
  }, [chartReady, symbol]);

  const handleChartReady = useCallback(() => {
    setChartReady(true);
  }, []);

  if (!widgetConstructor) {
    return <div className="flex-1 w-full min-h-0" />;
  }

  return (
    <div className="flex-1 w-full min-h-0 flex flex-col">
      <TradingViewChart
        ref={chartRef}
        className="flex-1 w-full h-full"
        initConfig={initConfig}
        widgetConstructor={widgetConstructor}
        libraryPath="/static/charting_library/"
        customCssUrl="custom-styles.css"
        onReady={handleChartReady}
      />
    </div>
  );
});
