import { DEFAULT_TV_CHART_RESOLUTIONS } from "./constants";
import { TvChartKlineStyle, TvChartLayout, TvChartType } from "./types";

function getDefaultChartAreaSettings() {
  return {
    symbolType: "",
    symbol: "",
    tickerSymbol: "",
    resolution: "",
    period: "",
    chartStyle: TvChartKlineStyle.Candles,
    barSpacing: 6,
    rightOffset: 10,
    mainLegendFold: false,
    panes: [
      {
        stretchFactor: 1e3,
        isMain: true,
        indicators: [],
      },
    ],
  };
}

export function getDefaultChartSettings() {
  return {
    symbol: {
      candle: {
        body: {
          checked: true,
          upColor: null,
          downColor: null,
        },
        border: {
          checked: true,
          upColor: null,
          downColor: null,
        },
        wicks: {
          checked: true,
          upColor: null,
          downColor: null,
        },
      },
    },
    scales: {
      countdown: {
        checked: true,
      },
      depthChart: {
        checked: true,
      },
      crosshairPriceChange: {
        checked: false,
      },
      lastPriceLine: {
        checked: true,
        color: null,
        lineStyle: 0,
      },
    },
    appearance: {
      focusOnClick: false,
      bgColor: {
        type: 0,
        colors: [null, null],
      },
      gridLines: {
        type: 0,
        colors: [null, null],
      },
      crosshair: {
        checked: true,
        color: null,
        lineStyle: 0,
      },
    },
    events: {
      futureEvents: {
        checked: true,
      },
      pastEvents: {
        checked: false,
      },
    },
  };
}

export function getDefaultSettings(theme?: string) {
  return {
    theme: theme ?? "dark",
    chartType: TvChartType.TradingView,
    layout: TvChartLayout.Layout1A,
    kLineStyle: TvChartKlineStyle.Candles,
    pinnedResolutions: DEFAULT_TV_CHART_RESOLUTIONS,
    trade: {
      floatOrderInputEnabled: true,
      crosshairOrderBtnEnabled: true,
      showOrderLine: true,
      orderLineQuickAttachTpSl: true,
      orderLineValueDisplayType: 0,
      orderLinePosition: "right",
      orderHorzLineVisible: true,
      orderLineQuicklyChange: false,
      showPositionLine: true,
      positionLinePosition: "left",
      positionHorzLineVisible: true,
      positionLineQuicklyTPSL: false,
      positionLineCloseAll: false,
      showOrderRecord: true,
    },
    chartSetting: getDefaultChartSettings(),
    drawing: {
      toolbarSwitch: false,
    },
    areas: [getDefaultChartAreaSettings()],
  };
}
