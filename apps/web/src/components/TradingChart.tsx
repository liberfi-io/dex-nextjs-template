"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDexClient } from "@liberfi.io/react";
import { useTranslation } from "@liberfi.io/i18n";
import { Chain, type Token } from "@liberfi.io/types";
import * as UiScaffold from "@liberfi.io/ui-scaffold";
import { SEARCH_MODAL_ID } from "@liberfi.io/ui-tokens";
import {
  TradingView,
  TvChartFeature,
  TvChartKlineStyle,
  TvChartLayout,
  TvChartPriceType,
  TvChartQuoteType,
  TvChartTheme,
  TvChartType,
  getTvChartLibraryLocale,
  parseSymbol,
  stringifySymbol,
  type TradingViewProps,
  type TvChartConfig,
  type WidgetConstructor,
} from "@liberfi.io/ui-tradingview";
import { asJsx } from "../application/jsx";
import { tokenDetailChainSegment } from "../application/routes";

const TradingViewChart = asJsx<TradingViewProps>(TradingView);
import {
  ClientDataFeedModule,
  createTradingViewDatafeedFromModule,
} from "../application/chart/client-data-feed";
import { loadTradingViewWidgetConstructor } from "../application/chart/load-tradingview-widget";
import { TRADING_VIEW_THEME_COLORS } from "../application/chart/trading-view-theme";
import { createTokenChartPriceFormatter } from "../application/chart/trading-view-price-formatter";

export type TradingChartProps = {
  chain: Chain;
  address: string;
  className?: string;
};

function getNativeQuote(chain: Chain): TvChartQuoteType {
  switch (chain) {
    case Chain.ETHEREUM:
      return TvChartQuoteType.ETH;
    case Chain.BINANCE:
      return TvChartQuoteType.BNB;
    default:
      return TvChartQuoteType.SOL;
  }
}

export function TradingChart({ chain, address, className }: TradingChartProps) {
  const { client, subscribeClient } = useDexClient();
  const { i18n } = useTranslation();
  const { onOpen: openTokenSearch } = UiScaffold.useAsyncModal(SEARCH_MODAL_ID);
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
    chain: tokenDetailChainSegment(chain),
    address,
    quote: TvChartQuoteType.USD,
    priceType: TvChartPriceType.Price,
  });
  const nativeQuote = getNativeQuote(chain);
  const handleSelectMultiChartSymbol = useCallback(
    async (activeTickerSymbol: string) => {
      const selected = await openTokenSearch({ params: { chains: [chain] } });
      if (!selected) return null;

      const token = selected as Token;
      const activeSymbol = parseSymbol(activeTickerSymbol);
      return stringifySymbol({
        chain: tokenDetailChainSegment(token.chain),
        address: token.address,
        quote: activeSymbol.quote ?? TvChartQuoteType.USD,
        priceType: activeSymbol.priceType ?? TvChartPriceType.Price,
      });
    },
    [chain, openTokenSearch],
  );
  const tokenToolbar = {
    showMultiChartSelect: true,
    showPriceTypeSwitch: true,
    showQuoteTypeSwitch: true,
    nativeQuote,
    onSelectMultiChartSymbol: handleSelectMultiChartSymbol,
  } as unknown as Exclude<TradingViewProps["toolbar"], false | undefined>;

  const initConfig = useMemo<TvChartConfig>(
    () => ({
      storageId: `token:${chain}:${address}`,
      tickerSymbol,
      datafeed,
      resolution: "1m",
      layout: TvChartLayout.Layout1A,
      chartType: TvChartType.TradingView,
      kLineStyle: TvChartKlineStyle.Candles,
      disabledFeatures: ["trading_account_manager" as TvChartFeature],
      enabledFeatures: ["iframe_loading_compatibility_mode" as TvChartFeature],
      theme: TvChartTheme.Dark,
      ...TRADING_VIEW_THEME_COLORS,
      timezone: "Etc/UTC",
      locale: getTvChartLibraryLocale(i18n.language),
      priceFormatterFactory:
        createTokenChartPriceFormatter as TvChartConfig["priceFormatterFactory"],
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
      toolbar={tokenToolbar}
    />
  );
}
