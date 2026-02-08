/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BehaviorSubject,
  combineLatestWith,
  distinctUntilChanged,
  map,
  Subject,
  Subscription,
} from "rxjs";
import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";
import { SeriesType } from "../../../../../apps/web/public/static/charting_library";
import { TvChartKlineStyle, TvChartResolution } from "./types";
import { getTvChartLibraryResolution } from "./utils";

export class TvChartAreaManager {
  settings: TvChartSettings;
  chartManager: TvChartManager;
  chartIndex: number;
  areaContent: any;

  timeAnchorPointInvalidated: boolean;
  timeAnchorPoints: Map<string, number>;
  pendingTickerSymbol: string | null;
  pendingResolution: string | null;
  subs: Subscription[];
  destroyed$: Subject<any>;
  state$: BehaviorSubject<any>;

  constructor(
    settings: TvChartSettings,
    manager: TvChartManager,
    index: number,
    areaSettings?: any,
  ) {
    this.settings = settings;
    this.chartManager = manager;
    this.chartIndex = index;

    this.timeAnchorPointInvalidated = true;
    this.timeAnchorPoints = new Map<string, number>();
    this.pendingTickerSymbol = null;
    this.pendingResolution = null;
    this.subs = [];

    this.destroyed$ = new Subject<any>();

    const defaultAreaSettings = {
      resolution: getTvChartLibraryResolution("1m"),
      chartStyle: TvChartKlineStyle.Candles,
      symbol: "",
      tickerSymbol: "",
      rightOffset: 10,
      barSpacing: 6,
      dataReady: false,
      crosshair: undefined,
    };

    this.areaContent = areaSettings || {
      resolution: defaultAreaSettings.resolution,
      chartStyle: defaultAreaSettings.chartStyle,
      symbol: defaultAreaSettings.symbol,
      tickerSymbol: defaultAreaSettings.tickerSymbol,
      rightOffset: defaultAreaSettings.rightOffset,
      barSpacing: defaultAreaSettings.barSpacing,
    };
    if (areaSettings) {
      defaultAreaSettings.resolution = areaSettings.resolution || defaultAreaSettings.resolution;
      defaultAreaSettings.chartStyle = areaSettings.chartStyle || defaultAreaSettings.chartStyle;
      defaultAreaSettings.symbol = areaSettings.symbol || defaultAreaSettings.symbol;
      defaultAreaSettings.tickerSymbol =
        areaSettings.tickerSymbol || defaultAreaSettings.tickerSymbol;
      defaultAreaSettings.rightOffset = areaSettings.rightOffset || defaultAreaSettings.rightOffset;
      defaultAreaSettings.barSpacing = areaSettings.barSpacing || defaultAreaSettings.barSpacing;
    }

    this.state$ = new BehaviorSubject(defaultAreaSettings);
  }
  on(field: string) {
    return this.state$.pipe(
      map((state: any) => state[field]),
      distinctUntilChanged(),
    );
  }
  get internalChartWidget() {
    return this.chartManager.internalWidget?.chartByIndex(this.chartIndex);
  }
  get state() {
    return this.state$.value;
  }
  getState$() {
    return this.state$.asObservable();
  }
  setState(key: string, value: any) {
    if (value !== undefined && value !== null) {
      this.state$.next({ ...this.state$.getValue(), [key]: value });
    }
  }
  setChartStyle(chartStyle: SeriesType) {
    this.setState("chartStyle", chartStyle);
    this.internalChartWidget?.setChartStyle(chartStyle);
  }
  get tickerSymbol(): string {
    return this.state.tickerSymbol;
  }
  get symbol(): string {
    return this.state.symbol;
  }
  get resolution(): TvChartResolution {
    return this.state.resolution;
  }
  get chartStyle(): SeriesType {
    return this.state.chartStyle;
  }
  get rightOffset(): number {
    return this.state.rightOffset;
  }
  get barSpacing(): number {
    return this.state.barSpacing;
  }
  get firstBarTime(): number {
    return this.state.firstBarTime;
  }
  get dataReady(): boolean {
    return this.state.dataReady;
  }
  async setSymbol(symbol: string) {
    if (this.state.tickerSymbol === symbol) return;
    const prevSymbol = this.tickerSymbol;
    this.setState("tickerSymbol", symbol);
    this.symbolWillChange();
    this.pendingTickerSymbol = symbol;
    try {
      const promises = [
        this.internalChartWidget?.handleSymbolChange(symbol, prevSymbol),
        this.chartManager.symbolResolver?.resolveSymbolInfo(symbol).then((symbolInfo: any) => {
          if (symbolInfo) {
            this.setState("symbol", symbolInfo.name);
          }
        }),
      ];
      for (const p of await Promise.allSettled(promises)) {
        if ("rejected" === p.status) {
          throw p.reason;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (this.pendingTickerSymbol === symbol) {
        this.pendingTickerSymbol = null;
      }
    }
    if (this.tickerSymbol === symbol) {
      this.symbolChanged();
    }
  }
  async setResolution(resolution: TvChartResolution) {
    if (this.resolution === resolution) return;
    const prevResolution = this.resolution;
    this.setState("resolution", resolution);
    this.resolutionWillChange();
    this.pendingResolution = resolution;
    try {
      await this.internalChartWidget?.handleResolutionChange(resolution, prevResolution);
    } finally {
      if (this.pendingResolution === resolution) {
        this.pendingResolution = null;
      }
    }
    if (this.resolution === resolution) {
      this.intervalChanged();
    }
  }
  toJSON() {
    return this.state$.getValue();
  }
  widgetReady() {
    this.internalChartWidget
      ?.dataReady()
      ?.then(() => this.handleChartReady())
      ?.catch(() => {});
  }
  destroy() {
    this.destroyed$.next(undefined);
    this.destroyed$.complete();
    this.state$.complete();
    this.subs.forEach((sub) => sub.unsubscribe());
  }
  chartWillHide() {
    this.setState("dataReady", false);
  }
  chartTypeWillChange() {
    try {
      this.updateTimeAnchorPoints();
    } catch (e) {
      console.warn(`TvChartAreaManager.chartTypeWillChange`, e);
    }
  }
  async handleChartReady() {
    if (!this.internalChartWidget) return;
    this.setState("dataReady", true);

    if (this.selected || !this.chartManager.syncSetting.dateRange) {
      this.internalChartWidget?.setBarSpacing(this.barSpacing);
    }

    this.initLocalState();
    this.applyTimeAnchor("init").catch(() => {});

    this.subs.push(
      this.internalChartWidget
        .rightOffsetChanged()
        .pipe(combineLatestWith(this.settings.subscribeValueChange<string>("chartType")))
        .subscribe({
          next: ([offset]) => {
            this.timeAnchorPointInvalidated = true;
            this.setState("rightOffset", offset);
          },
          error: (e) => {
            console.error(e);
          },
        }),
    );

    this.subs.push(
      this.internalChartWidget
        .barSpacingChanged()
        .pipe(combineLatestWith(this.settings.subscribeValueChange<string>("chartType")))
        .subscribe({
          next: ([barSpacing]) => {
            this.timeAnchorPointInvalidated = true;
            this.setState("barSpacing", barSpacing);
          },
          error: () => {},
        }),
    );
  }
  get active() {
    return this.chartIndex < this.chartManager.chartCount;
  }
  get selected() {
    return this.chartManager.selectedIndex === this.chartIndex;
  }
  get symbolInfo() {
    return this.chartManager.symbolResolver?.getSymbolInfo(this.tickerSymbol);
  }
  get tradeUnit() {
    return null;
  }
  symbolWillChange() {
    this.setState("dataReady", false);
    try {
      this.resetLocalState();
      this.updateTimeAnchorPoints();
      this.syncSymbol().catch(() => {});
    } catch (e) {
      console.warn(`TvChartAreaManager.symbolWillChange`, e);
    }
  }
  symbolChanged() {
    this.setState("dataReady", true);
    try {
      this.initLocalState();
      this.applyTimeAnchor("symbol").catch(() => {});
    } catch (e) {
      console.warn(`TvChartAreaManager.symbolChanged`, e);
    }
  }
  resolutionWillChange() {
    this.setState("dataReady", false);
    try {
      this.resetLocalState();
      this.updateTimeAnchorPoints();
      this.syncInterval().catch(() => {});
    } catch (e) {
      console.warn(`TvChartAreaManager.resolutionWillChange`, e);
    }
  }
  intervalChanged() {
    this.setState("dataReady", false);
    try {
      this.initLocalState();
      this.applyTimeAnchor("resolution").catch(() => {});
    } catch (e) {
      console.warn(`TvChartAreaManager.intervalChanged`, e);
    }
  }
  resetLocalState() {
    this.setState("firstBarTime", undefined);
    this.setState("crosshair", undefined);
  }
  initLocalState() {
    if (this.symbolInfo && !this.firstBarTime) {
      this.chartManager.datafeed
        ?.getFirstBarTime?.(this.symbolInfo, this.resolution, { timezone: this.settings.timezone })
        ?.then(() => {})
        ?.catch(() => {});
    }

    this.internalChartWidget?.crosshairMoved().subscribe({
      next: (value) => {
        this.setState("crosshair", value);
      },
      error: () => {},
    });
  }
  updateTimeAnchorPoints() {
    const timeAnchorSettings = this.chartManager.timeAnchorSetting;
    const timeAnchorPoints = this.timeAnchorPoints;
    const timeScaleWidth = this.internalChartWidget?.timeScaleWidth() ?? null;

    Object.entries<number>(timeAnchorSettings.values).forEach(([key, value]) => {
      if (
        this.timeAnchorPointInvalidated &&
        this.selected &&
        null != timeScaleWidth &&
        null != value
      ) {
        const point = this.internalChartWidget?.coordinateToTime(
          Math.min(timeScaleWidth - 0.5, Math.max(0.5, Math.round(value * timeScaleWidth))),
        );
        if (point != null) {
          timeAnchorPoints.set(key, point);
        }
      }
    });
  }
  async applyTimeAnchor(type: "init" | "symbol" | "resolution") {
    const anchorSettings = this.chartManager.timeAnchorSetting;

    this.timeAnchorPointInvalidated = true;
    this.timeAnchorPoints.clear();

    if (!this.internalChartWidget) return;
    if (!this.selected) return;
    if (type === "init" && !anchorSettings.enabled && !anchorSettings.handleSymbolChange) return;
    if (type === "resolution" && !anchorSettings.enabled) return;
    if (type === "symbol" && !anchorSettings.handleSymbolChange) return;

    try {
      await this.internalChartWidget.dataReady();
    } catch (e) {
      console.error("TvChartAreaManager.applyTimeAnchor", e);
      return;
    }
  }
  async syncSymbol() {
    if (!this.selected || !this.chartManager.syncSetting?.symbol) return;
    const tickerSymbol = this.tickerSymbol;
    const promises = Array(this.chartManager.chartCount)
      .fill(null)
      .map((_, index) => {
        const chartArea = this.chartManager.areaByIndex(index);
        if (
          chartArea &&
          chartArea.chartIndex !== this.chartIndex &&
          chartArea.active &&
          chartArea.tickerSymbol !== tickerSymbol
        ) {
          return chartArea.setSymbol(tickerSymbol);
        } else {
          return Promise.resolve();
        }
      });
    await Promise.all(promises);
  }
  async syncInterval() {
    if (!this.selected || !this.chartManager.syncSetting?.interval) return;
    const resolution = this.resolution;
    const promises = Array(this.chartManager.chartCount)
      .fill(null)
      .map((_, index) => {
        const chartArea = this.chartManager.areaByIndex(index);
        if (
          chartArea &&
          chartArea.chartIndex !== this.chartIndex &&
          chartArea.active &&
          chartArea.resolution !== resolution
        ) {
          return chartArea.setResolution(resolution);
        } else {
          return Promise.resolve();
        }
      });
    await Promise.all(promises);
  }
}
