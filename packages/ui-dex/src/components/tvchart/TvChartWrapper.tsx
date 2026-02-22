import { AppRoute, CHAIN_QUOTE_TOKEN_SYMBOLS, formatLongNumber, formatShortNumber } from "../../libs";
import { chainAtom, useRouter, useTranslation } from "@liberfi/ui-base";
import { useTvChartTradeHistories } from "../../hooks/tvchart/useTvChartTradeHistories";
import {
  TvChartKlineStyle,
  TvChartLayout,
  TvChartPriceType,
  TvChartQuoteType,
  TvChartSymbolInfo,
  TvChartTheme,
  TvChartType,
} from "../../libs/tvchart";
import { getTvChartLibraryLocale, parseSymbol, stringifySymbol } from "../../libs/tvchart/utils";
import { DateTime } from "luxon";
import {
  LibrarySymbolInfo,
  Timezone,
} from "../../../../../apps/web/public/static/charting_library";
import { TvChart, TvChartInstance, TvChartProps } from "./TvChart";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Subscription } from "rxjs";
import clsx from "clsx";
import { chainSlugs } from "@liberfi/core";
import { TvChartDataFeedModule } from "./TvChartDataFeedModule";
import { isPriceChartAtom, isUSDChartAtom, tokenAddressAtom } from "../../states";
import { useAtomValue } from "jotai";

export interface TvChartWrapperProps {
  className?: string;
}

export const TvChartWrapper = memo(({ className }: TvChartWrapperProps) => {
  // gtag report { key: g.e1.KLineFirstRender, name: "TVWrapper" }
  const { i18n } = useTranslation();

  const { navigate } = useRouter();

  const chain = useAtomValue(chainAtom);

  const isPriceChart = useAtomValue(isPriceChartAtom);

  const isUSDChart = useAtomValue(isUSDChartAtom);

  const address = useAtomValue(tokenAddressAtom);

  const [chartReady, setChartReady] = useState(false);

  const [fullScreen, setFullScreen] = useState(false);

  const chartRef = useRef<TvChartInstance>(null);

  const subsRef = useRef<Subscription[]>([]);

  // init config
  const [config, setConfig] = useState<TvChartProps["config"]>({
    storageId: "kline",
    tickerSymbol: stringifySymbol({
      chain: chainSlugs[chain]!,
      address: address ?? "",
      priceType: isPriceChart ? TvChartPriceType.Price : TvChartPriceType.MarketCap,
      quote: isUSDChart
        ? TvChartQuoteType.USD
        : (CHAIN_QUOTE_TOKEN_SYMBOLS[chain] as TvChartQuoteType),
    }),
    resolution: "1m",
    datafeedModule: TvChartDataFeedModule,
    theme: TvChartTheme.Dark,
    layout: TvChartLayout.Layout1A,
    chartType: TvChartType.TradingView,
    kLineStyle: TvChartKlineStyle.Candles,
    timezone: DateTime.local().get("zoneName") as unknown as Timezone,
    locale: getTvChartLibraryLocale(i18n.language),
    chartNames: {
      [TvChartType.TradingView]: "TradingView",
      [TvChartType.Original]: "Original",
    },
    priceFormatterFactory: (symbolInfo: LibrarySymbolInfo | null, _minTick: string) => ({
      format: (price: number) => {
        try {
          if (Number(price) > 1e31) return `${price}`;
          if (!symbolInfo) return formatLongNumber(price);
          return (symbolInfo as TvChartSymbolInfo).priceType === TvChartPriceType.Price
            ? formatLongNumber(price)
            : formatShortNumber(price);
        } catch (e) {
          console.warn(e);
          return `${price}`;
        }
      },
    }),
  });

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      locale: getTvChartLibraryLocale(i18n.language),
    }));
  }, [i18n.language]);

  useEffect(() => {
    if (chartReady) {
      chartRef.current?.setSymbol(
        stringifySymbol({
          chain: chainSlugs[chain]!,
          address: address ?? "",
          priceType: isPriceChart ? TvChartPriceType.Price : TvChartPriceType.MarketCap,
          quote: isUSDChart
            ? TvChartQuoteType.USD
            : (CHAIN_QUOTE_TOKEN_SYMBOLS[chain] as TvChartQuoteType),
        }),
      );
    }
  }, [chartReady, chain, address, isPriceChart, isUSDChart]);

  const handleChartReady = useCallback(
    (_chartType: TvChartType) => {
      setChartReady(true);

      chartRef.current?.chartManager?.setLocale(getTvChartLibraryLocale(i18n.language));

      // 切换 active chart 路由跳转到对应 token
      const selectedIndexSubscription = chartRef.current?.chartManager
        ?.on("selectedIndex")
        ?.subscribe(() => {
          const tickerSymbol = chartRef.current?.chartManager?.activeArea?.tickerSymbol;
          if (tickerSymbol) {
            const { chain, address } = parseSymbol(tickerSymbol);
            navigate(`${AppRoute.trade}/${chain}/${address}`);
          }
        });

      if (selectedIndexSubscription) {
        subsRef.current.push(selectedIndexSubscription);
      }

      // active chart 的 symbol 变化，路由跳转到对应 token
      const activeSymbolSubscription =
        chartRef.current?.chartManager?.activeAreaTickerSymbol$?.subscribe(() => {
          const tickerSymbol = chartRef.current?.chartManager?.activeArea?.tickerSymbol;
          if (tickerSymbol) {
            const { chain, address } = parseSymbol(tickerSymbol);
            navigate(`${AppRoute.trade}/${chain}/${address}`);
          }
        });

      if (activeSymbolSubscription) {
        subsRef.current.push(activeSymbolSubscription);
      }
    },
    [i18n.language, navigate],
  );

  useEffect(
    () => () => {
      subsRef.current.forEach((sub) => {
        sub.unsubscribe();
      });
    },
    [],
  );

  // 在 tv chart 上添加交易历史信息 tooltip
  useTvChartTradeHistories({
    chartRef,
    options: {
      showHistory: true,
      chain: chain,
    },
  });

  return (
    <div className={clsx("select-none", className)}>
      <div
        className={clsx(
          "overflow-hidden will-change-auto flex flex-col",
          fullScreen ? "fixed inset-0 z-[1000]" : "w-full h-full",
        )}
      >
        <TvChart
          ref={chartRef}
          config={config}
          onChartReady={handleChartReady}
          onFullscreenSwitch={setFullScreen}
        />
      </div>
    </div>
  );
});
