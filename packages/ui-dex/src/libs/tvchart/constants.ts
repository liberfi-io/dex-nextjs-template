import { CONFIG } from "@liberfi/core";
import { TvChartFeature, TvChartLayout, TvChartResolution } from "./types";

export const ENABLED_TV_CHART_FEATURES: TvChartFeature[] = [
  TvChartFeature.HeaderWidget,
  TvChartFeature.HeaderPriceTypeMenu,
  TvChartFeature.HeaderLayoutSelectMenu,
  TvChartFeature.HeaderCandleStyleMenu,
  TvChartFeature.HeaderFullscreenButton,
  TvChartFeature.MultiCharts,
  TvChartFeature.VolumeForceOverlay,
  TvChartFeature.LegendSeriesTitle,
  TvChartFeature.TimeframesToolbar,
  TvChartFeature.HeaderCompareSymbolMenu,
  TvChartFeature.SaveDrawingToServer,
];

export const DEFAULT_TV_CHART_RESOLUTIONS: TvChartResolution[] = [
  "1s",
  "30s",
  "1m",
  "1h",
  "4h",
  "1d",
];

export const ALL_TV_CHART_RESOLUTIONS: TvChartResolution[] = [
  "1s",
  // "5s",
  "15s",
  "30s",
  "1m",
  "5m",
  "15m",
  // "30m",
  "1h",
  "4h",
  "12h",
  "1d",
];

export const SUPPORTED_TV_CHART_LAYOUTS: TvChartLayout[] = [
  TvChartLayout.Layout1A,
  TvChartLayout.Layout2A,
  TvChartLayout.Layout2B,
  TvChartLayout.Layout3A,
  TvChartLayout.Layout3B,
  TvChartLayout.Layout3C,
  TvChartLayout.Layout3D,
  TvChartLayout.Layout3E,
  TvChartLayout.Layout3F,
  TvChartLayout.Layout4A,
  TvChartLayout.Layout4B,
  TvChartLayout.Layout4C,
  TvChartLayout.Layout4D,
  TvChartLayout.Layout4E,
  TvChartLayout.Layout4F,
  TvChartLayout.Layout5A,
  TvChartLayout.Layout5B,
  TvChartLayout.Layout5C,
  TvChartLayout.Layout5D,
  TvChartLayout.Layout6A,
  TvChartLayout.Layout6B,
  TvChartLayout.Layout6C,
  TvChartLayout.Layout7A,
  TvChartLayout.Layout8A,
  TvChartLayout.Layout8B,
  TvChartLayout.Layout8C,
];

export const DEFAULT_TV_CHART_DISPLAY_OPTIONS = {
  // 我的交易
  mine: true,
  // 开发者
  dev: true,
  // 已关注
  following: true,
  // 聪明钱
  smart: true,
  // KOL/VC
  kol: true,
  // 老鼠仓
  rat_trader: false,
  // 狙击者
  sniper: false,
  // 鲸鱼
  whale: false,
  // 新钱包
  fresh: false,
  // 持币大户
  top_holder: false,
};

export const TV_CHART_INTERESTED_DOM_EVENTS = [
  "click",
  "keydown",
  "mousedown",
  "mouseup",
  "contextmenu",
];

// TODO using uikit colors
export const TV_CHART_THEME_COLORS = {
  decrease: CONFIG.colors.bearish,
  increase: CONFIG.colors.bullish,
  chartBg: "#1A1A1A",
  card: "#242424",
};

// TODO using uikit colors
export const TV_CHART_LIGHT_THEME_COLORS = {
  card: "#242424",
};
