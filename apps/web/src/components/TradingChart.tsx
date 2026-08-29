"use client";

import { useEffect, useMemo, useState } from "react";
import { useDexClient } from "@liberfi.io/react";
import { useTranslation } from "@liberfi.io/i18n";
import { Chain } from "@liberfi.io/types";
import {
  TradingView,
  TvChartKlineStyle,
  TvChartLayout,
  TvChartTheme,
  TvChartType,
  getTvChartLibraryLocale,
  stringifySymbol,
  type TradingViewProps,
  type TvChartConfig,
  type WidgetConstructor,
} from "@liberfi.io/ui-tradingview";
import { asJsx } from "../application/jsx";

const TradingViewChart = asJsx<TradingViewProps>(TradingView);
import {
  ClientDataFeedModule,
  createTradingViewDatafeedFromModule,
} from "../application/chart/client-data-feed";
import {
  loadTradingViewWidgetConstructor,
} from "../application/chart/load-tradingview-widget";

export type TradingChartProps = {
  chain: Chain;
  address: string;
  className?: string;
};

export function TradingChart({ chain, address, className }: TradingChartProps) {
  const { client, subscribeClient } = useDexClient();
  const { i18n } = useTranslation();
  const [widgetConstructor, setWidgetConstructor] = useState<WidgetConstructor | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadTradingViewWidgetConstructor().then((ctor) => {
      if (!cancelled) setWidgetConstructor(() => ctor);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const datafeed = useMemo(() => {
    const module = new ClientDataFeedModule(client, subscribeClient, chain, address);
    return createTradingViewDatafeedFromModule(module);
  }, [address, chain, client, subscribeClient]);

  const tickerSymbol = stringifySymbol({
    chain: chain.toLowerCase(),
    address,
  });

  const initConfig = useMemo<TvChartConfig>(
    () => ({
      storageId: `token:${chain}:${address}`,
      tickerSymbol,
      datafeed,
      resolution: "1m",
      layout: TvChartLayout.Layout1A,
      chartType: TvChartType.TradingView,
      kLineStyle: TvChartKlineStyle.Candles,
      theme: TvChartTheme.Dark,
      timezone: "Etc/UTC",
      locale: getTvChartLibraryLocale(i18n.language),
    }),
    [address, chain, datafeed, i18n.language, tickerSymbol],
  );

  if (!widgetConstructor) {
    return <div className={className ?? "flex-1 w-full h-full"} />;
  }

  return (
    <TradingViewChart
      className={className ?? "flex-1 w-full h-full"}
      initConfig={initConfig}
      widgetConstructor={widgetConstructor}
      libraryPath="/static/charting_library/"
      customCssUrl="custom-styles.css"
    />
  );
}
