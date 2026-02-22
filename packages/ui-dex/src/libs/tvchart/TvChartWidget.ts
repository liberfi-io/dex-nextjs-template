/* eslint-disable @typescript-eslint/no-explicit-any */
import { filter, map, Observable } from "rxjs";
import {
  ResolutionString,
  SeriesType,
} from "../../../../../apps/web/public/static/charting_library";
import { TvChartDataFeed } from "./TvChartDataFeed";
import { TvChartLibraryWidgetBridge } from "./TvChartLibraryWidgetBridge";
import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";
import { duplicate, observableToPromise } from "..";
import { getTvChartLibraryResolution } from "./utils";
import { TvChartResolution } from "./types";

export class TvChartWidget {
  settings: TvChartSettings;
  chartManager: TvChartManager;
  instance: TvChartLibraryWidgetBridge;
  chartIndex: number;

  constructor(
    settings: TvChartSettings,
    chartManager: TvChartManager,
    instance: TvChartLibraryWidgetBridge,
    index: number,
  ) {
    this.settings = settings;
    this.chartManager = chartManager;
    this.instance = instance;
    this.chartIndex = index;
  }
  get chartAreaManager() {
    return this.chartManager.areaByIndex(this.chartIndex);
  }
  get widget() {
    return this.instance.getWidget();
  }
  get chartWidget() {
    return this.widget?.chart(this.chartIndex) ?? null;
  }
  setChartStyle(chartType: SeriesType) {
    this.chartWidget?.setChartType(chartType);
  }
  getChartStyle() {
    return this.chartWidget?.chartType() ?? 1;
  }
  handleSymbolChange(symbol: string, _prevSymbol: string) {
    return this.instance.asyncWidgetMethodContext((widget, callback) => {
      widget.chart(this.chartIndex).setSymbol(symbol, {
        dataReady: () => {
          callback();
        },
        doNotActivateChart: false,
      });
    });
  }
  handleResolutionChange(resolution: TvChartResolution, _prevResolution: string) {
    return this.instance.asyncWidgetMethodContext((widget, callback) => {
      const chartWidgetApi = widget.chart(this.chartIndex);
      chartWidgetApi.dataReady(() => {
        chartWidgetApi
          .setResolution(getTvChartLibraryResolution(resolution) as ResolutionString, {
            dataReady: callback,
            doNotActivateChart: true,
          })
          .catch(() => {});
      });
    });
  }
  setPrecision(precision: number | null) {
    this.widget?.applyOverrides({
      "mainSeriesProperties.minTick":
        null === precision ? "default" : `${Math.pow(10, precision)},1,false`,
    });
  }
  async dataReady() {
    await this.instance.onReady();
    if (!this.chartWidget) throw Error("TvChartWidget: chartWidget is null");
    return new Promise((resolve) => {
      this.chartWidget?.dataReady(() => {
        setTimeout(resolve);
      });
    });
  }
  latestBar() {
    return (
      (this.instance.getModule("datafeed") as TvChartDataFeed).getBarRange(
        this.chartAreaManager.tickerSymbol,
        this.chartAreaManager.resolution,
      )?.lastBar ?? null
    );
  }
  timeScaleWidth() {
    return this.chartWidget?.getTimeScale()?.width() ?? NaN;
  }
  rightOffset() {
    return this.chartWidget?.getTimeScale()?.rightOffset() ?? NaN;
  }
  setRightOffset(offset: number) {
    this.chartWidget?.getTimeScale()?.setRightOffset(offset);
  }
  barSpacing() {
    return this.chartWidget?.getTimeScale()?.barSpacing() ?? NaN;
  }
  setBarSpacing(spacing: number) {
    this.chartWidget?.getTimeScale()?.setBarSpacing(spacing);
  }
  // async goToTime(_time: number) {
  //   if (this.chartWidget) {
  //     await this.instance.getModule("temporaryShapeManager").clearAllShapes();
  //   }
  // }
  // async goToTimeRange(from: number, to: number) {
  //   await this.instance.getModule("temporaryShapeManager").clearAllShapes();
  //   await this.setVisibleRange({ from, to });
  // }
  coordinateToTime(_time: number): number | null | undefined {
    if (!this.chartWidget) return null;
  }
  rightOffsetChanged() {
    return this.instance.rightOffsetChanged().pipe(
      filter(([index]) => index === this.chartIndex),
      map(([_, offset]) => offset),
    );
  }
  barSpacingChanged() {
    return this.instance.barSpacingChanged().pipe(
      filter(([index]) => index === this.chartIndex),
      map(([_, barSpacing]) => barSpacing),
    );
  }
  crosshairMoved() {
    return this.instance.crosshairMoved();
  }
  // TODO 这里在干啥？
  resolveOrRejectWithDataError<T>(source: Observable<T>) {
    const datafeed = this.instance.getModule("datafeed") as TvChartDataFeed;
    const observable = datafeed
      .onMainSeriesError(this.chartAreaManager?.tickerSymbol, this.chartAreaManager?.resolution)
      .pipe(duplicate<T>(source));
    return Promise.race([
      source,
      observableToPromise(observable).then((e) => {
        throw e;
      }),
    ]);
  }
  // legacyCreatePriceLine(e) {
  //   return this.instance.getModule("priceLineManager").createLegacyPriceLine(this.chartIndex, e);
  // }
  async setVisibleRange() {}
  toggleLoading(_loading: boolean) {}
  legacySetPositions() {}
  legacySetOrderRecord(_on: boolean) {}
  legacySetTradeState(_on: boolean) {}
  legacySetOrderFilled() {}
  legacySetDepth(_depth: number) {}
  legacySetMarket(_market: string) {}
  legacyCreatePriceLines(_priceLines: any) {}
}
