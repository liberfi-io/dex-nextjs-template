import { Token } from "@chainstream-io/sdk";
import {
  Bar,
  GetMarksCallback,
  LibrarySymbolInfo,
  Mark,
  PeriodParams,
  ResolutionString,
  SubscribeBarsCallback,
  SymbolResolveExtension,
  Timezone,
  VisibleTimeRange,
} from "../../../../../apps/web/public/static/charting_library";
import { TvChartLibraryWidgetBridge } from "./TvChartLibraryWidgetBridge";
import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";

export enum TvChartType {
  TradingView = "TradingView",
  Original = "Original",
}

export enum TvChartPriceType {
  Price = "price",
  MarketCap = "market_cap",
}

export enum TvChartQuoteType {
  USD = "USD",
  SOL = "SOL",
  ETH = "ETH",
  TRX = "TRX",
  BNB = "BNB",
}

export type TvChartResolution =
  | "1s"
  | "5s"
  | "15s"
  | "30s"
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "12h"
  | "1d";

export enum TvChartKlineStyle {
  Bars = 0,
  Candles = 1,
  Line = 2,
  Area = 3,
  HeikenAshi = 8,
  HollowCandles = 9,
  Baseline = 10,
  HiLo = 12,
  Column = 13,
  LineWithMarkers = 14,
  Stepline = 15,
  HLCArea = 16,
  VolCandle = 19,
  Renko = 4,
  Kagi = 5,
  PointAndFigure = 6,
  LineBreak = 7,
}

export enum TvChartTheme {
  Light = "light",
  Dark = "dark",
  Classic = "classic",
}

export enum TvChartFeature {
  HeaderWidget = "header_widget",
  HeaderSimpleMode = "header_simple_mode",
  HeaderKLineTradeMode = "header_kline_trade_mode",
  HeaderPriceTypeMenu = "header_price_type_menu",
  HeaderLayoutSelectMenu = "header_layout_select_menu",
  HeaderCandleStyleMenu = "header_candle_style_menu",
  HeaderCompareSymbolMenu = "header_compare_symbol_menu",
  HeaderFullscreenButton = "header_fullscreen_button",
  MultiCharts = "multi_charts",
  PercentageMarketOrder = "percentage_market_order",
  PercentageLimitOrder = "percentage_limit_order",
  DisplayOrderQuantityHint = "display_order_quantity_hint",
  MouseClickScale = "mouse_click_scale",
  Trade = "trade",
  TradeOrderRecord = "trade_order_record",
  TradeOrderPanel = "trade_order_panel",
  TradeOrderButton = "trade_order_button",
  PriceAlert = "price_alert",
  TradingViewWebhookAlert = "tv_webhook_alert",
  CreateVolumeIndicatorByDefault = "create_volume_indicator_by_default",
  CreateVolumeIndicatorByDefaultOnce = "create_volume_indicator_by_default_once",
  VolumeForceOverlay = "volume_force_overlay",
  HideDrawingToolsByDefault = "hide_drawing_tools_by_default",
  LegendSeriesTitle = "legend_series_title",
  LegendVolume = "legend_volume",
  TimeframesToolbar = "timeframes_toolbar",
  TradeIndicator = "trade_indicator",
  SaveDrawingToServer = "save_drawing_to_server",
  SaveIndicatorSettingToServer = "save_indicator_setting_to_server",
  HistoryDataTools = "history_data_tools",
}

export enum TvChartLayout {
  Layout1A = "1A",
  Layout2A = "2A",
  Layout2B = "2B",
  Layout3A = "3A",
  Layout3B = "3B",
  Layout3C = "3C",
  Layout3D = "3D",
  Layout3E = "3E",
  Layout3F = "3F",
  Layout4A = "4A",
  Layout4B = "4B",
  Layout4C = "4C",
  Layout4D = "4D",
  Layout4E = "4E",
  Layout4F = "4F",
  Layout5A = "5A",
  Layout5B = "5B",
  Layout5C = "5C",
  Layout5D = "5D",
  Layout6A = "6A",
  Layout6B = "6B",
  Layout6C = "6C",
  Layout7A = "7A",
  Layout8A = "8A",
  Layout8B = "8B",
  Layout8C = "8C",
}

export interface TvChartSymbol {
  chain: string;
  address: string;
  quote?: TvChartQuoteType;
  priceType?: TvChartPriceType;
}

// event: tv chart's symbol has changed
export interface TvChartSymbolChange {
  index?: number;
  tickerSymbol: string;
  libTickerSymbol: string;
}

// event: tv chart's visible range has changed
export interface TvChartVisibleRangeChange extends TvChartSymbolChange {
  range: VisibleTimeRange;
}

// tv chart's symbol full information
export interface TvChartSymbolInfo extends LibrarySymbolInfo {
  symbol: string;
  full_name: string;
  address: string;
  priceType: TvChartPriceType;
  quote: TvChartQuoteType;
  precision: number;
  token: Token;
}

export enum TvChartErrorResetType {
  None = 0,
  ResetData = 1,
  ResetChart = 2,
}

export interface ITvChartDataFeedModule {
  onReady(options: {
    setting: TvChartSettings;
    chartManager: TvChartManager;
    instance: TvChartLibraryWidgetBridge;
  }): Promise<void>;

  onDestroy(): void;

  resolveSymbol(
    symbolName: string,
    extension?: SymbolResolveExtension,
  ): Promise<LibrarySymbolInfo | null>;

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
  ): Promise<Bar[]>;

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void,
  ): void;

  unsubscribeBars(listenerGuid: string): void;

  getMarks?(
    symbolInfo: LibrarySymbolInfo,
    from: number,
    to: number,
    onDataCallback: GetMarksCallback<Mark>,
    resolution: ResolutionString,
  ): void;

  getFirstBarTime?(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    options: { timezone: Timezone },
  ): Promise<void>;
}

export interface ITvChartSymbolResolver {
  resolveSymbolInfo(symbol: string): Promise<LibrarySymbolInfo | null>;
  resolveSymbolInfos(symbols: string[]): Promise<LibrarySymbolInfo[]>;
  getSymbolInfo(symbol: string): LibrarySymbolInfo | null;
}
