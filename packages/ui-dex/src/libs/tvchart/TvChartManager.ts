/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  mergeAll,
  mergeWith,
  Observable,
  of,
  Subscription,
  switchMap,
} from "rxjs";
import { TvChartSettings } from "./TvChartSettings";
import { TvChartLibraryWidget } from "./TvChartLibraryWidget";
import { TvChartAreaManager } from "./TvChartAreaManager";
import { PositionLinesStore } from "./PositionLinesStore";
import { DEFAULT_TV_CHART_RESOLUTIONS, DEFAULT_TV_CHART_DISPLAY_OPTIONS } from "./constants";
import { KeyboardShortcutManager } from "./KeyboardShortcutManager";
import { OrderInputStore } from "./OrderInputStore";
import { OrderLinesStore } from "./OrderLinesStore";
import { PriceAlertStore } from "./PriceAlertStore";
import { ContextMenuStore } from "./ContextMenuStore";
import { HistoryTradesStore } from "./HistoryTradesStore";
import { getDefaultSettings } from "./settings";
import { Storage } from "@/libs/storage";
import { cloneDeep, isEqual, merge as mergeDeep } from "lodash-es";
import { getTvChartLibraryTheme, parseSymbol, stringifySymbolShort } from "./utils";
import {
  ITvChartDataFeedModule,
  ITvChartSymbolResolver,
  TvChartLayout,
  TvChartResolution,
  TvChartSymbolChange,
  TvChartVisibleRangeChange,
} from "./types";
import { VisibleTimeRange } from "../../../../../apps/web/public/static/charting_library";

export class TvChartManager {
  static defaultChartName = "DEFAULT";

  initialized: boolean;
  focused: boolean;
  settings: TvChartSettings;
  reloadId: number;
  subscriptions: Subscription[];
  internalWidget: TvChartLibraryWidget | null;
  internalWidgetReady$: BehaviorSubject<boolean>;
  destroyed$: BehaviorSubject<boolean>;
  state$: BehaviorSubject<any>;
  positionLinesStore: PositionLinesStore;
  orderInputStore: OrderInputStore;
  orderLinesStore: OrderLinesStore;
  priceAlertStore: PriceAlertStore;
  contextMenuStore: ContextMenuStore;
  historyTradesStore: HistoryTradesStore;
  keyboardShortcutManager: KeyboardShortcutManager;
  datafeed: ITvChartDataFeedModule | null;
  symbolResolver: ITvChartSymbolResolver | null;
  brokerTerminal: any | null;
  brokerHost: any | null;
  brokerTerminalDelegate: any | null;
  dialogManager: any | null;

  constructor(settings: TvChartSettings) {
    this.initialized = false;
    this.focused = false;
    this.settings = settings;
    this.reloadId = 0;
    this.subscriptions = [];
    this.internalWidget = null;
    this.internalWidgetReady$ = new BehaviorSubject(false);
    this.destroyed$ = new BehaviorSubject(false);
    this.positionLinesStore = new PositionLinesStore(this.settings, this);
    this.orderInputStore = new OrderInputStore(this.settings, this);
    this.orderLinesStore = new OrderLinesStore(this.settings, this, this.positionLinesStore);
    this.priceAlertStore = new PriceAlertStore(this);
    this.contextMenuStore = new ContextMenuStore();
    this.historyTradesStore = new HistoryTradesStore(this.settings, this);
    this.keyboardShortcutManager = new KeyboardShortcutManager(this.settings, this);
    this.datafeed = null;
    this.symbolResolver = null;
    this.brokerTerminal = null;
    this.brokerHost = null;
    this.brokerTerminalDelegate = null;
    this.dialogManager = null;

    const showTradesSettings = {
      ...DEFAULT_TV_CHART_DISPLAY_OPTIONS,
      ...(Storage.getObject("show_trades_map") || {}),
    };

    this.state$ = new BehaviorSubject({
      loading: true,
      fullscreen: false,
      areas: [],
      selectedIndex: 0,
      pinnedResolutions: DEFAULT_TV_CHART_RESOLUTIONS,
      trade: {
        orderLine: true,
        orderLineQuickAttachTpSl: true,
        orderLineValueDisplayType: 0,
        orderLinePosition: "left",
        orderLineHorzVisible: true,
        orderRecord: true,
        orderPanel: false,
        orderButton: true,
        orderLineQuickChange: true,
        positionLineQuickClose: false,
        positionLine: true,
        positionLineQuickTpSl: true,
        positionLinePosition: "right",
        positionLineHorzVisible: true,
        trade: true,
        quickTpSl: true,
        quickEdit: true,
        quickClose: false,
        valueDisplayType: 0,
        linePosition: "left",
        lineHorzVisible: true,
      },
      chartSetting: getDefaultSettings().chartSetting,
      drawing: {
        magnet: true,
        magnetMode: 0,
        stayInDrawingMode: false,
        hideShapes: false,
        lastUsedTools: {},
        favoriteDrawings: [],
        favoriteDrawingBarVisible: false,
        defaultStates: {},
        riskRewardAvailableChanged: {},
        riskRewardRiskSizeChanged: {},
        drawingShapeTemplate: {},
      },
      syncSetting: {
        symbol: false,
        interval: false,
        crosshair: true,
        time: false,
        dateRange: false,
      },
      timeAnchorSetting: {
        enabled: false,
        handleSymbolChange: false,
        type: 0,
        displayLine: false,
        values: {
          time: 0.5,
          timeRange1: null,
          timeRange2: null,
        },
      },
      orderPanelPosition: null,
      showDrawingToolbar: false,
      showPriceAlertLabel: true,
      showPositionLine: true,
      showActiveOrderLine: true,
      showOrderInputLine: true,
      showExecutionShape: true,
      showDevHistoryTrades: showTradesSettings.dev,
      showKolHistoryTrades: showTradesSettings,
    });
  }
  async init() {
    if (this.initialized || this.destroyed$.getValue()) {
      return;
    }

    // restore settings from storage
    const storedSettings = this.settings.saveLoadAdapter.getSettings();

    this.setState("selectedIndex", storedSettings?.selectedIndex ?? this.selectedIndex);

    if (storedSettings?.pinnedResolutions) {
      const pinnedResolutions = storedSettings.pinnedResolutions as TvChartResolution[];
      if (
        pinnedResolutions.length === DEFAULT_TV_CHART_RESOLUTIONS.length &&
        pinnedResolutions.every((resolution) => DEFAULT_TV_CHART_RESOLUTIONS.includes(resolution))
      ) {
        this.pinnedResolutions = DEFAULT_TV_CHART_RESOLUTIONS;
      } else {
        this.pinnedResolutions = pinnedResolutions;
      }
    }

    if (storedSettings?.areaContents) {
      this.setState(
        "areas",
        storedSettings.areaContents.map(
          (areaContent: any, index: number) =>
            new TvChartAreaManager(this.settings, this, index, areaContent),
        ),
      );
    }

    if (storedSettings?.drawing) {
      this.setState("drawing", storedSettings.drawing);
    }

    this.setState("chartSetting", mergeDeep(this.chartSetting, storedSettings?.chartSetting ?? {}));
    this.setState("trade", storedSettings?.trade);
    this.setState("timeAnchorSetting", storedSettings?.timeAnchorSetting);
    this.setState("syncSetting", storedSettings?.syncSetting);
    this.setState("orderPanelPosition", storedSettings?.orderPanelPosition);
    this.setState(
      "showDrawingToolbar",
      storedSettings?.showDrawingToolbar ?? this.showDrawingToolbar,
    );
    this.setState(
      "showPriceAlertLabel",
      storedSettings?.showPriceAlertLabel ?? this.showPriceAlertLabel,
    );
    this.settings.updateValue("layout", storedSettings?.layout);
    this.settings.updateValue("chartType", storedSettings?.chartType);
    if (!this.settings.enableMultiCharts) {
      this.settings.updateValue("layout", TvChartLayout.Layout1A);
    }
    if (this.settings.enableHideDrawingToolsByDefault) {
      this.setState("showDrawingToolbar", false);
    }

    this.updateChartContents();

    if (this.settings.tickerSymbol) {
      if (this.activeArea) {
        try {
          await this.activeArea.setSymbol(this.settings.tickerSymbol);
        } catch (e) {
          console.warn("TvChartManager init failed to set symbol", e);
        } finally {
          this.initialized = true;
        }
      }
    } else {
      this.initialized = true;
    }

    this.subscriptions.push(
      // automatically save settings to storage when it changes
      this.settingsData$.pipe(debounceTime(1e3)).subscribe({
        next: (data) => {
          this.settings.saveLoadAdapter.saveSettings(data).catch(console.error);
        },
        error: () => {},
      }),
    );
  }
  on(field: string) {
    return this.state$.pipe(
      map((state) => state[field]),
      distinctUntilChanged(),
    );
  }
  setState(field: string, value: any) {
    if (value !== null && value !== undefined) {
      this.state$.next({ ...this.state$.getValue(), [field]: value });
    }
  }
  get state() {
    return this.state$.getValue();
  }
  get chartCount() {
    return parseInt(this.settings.layout, 10);
  }
  get areas(): TvChartAreaManager[] {
    return this.state.areas;
  }
  areaByIndex(index: number) {
    if (this.initialized) {
      this.updateChartContents();
    }
    return this.areas[index] ?? null;
  }
  get activeArea() {
    return this.areaByIndex(this.selectedIndex);
  }
  get selectedIndex(): number {
    return this.state.selectedIndex;
  }
  set selectedIndex(idx: number) {
    this.setState("selectedIndex", idx);
  }
  get pinnedResolutions(): TvChartResolution[] {
    return this.state.pinnedResolutions;
  }
  set pinnedResolutions(pinnedResolutions: string[]) {
    this.setState("pinnedResolutions", pinnedResolutions);
  }
  get trade() {
    return this.state.trade;
  }
  set trade(trade: any) {
    this.setState("trade", trade);
  }
  get chartSetting() {
    return this.state.chartSetting;
  }
  get drawing() {
    return this.state.drawing;
  }
  set drawing(drawing: any) {
    this.setState("drawing", drawing);
  }
  get syncSetting() {
    return this.state.syncSetting;
  }
  get timeAnchorSetting() {
    return this.state.timeAnchorSetting;
  }
  get orderPanelPosition() {
    return this.state.orderPanelPosition;
  }
  get showDrawingToolbar() {
    return this.state.showDrawingToolbar;
  }
  get showPriceAlertLabel() {
    return this.state.showPriceAlertLabel;
  }
  get fullscreen(): boolean {
    return this.state.fullscreen;
  }
  set fullscreen(fullscreen: boolean) {
    this.setState("fullscreen", fullscreen);
    if (fullscreen) {
      document.body.classList.add("fullScreen");
    } else {
      document.body.classList.remove("fullScreen");
    }
  }
  get showPositionLine() {
    return this.state.showPositionLine;
  }
  get showActiveOrderLine() {
    return this.state.showActiveOrderLine;
  }
  get showOrderInputLine() {
    return this.state.showOrderInputLine;
  }
  get showExecutionShape() {
    return this.state.showExecutionShape;
  }
  get showDevHistoryTrades() {
    return this.state.showDevHistoryTrades;
  }
  get showKolHistoryTrades() {
    return this.state.showKolHistoryTrades;
  }
  get loading() {
    return this.state.loading;
  }
  setLoading(loading: boolean) {
    this.setState("loading", loading);
  }
  setLocale(locale: string) {
    this.settings.updateValue("locale", locale);
  }
  setFocused(focused: boolean) {
    this.focused = focused;
  }
  setTimezone(timezone: string) {
    this.settings.updateValue("timezone", timezone);
  }
  setOrderPanelPosition(position: any) {
    this.setState("orderPanelPosition", position);
  }
  setShowDrawingToolbar(show: boolean) {
    this.setState("showDrawingToolbar", show);
  }
  setShowPriceAlertLabel(show: boolean) {
    this.setState("showPriceAlertLabel", show);
  }
  setShowPositionLine(show: boolean) {
    this.setState("showPositionLine", show);
  }
  setShowActiveOrderLine(show: boolean) {
    this.setState("showActiveOrderLine", show);
  }
  setShowOrderInputLine(show: boolean) {
    this.setState("showOrderInputLine", show);
  }
  setShowExecutionShape(show: boolean) {
    this.setState("showExecutionShape", show);
  }
  setInternalWidget(widget: TvChartLibraryWidget | null) {
    this.internalWidget = widget;
    this.internalWidgetReady$.next(false);
  }
  onInternalWidgetReady() {
    this.internalWidgetReady$.next(true);
    this.areas.forEach((area, idx) => {
      if (idx < this.chartCount) {
        area.widgetReady();
      }
    });
  }
  setChartType(chartType: string) {
    this.areas.forEach((area, idx) => {
      if (idx < this.chartCount) {
        area.chartTypeWillChange();
      }
    });
    this.settings.updateValue("chartType", chartType);
  }
  setTheme(theme: string) {
    if (this.settings.theme !== theme) {
      this.settings.updateValue("theme", theme);
      this.internalWidget?.onThemeChange?.(
        getTvChartLibraryTheme(theme),
        this.settings.reverseColor,
      );
      this.positionLinesStore.reset();
    }
  }
  setReverseColor(reverseColor: boolean) {
    if (this.settings.reverseColor !== reverseColor) {
      this.settings.updateValue("reverseColor", reverseColor);
      this.internalWidget?.onThemeChange?.(
        getTvChartLibraryTheme(this.settings.theme),
        reverseColor,
      );
      this.positionLinesStore.reset();
    }
  }
  setShowHistoryTrades(e: any) {
    this.state$.next({
      ...this.state$.getValue(),
      showDevHistoryTrades: e.dev,
      showKolHistoryTrades: e,
    });
  }
  setLayout(layout: TvChartLayout) {
    const targetLayout = this.settings.enableMultiCharts ? layout : TvChartLayout.Layout1A;
    if (this.settings.layout !== targetLayout) {
      this.settings.updateValue("layout", targetLayout);
      this.updateChartContents();
      this.internalWidget?.onLayoutChange?.(targetLayout);

      const prevChartCount = this.chartCount;
      setTimeout(() => {
        if (this.internalWidgetReady$.getValue()) {
          for (let i = prevChartCount; i < this.chartCount; i++) {
            this.areaByIndex(i)?.widgetReady();
          }
        }
      });
    }
  }
  reloadChart() {
    this.reloadId += 1;
  }
  updateChartContents() {
    if (this.chartCount > this.areas.length) {
      // If the number of charts is less than the number of layout slots, create new chart instances to fill the slots
      for (let i = this.areas.length; i < this.chartCount; i++) {
        // new chart inherits the settings of the selected chart
        const currentArea = this.areas[this.selectedIndex];
        const currentAreaSettings = currentArea?.toJSON();
        const newArea = new TvChartAreaManager(this.settings, this, i, currentAreaSettings);
        this.setState("areas", [...this.areas, newArea]);
        // current area does not exist, set the symbol
        if (this.selectedIndex !== i && !currentArea) {
          newArea.setSymbol(this.settings.tickerSymbol).catch(() => {});
        }
      }
    }
    if (this.selectedIndex >= this.chartCount) {
      // Layout change caused fewer slots, need to avoid overflow
      this.setState("selectedIndex", this.chartCount - 1);
    }
  }
  destroy() {
    try {
      this.brokerTerminalDelegate?.destroy();
      this.subscriptions.splice(0).forEach((sub) => sub.unsubscribe());
      this.areas.forEach((area) => area.destroy());
      this.positionLinesStore.destroy();
      this.orderLinesStore.destroy();
      this.historyTradesStore.destroy();
    } catch (e) {
      console.error("ChartManager destroy error", e);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
  getState$() {
    return this.state$.asObservable();
  }
  get settingsData$() {
    return combineLatest([
      this.settings.getState$(),
      this.state$.pipe(
        switchMap((state) => {
          const areas = state.areas as TvChartAreaManager[];
          return areas.length
            ? combineLatest(areas.map((area) => area.getState$())).pipe(
                map((areaStates) => ({
                  ...state,
                  areaContents: areaStates.map((areaState) => ({ ...areaState })),
                })),
              )
            : of({ ...state, areaContents: [] });
        }),
      ),
    ]).pipe(
      map(([settingsState, state]) => {
        return {
          layout: settingsState.layout,
          chartType: settingsState.chartType,
          selectedIndex: state.selectedIndex,
          pinnedResolutions: state.pinnedResolutions,
          trade: state.trade,
          chartSetting: state.chartSetting,
          drawing: state.drawing,
          orderPanelPosition: state.orderPanelPosition,
          showDrawingToolbar: state.showDrawingToolbar,
          showPriceAlertLabel: state.showPriceAlertLabel,
          syncSetting: state.syncSetting,
          timeAnchorSetting: state.timeAnchorSetting,
          areaContents: state.areaContents,
        };
      }),
      distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
    );
  }
  get settingsData() {
    return {
      layout: this.settings.layout,
      chartType: this.settings.chartType,
      selectedIndex: this.selectedIndex,
      pinnedResolutions: this.pinnedResolutions,
      trade: cloneDeep(this.trade),
      chartSetting: cloneDeep(this.chartSetting),
      drawing: this.drawing ? cloneDeep(this.drawing) : undefined,
      orderPanelPosition: cloneDeep(this.orderPanelPosition),
      showDrawingToolbar: this.showDrawingToolbar,
      showPriceAlertLabel: this.showPriceAlertLabel,
      syncSetting: cloneDeep(this.syncSetting),
      timeAnchorSetting: cloneDeep(this.timeAnchorSetting),
      areaContents: this.areas.map((area) => area.toJSON()),
    };
  }
  getAllCharts() {
    this.updateChartContents();
    return this.areas.slice(0, this.chartCount);
  }
  get activeArea$() {
    return combineLatest([this.on("areas"), this.on("selectedIndex")]).pipe(
      map(([areas, selectedIndex]) => {
        return areas[selectedIndex];
      }),
      distinctUntilChanged(),
    );
  }
  get activeAreaTickerSymbol$() {
    return this.activeArea$.pipe(
      switchMap((area) => area.on("tickerSymbol")),
      distinctUntilChanged(),
    );
  }
  getSymbolListObservable() {
    return this.on("areas").pipe(
      switchMap((areas: TvChartAreaManager[]) =>
        combineLatest(areas.map((area) => area.getState$())),
      ),
      map((areaStates) =>
        areaStates.reduce((set: Set<string>, areaState: any) => {
          if (areaState.dataReady) {
            const parsedSymbol = parseSymbol(areaState.tickerSymbol);
            set.add(stringifySymbolShort(parsedSymbol));
          }
          return set;
        }, new Set<string>()),
      ),
      distinctUntilChanged(
        (prev, curr) =>
          prev.size === curr.size && Array.from(prev.values()).every((val) => curr.has(val)),
      ),
      map((set) => Array.from(set.values()).map((val) => val)),
    );
  }
  getChangedSymbolList() {
    let currentSymbols: string[] = [];
    return this.getSymbolListObservable().pipe(
      map((symbols) => {
        const add = symbols.filter((s) => !currentSymbols.includes(s));
        const remove = currentSymbols.filter((s) => !symbols.includes(s));
        currentSymbols = symbols;
        return { add, remove };
      }),
    );
  }
  getActiveSymbolObservable() {
    return this.internalWidgetReady$.pipe(
      filter(Boolean),
      switchMap(() => this.settings.on("layout")),
      switchMap(() =>
        this.on("selectedIndex").pipe(
          switchMap((selectedIndex: number) => {
            const area = this.areaByIndex(selectedIndex);
            return area ? area.on("dataReady") : of(false);
          }),
        ),
      ),
      switchMap(() => {
        const activeChart = this.internalWidget!.widget!.activeChart();
        // as initial values
        const symbol = activeChart.symbol();
        const { chain, address } = parseSymbol(symbol);

        return new Observable<TvChartSymbolChange>((observer) => {
          const handleSymbolChanged = () => {
            const symbol = activeChart.symbol();
            const { chain, address } = parseSymbol(symbol);
            // emit new values
            observer.next({
              tickerSymbol: stringifySymbolShort({ chain, address }),
              libTickerSymbol: symbol,
            });
          };
          // https://www.tradingview.com/charting-library-docs/latest/api/interfaces/Charting_Library.IChartWidgetApi/#onsymbolchanged
          activeChart.onSymbolChanged().subscribe(null, handleSymbolChanged);
          return () => {
            activeChart.onSymbolChanged().unsubscribe(null, handleSymbolChanged);
          };
        }).pipe(
          // merge initial value
          mergeWith(
            of<TvChartSymbolChange>({
              tickerSymbol: stringifySymbolShort({ chain, address }),
              libTickerSymbol: symbol,
            }),
          ),
        );
      }),
    );
  }
  getSymbolForChartObservable() {
    return this.internalWidgetReady$.pipe(
      filter(Boolean),
      switchMap(() => this.settings.on("layout")),
      switchMap(() =>
        this.on("areas").pipe(
          switchMap((areas: TvChartAreaManager[]) =>
            combineLatest(
              areas.map((area) => area.getState$().pipe(map((areaState) => areaState.dataReady))),
            ),
          ),
        ),
      ),
      distinctUntilChanged(
        (prev, curr) => prev.length === curr.length && prev.every((v, idx) => v === curr[idx]),
      ),
      switchMap(() => {
        const chartCount = this.chartCount;
        const observables: Observable<TvChartSymbolChange>[] = [];

        for (let i = 0; i < chartCount; i++) {
          const chart = this.internalWidget?.widget?.chart(i);
          if (!chart) continue;
          try {
            // https://www.tradingview.com/charting-library-docs/latest/api/interfaces/Charting_Library.IChartWidgetApi/#dataready
            chart.dataReady(() => {
              // as initial values
              const symbol = chart.symbol();
              const { chain, address } = parseSymbol(symbol);

              observables.push(
                new Observable<TvChartSymbolChange>((observer) => {
                  const handleSymbolChanged = () => {
                    const symbol = chart.symbol();
                    const { chain, address } = parseSymbol(symbol);

                    // emit new values
                    observer.next({
                      index: i,
                      tickerSymbol: stringifySymbolShort({ chain, address }),
                      libTickerSymbol: symbol,
                    });
                  };
                  // https://www.tradingview.com/charting-library-docs/latest/api/interfaces/Charting_Library.IChartWidgetApi/#onsymbolchanged
                  chart.onSymbolChanged().subscribe(null, handleSymbolChanged);
                  return () => {
                    chart.onSymbolChanged().unsubscribe(null, handleSymbolChanged);
                  };
                }).pipe(
                  // merge initial value
                  mergeWith(
                    of({
                      index: i,
                      tickerSymbol: stringifySymbolShort({ chain, address }),
                      libTickerSymbol: symbol,
                    }),
                  ),
                  distinctUntilChanged(isEqual),
                ),
              );
            });
          } catch (e) {
            console.error(e);
          }
        }
        return observables;
      }),
      mergeAll(),
    );
  }
  getVisibleRangeObservable() {
    return this.getSymbolListObservable().pipe(
      switchMap(() => {
        const chartCount = this.chartCount;
        const observables: Observable<TvChartVisibleRangeChange>[] = [];
        for (let i = 0; i < chartCount; i++) {
          const chart = this.internalWidget?.widget?.chart(i);
          if (!chart) continue;

          // as initial values
          const symbol = chart.symbol();
          const { chain, address } = parseSymbol(symbol);

          observables.push(
            new Observable<TvChartVisibleRangeChange>((observer) => {
              const handleVisibleRangeChanged = (range: VisibleTimeRange) => {
                const symbol = chart.symbol();
                const { chain, address } = parseSymbol(symbol);

                // emit new values
                observer.next({
                  index: i,
                  tickerSymbol: stringifySymbolShort({ chain, address }),
                  libTickerSymbol: symbol,
                  range,
                });
              };
              // https://www.tradingview.com/charting-library-docs/latest/api/interfaces/Charting_Library.IChartWidgetApi/#onvisiblerangechanged
              chart.onVisibleRangeChanged().subscribe(null, handleVisibleRangeChanged);
              return () => {
                chart.onVisibleRangeChanged().unsubscribe(null, handleVisibleRangeChanged);
              };
            }).pipe(
              // merge initial value
              mergeWith(
                of<TvChartVisibleRangeChange>({
                  index: i,
                  tickerSymbol: stringifySymbolShort({ chain, address }),
                  libTickerSymbol: symbol,
                  range: chart.getVisibleRange(),
                }),
              ),
            ),
          );
        }
        return observables;
      }),
      mergeAll(),
    );
  }
}
