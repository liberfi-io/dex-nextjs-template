/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG } from "@liberfi/core";
import { of } from "rxjs";
import {
  GetMarksCallback,
  HistoryCallback,
  LibrarySymbolInfo,
  Mark,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
  SubscribeBarsCallback,
  SymbolResolveExtension,
} from "../../../../../apps/web/public/static/charting_library";
import { TvChartLibraryWidgetBridge } from "./TvChartLibraryWidgetBridge";
import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";
import { ALL_TV_CHART_RESOLUTIONS } from "./constants";
import { getTvChartLibraryResolution } from "./utils";

export class TvChartDataFeed {
  setting: TvChartSettings;
  chartManager: TvChartManager;
  instance: TvChartLibraryWidgetBridge;
  debug: boolean;
  abortController: AbortController;

  constructor(
    setting: TvChartSettings,
    chartManager: TvChartManager,
    instance: TvChartLibraryWidgetBridge,
  ) {
    this.debug = false;
    this.abortController = new AbortController();
    this.setting = setting;
    this.chartManager = chartManager;
    this.instance = instance;
  }

  async onReady(callback: (data: any) => void) {
    // gtag report { name: "DatafeedOnReady", key: g.e1.KLineFirstRender }
    if (this.debug) {
      console.debug("TvChartDataFeed.onReady");
    }
    // `onReady` should return result asynchronously. Use `setTimeout` with 0 interval to execute the callback function.
    setTimeout(() => {
      callback({
        supported_resolutions: ALL_TV_CHART_RESOLUTIONS.map(getTvChartLibraryResolution),
        supports_marks: true,
        exchanges: [
          {
            value: CONFIG.branding.name,
            name: CONFIG.branding.name,
            desc: CONFIG.branding.name,
          },
        ],
      });
    });
    await this.chartManager.datafeed?.onReady({
      setting: this.setting,
      chartManager: this.chartManager,
      instance: this.instance,
    });
  }
  destroy() {
    this.abortController.abort();
  }
  async resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback,
    extension?: SymbolResolveExtension,
  ) {
    if (this.debug) {
      console.debug("TvChartDataFeed.resolveSymbol", symbolName);
    }
    try {
      const symbolInfo = await this.chartManager.datafeed?.resolveSymbol(symbolName, extension);
      if (symbolInfo) {
        onResolve(symbolInfo);
      }
    } catch (e) {
      console.error("TvChartDataFeed.resolveSymbol", e);
      onError(e as any);
    }
  }
  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback,
  ) {
    if (this.debug) {
      console.debug("TvChartDataFeed getBars", symbolInfo, resolution, periodParams);
    }
    // if (periodParams.firstDataRequest) {
    // gtag report { name: "getBarsFistCallStart", key: g.e1.KLineFirstRender }
    // }

    try {
      const bars = await this.chartManager.datafeed?.getBars(symbolInfo, resolution, periodParams);
      // if (periodParams.firstDataRequest) {
      // gtag report { name: "getBarsFistCallEnd", key: g.e1.KLineFirstRender }
      // }
      if (bars) {
        onResult(bars, { noData: true });
      }
    } catch (e) {
      console.error("TvChartDataFeed.getBars", e);
      onError(e as any);
    }
  }
  onMainSeriesError(_symbol?: string, _resolution?: string) {
    return of([1, 2]);
  }
  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void,
  ) {
    this.chartManager.datafeed?.subscribeBars(
      symbolInfo,
      resolution,
      onTick,
      listenerGuid,
      onResetCacheNeededCallback,
    );
  }
  unsubscribeBars(listenerGuid: string) {
    this.chartManager.datafeed?.unsubscribeBars(listenerGuid);
  }
  async getMarks(
    symbolInfo: LibrarySymbolInfo,
    from: number,
    to: number,
    onDataCallback: GetMarksCallback<Mark>,
    resolution: ResolutionString,
  ) {
    this.chartManager.datafeed?.getMarks?.(symbolInfo, from, to, onDataCallback, resolution);
  }
  resetData(tickerSymbol?: string, resolution?: string, priceType?: string) {
    if (this.debug) {
      console.debug("TvChartDataFeed.resetData", tickerSymbol, resolution, priceType);
    }
  }
  getBarRange(tickerSymbol: string, resolution: string): any {
    if (this.debug) {
      console.debug("TvChartDataFeed.getBarRange", tickerSymbol, resolution);
    }
  }
}
