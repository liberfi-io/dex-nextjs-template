/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { formatLongNumber, getNumberDefaultPrecision, objectKeys } from "@/libs";
import { tokenInfoAtom } from "@/states";
import { ChainStreamClient, Candle, Resolution, Token  } from "@chainstream-io/sdk";
import { StreamApi } from "@chainstream-io/sdk/stream";
import { CONFIG } from "@liberfi/core";
import { useDexClient } from "@liberfi/react-dex";
import { useRouter, useTranslation } from "@liberfi/ui-base";
import { useAtomValue } from "jotai";
import { isEmpty } from "lodash-es";
import { DateTime } from "luxon";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChartPropertiesOverrides,
  DatafeedConfiguration,
  ErrorCallback,
  HistoryCallback,
  IChartingLibraryWidget,
  LanguageCode,
  LibrarySymbolInfo,
  OnReadyCallback,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
  Timezone,
  TradingTerminalFeatureset,
  TradingTerminalWidgetOptions,
  widget as Widget,
} from "../../../../apps/web/public/static/charting_library";

export const RESOLUTION_MAP = {
  "1S": Resolution["1s"],
  "15S": Resolution["15s"],
  "30S": Resolution["30s"],
  "1": Resolution["1m"],
  "5": Resolution["5m"],
  "15": Resolution["15m"],
  "60": Resolution["1h"],
  "240": Resolution["4h"],
  "720": Resolution["12h"],
  "1D": Resolution["1d"],
} as Record<ResolutionString, Resolution>;

export const LOCALE_MAP = {
  en: "en",
  "zh-CN": "zh",
} as Record<string, LanguageCode>;

export const DEFAULT_COLORS = {
  backgroundColor: "#1A1A1A",
  upColor: "#BCFF2E",
  downColor: "#F76816",
};

export const DEFAULT_RESOLUTION = "1";

export type TvWidget = IChartingLibraryWidget & { _id?: string; _ready?: boolean };

export interface TradingViewBar {
  // Properties corresponding to the TradingView.Bar interface, used by library for rendering
  time: number;
  low: number;
  high: number;
  open: number;
  close: number;
  volume: number;
}

export interface TradingViewChartBar extends TradingViewBar {
  // Additional properties used to re-map Bars conditionally if orderbookCandles is enabled
  tradeOpen: number;
  tradeClose: number;
  tradeLow: number;
  tradeHigh: number;
  // trades: number;
  // assetVolume: number;
  // usdVolume: number;
}

const timezone = DateTime.local().get("zoneName") as unknown as Timezone;

export const useTradingView = ({
  tvWidget,
  setTvWidget,
}: {
  tvWidget?: TvWidget;
  setTvWidget: Dispatch<SetStateAction<TvWidget | undefined>>;
}) => {
  const { i18n } = useTranslation();

  const [resolution, setResolution] = useState<Resolution>(Resolution["1m"]); // TODO 放在全局

  const client = useDexClient();
  const token = useAtomValue(tokenInfoAtom);
  // const languageCode = SUPPORTED_LOCALE_MAP[selectedLocale].baseTag;
  const savedTvChartConfig = useMemo(() => ({}), []); // TODO

  const { useSearchParams } = useRouter();
  const searchParams = useSearchParams();

  const subscribeCandles = useCallback<StreamApi["subscribeTokenCandles"]>(
    (options) => client.stream.subscribeTokenCandles(options),
    [client],
  );

  useEffect(() => {
    if (client && token && !tvWidget) {
      const widgetOptions = getWidgetOptions(DEFAULT_COLORS);
      const widgetOverrides = getWidgetOverrides(DEFAULT_COLORS);

      const options: TradingTerminalWidgetOptions = {
        ...widgetOptions,
        ...widgetOverrides,
        datafeed: getDatafeed({
          client,
          token,
          subscribeCandles,
        }),
        interval: (resolution ?? DEFAULT_RESOLUTION) as ResolutionString,
        locale: LOCALE_MAP[i18n.language] ?? "en",
        symbol: token.symbol,
        saved_data: !isEmpty(savedTvChartConfig) ? savedTvChartConfig : undefined,
        auto_save_delay: 1,
        custom_formatters: {
          priceFormatterFactory: (symbolInfo: LibrarySymbolInfo | null) => ({
            format: (price) => {
              try {
                if (Number(price) > 1e31) return `${price}`;
                if (!symbolInfo) return formatLongNumber(price);
                return formatLongNumber(price);
                // return symbolInfo.priceType === "price" ? formatLongNumber(price) : formatShortNumber(price);
              } catch (e) {
                console.warn(e);
                return `${price}`;
              }
            },
          }),
        },
      };

      const tvChartWidget = new Widget(options);
      setTvWidget(tvChartWidget);

      tvChartWidget.onChartReady(() => {
        console.log("tvChartWidget.onChartReady");

        tvChartWidget.applyOverrides(getTvWidgetChartPropertiesOverrides(DEFAULT_COLORS));

        // tvChartWidget.onContextMenu();

        tvChartWidget.headerReady().then(() => {});

        tvChartWidget.subscribe("onAutoSaveNeeded", () => {
          tvChartWidget.save((chartConfig: object) => {
            console.log("tv onAutoSaveNeeded: ", chartConfig);
            // dispatch(updateChartConfig(chartConfig));
          });
        });
      });
    }

    return () => {
      console.log("useTradingView unmount");
      tvWidget?.remove();
    };
    // TODO 这里需要优化，如果 token 刷新了，不应该重新创建 widget
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    client,
    token?.address,
    tvWidget,
    setTvWidget,
    savedTvChartConfig,
    resolution,
    subscribeCandles,
    i18n.language,
  ]);
};

const configurationData: DatafeedConfiguration = {
  supported_resolutions: objectKeys(RESOLUTION_MAP),
  supports_marks: true,
  exchanges: [
    {
      value: CONFIG.branding.name, // `exchange` argument for the `searchSymbols` method, if a user selects this exchange
      name: CONFIG.branding.name, // filter name
      desc: `${CONFIG.branding.name} exchange`, // full exchange name displayed in the filter popup
    },
  ],
  symbols_types: [
    {
      name: "crypto",
      value: "crypto", // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
    },
  ],
};

const getDatafeed = ({
  client,
  token,
  subscribeCandles,
}: {
  client: ChainStreamClient;
  token: Token;
  subscribeCandles: StreamApi["subscribeTokenCandles"];
}) => ({
  onReady: (callback: OnReadyCallback) => {
    console.log("datafeed onReady");
    setTimeout(() => callback(configurationData), 0);
  },
  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: SearchSymbolsCallback,
  ) => {
    onResultReadyCallback([]);
  },
  resolveSymbol: async (symbolName: string, onSymbolResolvedCallback: ResolveCallback) => {
    // TODO 应该在这里去取 对应 symbol 数据

    // 根据实时价格获得展示的精度
    const precision = getNumberDefaultPrecision(token.marketData.priceInUsd, true);

    const symbolInfo = {
      // TODO
      // address,
      name: token.name,
      // symbol
      // full_name
      ticker: token.symbol,
      description: token.description ?? token.symbol,

      type: "crypto",
      session: "24x7",
      exchange: CONFIG.branding.name,
      listed_exchange: "",
      format: "price",
      // price_type
      pricescale: Math.pow(10, precision),
      precision,
      minmov: 1,
      supported_resolutions: configurationData.supported_resolutions,
      timezone,
      has_ticks: true,
      has_seconds: true,
      has_intraday: true,
      has_daily: true,
      has_no_volume: false,

      // currency_code
      // exchange_symbol
      // quote
    };
    setTimeout(() => onSymbolResolvedCallback(symbolInfo as LibrarySymbolInfo), 0);
  },
  getBars: async (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: {
      countBack: number;
      from: number;
      to: number;
      firstDataRequest: boolean;
    },
    onHistoryCallback: HistoryCallback,
    onErrorCallback: ErrorCallback,
  ) => {
    if (!symbolInfo) return;

    const { from, to } = periodParams;
    const fromMs = from * 1000;
    const toMs = to * 1000;

    console.warn("getBars symbolInfo.ticker: ", symbolInfo.ticker, "resolution: ", from, to, {
      chain: token.chain,
      address: token.address,
      resolution: RESOLUTION_MAP[resolution],
      _from: fromMs,
      to: toMs,
    });

    try {
      const candles = await client.token.getCandles("sol", token.address, {
        resolution: RESOLUTION_MAP[resolution],
        from: fromMs,
        to: toMs,
      });

      const bars = candles.map(mapCandle);

      if (candles.length === 0) {
        onHistoryCallback([], {
          noData: true,
        });
      } else {
        onHistoryCallback(bars, {
          noData: false,
        });
      }
    } catch (error: any) {
      console.error("tradingView/getBars", error);
      onErrorCallback(error);
    }
  },
  subscribeBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: Function,
  ) => {
    console.warn("subscribeBars: ", resolution);

    const unsubscriber = subscribeCandles({
      chain: "sol",
      tokenAddress: token.address,
      resolution: RESOLUTION_MAP[resolution],
      callback: (data: Candle) => {
        if (!symbolInfo.ticker) return;

        onTick(mapCandle(data));
      },
    });

    subscriptionsByGuid[listenerGuid] = {
      guid: listenerGuid,
      unsub: () => unsubscriber.unsubscribe(),
    };
  },
  unsubscribeBars: (subscriberUID: string) => {
    console.log("unsubscribeBars, subscriberUID: ", subscriberUID);

    subscriptionsByGuid[subscriberUID]?.unsub();
    subscriptionsByGuid[subscriberUID] = undefined;
  },
});

export const mapCandle = ({
  low,
  high,
  open,
  close,
  volume,
  time,
}: Candle): TradingViewChartBar => {
  const tradeOpen = parseFloat(open);
  const tradeClose = parseFloat(close);
  const tradeLow = parseFloat(low);
  const tradeHigh = parseFloat(high);

  return {
    open: tradeOpen,
    close: tradeClose,
    low: tradeLow,
    high: tradeHigh,
    volume: Number(volume),
    time: new Date(time).getTime(),
    tradeOpen,
    tradeClose,
    tradeLow,
    tradeHigh,
  };
};

export const getWidgetOverrides = ({
  upColor,
  downColor,
}: {
  upColor: string;
  downColor: string;
}) =>
  //   {}: // appTheme,
  // // appColorMode,
  // {
  //   // appTheme: AppTheme;
  //   // appColorMode: AppColorMode;
  // }
  {
    // const theme = Themes[appTheme][appColorMode];

    return {
      theme: "Dark" as const, // THEME_NAMES[appTheme],
      overrides: {
        volumePaneSize: "tiny",
        "paneProperties.leftAxisProperties.background": "#000000", // 左侧背景色
        "paneProperties.leftAxisProperties.backgroundTransparency": 50, // 透明度 (0-100)

        // 'paneProperties.background': theme.layer2,
        // 'paneProperties.horzGridProperties.color': theme.layer3,
        // 'paneProperties.vertGridProperties.color': theme.layer3,
        "paneProperties.crossHairProperties.style": 1,
        "paneProperties.legendProperties.showBarChange": false,
        "paneProperties.backgroundType": "solid" as const,

        "mainSeriesProperties.style": 1,
        // 'mainSeriesProperties.candleStyle.upColor': theme.positive,
        // 'mainSeriesProperties.candleStyle.borderUpColor': theme.positive,
        // 'mainSeriesProperties.candleStyle.wickUpColor': theme.positive,
        // 'mainSeriesProperties.candleStyle.downColor': theme.negative,
        // 'mainSeriesProperties.candleStyle.borderDownColor': theme.negative,
        // 'mainSeriesProperties.candleStyle.wickDownColor': theme.negative,
        "mainSeriesProperties.statusViewStyle.symbolTextSource": "ticker",

        // 'scalesProperties.textColor': theme.textPrimary,
        // 'scalesProperties.backgroundColor': theme.layer2,
        // 'scalesProperties.lineColor': theme.layer3,
        "scalesProperties.fontSize": 12,
      } as Partial<ChartPropertiesOverrides>,
      studies_overrides: {
        "volume.volume.color.1": upColor,
        "volume.volume.color.0": downColor,
        "volume.volume.transparency": 60,
        "volume.volume ma.visible": false,
        // 'relative strength index.plot.color': theme.accent,
        "relative strength index.plot.linewidth": 1.5,
        "relative strength index.hlines background.color": "#134A9F",
      },
      // 添加时间刻度配置
      timeScale: {
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 6,
        minBarSpacing: 4,
      },
      loading_screen: {
        // backgroundColor: theme.layer2,
        // foregroundColor: theme.layer2,
      },
    };
  };

export const getWidgetOptions = (
  {
    backgroundColor,
    upColor,
    downColor,
  }: { backgroundColor: string; upColor: string; downColor: string },
  isViewingUnlaunchedMarket?: boolean,
): Partial<TradingTerminalWidgetOptions> & Pick<TradingTerminalWidgetOptions, "container"> => {
  const disabledFeaturesForUnlaunchedMarket: TradingTerminalFeatureset[] = [
    "chart_scroll",
    "chart_zoom",
  ];

  const enabledFeatures: TradingTerminalFeatureset[] = [
    "seconds_resolution",
    "remove_library_container_border",
    "hide_last_na_study_output",
    "dont_show_boolean_study_arguments",
    "hide_left_toolbar_by_default",
    "hide_right_toolbar",
    "support_multicharts",
  ];

  const disabledFeatures: TradingTerminalFeatureset[] = [
    "header_symbol_search",
    "header_compare",
    "symbol_search_hot_key",
    "symbol_info",
    "go_to_date",
    // 'timeframes_toolbar',
    "header_layouttoggle", // 禁止选择layout
    "trading_account_manager",
    // 'header_widget', // 隐藏头部工具栏
    // 'left_toolbar',
    ...(isViewingUnlaunchedMarket ? disabledFeaturesForUnlaunchedMarket : []),
  ];

  return {
    toolbar_bg: backgroundColor,
    debug: true,
    container: "tv-price-chart",
    library_path: "/static/charting_library/", // relative to public folder
    custom_css_url: "/static/charting_library/custom-styles.css",
    custom_font_family: "'Satoshi', system-ui, -apple-system, Helvetica, Arial, sans-serif",
    autosize: true,
    timezone,
    /*
    time_frames: [
      { "text": "1S", "resolution": "1s" as ResolutionString, description: '1 Second' },
      { "text": "15S", "resolution": "15s" as ResolutionString, description: '15 Seconds' },
      { "text": "30S", "resolution": "30s" as ResolutionString, description: '30 Seconds' },
      { "text": "1M", "resolution": "1" as ResolutionString, description: '1 Minute' },
      { "text": "5M", "resolution": "5" as ResolutionString, description: '5 Minute' },
      { "text": "15M", "resolution": "15" as ResolutionString, description: '15 Minute' },
      { "text": "1H", "resolution": "1h" as ResolutionString, description: '1 Hour' },
      { "text": "4H", "resolution": "4h" as ResolutionString, description: '4 Hour' },
      { "text": "12H", "resolution": "12h" as ResolutionString, description: '12 Hour' },
      { "text": "1D", "resolution": "1d" as ResolutionString, description: '1 Day' },
    ],
    */
    disabled_features: disabledFeatures,
    enabled_features: enabledFeatures,
  };
};

export const subscriptionsByGuid: {
  [guid: string]:
    | {
        guid: string;
        unsub: () => void;
      }
    | undefined;
} = {};

export const getTvWidgetChartPropertiesOverrides = ({
  backgroundColor,
  upColor,
  downColor,
}: {
  backgroundColor: string;
  upColor: string;
  downColor: string;
}): Partial<ChartPropertiesOverrides> => ({
  "paneProperties.background": backgroundColor,
  "paneProperties.backgroundType": "solid",
  "mainSeriesProperties.candleStyle.upColor": upColor,
  "mainSeriesProperties.candleStyle.downColor": downColor,
  "mainSeriesProperties.candleStyle.borderUpColor": upColor,
  "mainSeriesProperties.candleStyle.borderDownColor": downColor,
  "mainSeriesProperties.candleStyle.wickUpColor": upColor,
  "mainSeriesProperties.candleStyle.wickDownColor": downColor,
  "mainSeriesProperties.barStyle.upColor": upColor,
  "mainSeriesProperties.barStyle.downColor": downColor,
  "mainSeriesProperties.lineStyle.color": upColor,
  "mainSeriesProperties.areaStyle.color2": upColor,
  "mainSeriesProperties.areaStyle.linecolor": upColor,
  "mainSeriesProperties.renkoStyle.upColor": upColor,
  "mainSeriesProperties.renkoStyle.downColor": downColor,
  "mainSeriesProperties.renkoStyle.borderUpColor": upColor,
  "mainSeriesProperties.renkoStyle.borderDownColor": downColor,
  "mainSeriesProperties.kagiStyle.upColor": upColor,
  "mainSeriesProperties.kagiStyle.downColor": downColor,
  "mainSeriesProperties.pnfStyle.upColor": upColor,
  "mainSeriesProperties.pnfStyle.downColor": downColor,
  "mainSeriesProperties.pbStyle.upColor": upColor,
  "mainSeriesProperties.pbStyle.downColor": downColor,
  "mainSeriesProperties.pbStyle.borderUpColor": upColor,
  "mainSeriesProperties.pbStyle.borderDownColor": downColor,
  "mainSeriesProperties.haStyle.upColor": upColor,
  "mainSeriesProperties.haStyle.downColor": downColor,
  "mainSeriesProperties.haStyle.borderUpColor": upColor,
  "mainSeriesProperties.haStyle.borderDownColor": downColor,
  "mainSeriesProperties.haStyle.wickUpColor": upColor,
  "mainSeriesProperties.haStyle.wickDownColor": downColor,
  "mainSeriesProperties.hollowCandleStyle.upColor": upColor,
  "mainSeriesProperties.hollowCandleStyle.downColor": downColor,
  "mainSeriesProperties.hollowCandleStyle.borderUpColor": upColor,
  "mainSeriesProperties.hollowCandleStyle.borderDownColor": downColor,
  "mainSeriesProperties.hollowCandleStyle.wickUpColor": upColor,
  "mainSeriesProperties.hollowCandleStyle.wickDownColor": downColor,
  "mainSeriesProperties.baselineStyle.topLineColor": upColor,
  "mainSeriesProperties.baselineStyle.bottomLineColor": downColor,
  "mainSeriesProperties.baselineStyle.topFillColor1": "".concat(upColor, "40"),
  "mainSeriesProperties.baselineStyle.topFillColor2": "".concat(upColor, "10"),
  "mainSeriesProperties.baselineStyle.bottomFillColor1": "".concat(downColor, "10"),
  "mainSeriesProperties.baselineStyle.bottomFillColor2": "".concat(downColor, "40"),
  "mainSeriesProperties.hiloStyle.color": upColor,
  "mainSeriesProperties.hiloStyle.borderColor": upColor,
  "mainSeriesProperties.hiloStyle.labelColor": upColor,
  "toolbar.button.background.active": upColor,
});
