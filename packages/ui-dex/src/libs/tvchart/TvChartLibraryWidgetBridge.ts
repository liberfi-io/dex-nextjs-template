/* eslint-disable @typescript-eslint/no-explicit-any */
import { filter, map, Observable, Subject } from "rxjs";
import {
  ChartingLibraryFeatureset,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  IndividualPosition,
  Order,
  OrderTemplate,
  Position,
  ResolutionString,
  SingleBrokerMetaInfo,
  Timezone,
  TradingTerminalWidgetOptions,
  widget as Widget,
  LayoutType,
  IStudyApi,
  StudyInputValueItem,
  ITimeScaleApi,
  VisibleTimeRange,
  CrossHairMovedEventParams,
  IChartWidgetApi,
  LibrarySymbolInfo,
  TimezoneId,
  ContextMenuItem,
  ColorTypes,
} from "../../../../../apps/web/public/static/charting_library";
import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";
import {
  TV_CHART_INTERESTED_DOM_EVENTS,
  TV_CHART_LIGHT_THEME_COLORS,
  TV_CHART_THEME_COLORS,
} from "./constants";
import { checkKeyboardShortcut, createEventObservable, getCssPropertyValue } from "@/libs";
import { TvChartDataFeed } from "./TvChartDataFeed";
import { TvChartSaveLoadAdapter } from "./TvChartSaveLoadAdapter";
import { TvChartSettingsAdapter } from "./TvChartSettingsAdapter";
import {
  getTvChartLayoutReverse,
  getTvChartLibraryAlignment,
  getTvChartLibraryLayout,
  getTvChartLibraryResolution,
  getTvChartLibraryTheme,
  getTvChartResolutionReverse,
  parseSymbol,
} from "./utils";
import { TvChartErrorResetType } from "./types";

type ModuleConstructor = new (
  settings: TvChartSettings,
  chartManager: TvChartManager,
  bridge: TvChartLibraryWidgetBridge,
) => any;

const MODULES_MAP: Record<string, ModuleConstructor> = {
  datafeed: TvChartDataFeed,
  saveLoadAdapter: TvChartSaveLoadAdapter,
  settingsAdapter: TvChartSettingsAdapter,
  //   positionLinesManager,
  //   orderLinesManager,
  //   orderInputLinesManager,
  //   makerBuyAvgPriceLineManager,
};

/**
 * https://www.tradingview.com/charting-library-docs/latest/api/interfaces/Charting_Library.IChartingLibraryWidget/
 */
export class TvChartLibraryWidgetBridge {
  settings: TvChartSettings;
  chartManager: TvChartManager;

  moduleInstances: Map<string, any>;
  // chart index => unsubscribe
  symbolIntervalSubscriptions: Map<string, () => void>;
  brokerTerminal: any | null;
  abortController: AbortController;

  widgetReadyPromise: Promise<void> | null;
  readyPromise: Promise<void> | null;

  widget: IChartingLibraryWidget | null;
  container: HTMLDivElement | null;

  ready: boolean;
  layoutReady: boolean;

  domEventTriggered$: Subject<[number, string, Event]>;
  symbolChanged$: Subject<[number, string]>;
  resolutionChanged$: Subject<any>;
  rightOffsetChanged$: Subject<[number, number]>;
  barSpacingChanged$: Subject<[number, number]>;
  visibleRangeChanged$: Subject<[number, VisibleTimeRange]>;
  crosshairMoved$: Subject<[number, CrossHairMovedEventParams]>;
  changed$: Subject<any>;

  errorRequests: Set<any>;
  errorNotificationShown: boolean;
  errorNotificationCloser: (() => void) | null;
  errorResetType: TvChartErrorResetType;

  initRightOffset: number | null;
  rightOffsetChangedTimer: number | null;
  initBarSpacing: number | null;
  barSpacingChangedTimer: number | null;

  constructor(settings: TvChartSettings, chartManager: TvChartManager) {
    this.settings = settings;
    this.chartManager = chartManager;

    this.moduleInstances = new Map<string, any>();
    this.symbolIntervalSubscriptions = new Map<string, () => void>();
    this.brokerTerminal = null;
    this.abortController = new AbortController();

    this.widgetReadyPromise = null;
    this.readyPromise = null;

    this.widget = null;
    this.container = null;

    this.ready = false;
    this.layoutReady = true;

    this.domEventTriggered$ = new Subject<[number, string, Event]>();
    this.symbolChanged$ = new Subject<[number, string]>();
    this.resolutionChanged$ = new Subject<any>();
    this.rightOffsetChanged$ = new Subject<[number, number]>();
    this.barSpacingChanged$ = new Subject<[number, number]>();
    this.visibleRangeChanged$ = new Subject<[number, VisibleTimeRange]>();
    this.crosshairMoved$ = new Subject<[number, CrossHairMovedEventParams]>();
    this.changed$ = new Subject<any>();

    this.errorRequests = new Set();
    this.errorNotificationShown = false;
    this.errorNotificationCloser = null;
    this.errorResetType = TvChartErrorResetType.None;

    this.initRightOffset = null;
    this.rightOffsetChangedTimer = null;
    this.initBarSpacing = null;
    this.barSpacingChangedTimer = null;

    // TODO toast?
    // this.notificationManager = new NotificationManager();

    this.initModules();
  }
  getWidget() {
    return this.widget;
  }
  get destroyed() {
    return createEventObservable<AbortSignal>(this.abortController.signal, "abort");
  }
  resetData(tickerSymbol?: string, resolution?: string, priceType?: string) {
    this.getChartWidgets(tickerSymbol, resolution, priceType).forEach(([_, chartWidgetApi]) => {
      chartWidgetApi.resetData();
    });
  }
  async waitForLayout(layout?: LayoutType) {
    if (!this.widget || (this.layoutReady && !layout)) return;

    let handler: () => void;

    const p = new Promise<void>((resolve) => {
      handler = resolve;
      this.widget!.subscribe("layout_changed", resolve);
      if (layout) {
        this.widget!.setLayout(layout);
      }
    }).finally(() => {
      this.widget!.unsubscribe("layout_changed", handler);
    });

    return p;
  }
  async init(container: HTMLDivElement) {
    if (this.widgetReadyPromise) {
      throw new Error("TvChartLibraryWidgetBridge already initialized.");
    }
    // TODO gtag report { name: "TVInitStart", key: g.e1.KLineFirstRender }

    // create TradingView Widget instance
    const options = this.getWidgetOptions();
    this.container = container;
    this.widget = new Widget({ ...options, container: container });

    // wait for widget ready
    const widgetReadyPromise = new Promise<void>((resolve) => {
      this.widget?.onChartReady(() => {
        // TODO gtag report { name: "TVonChartReady", key: g.e1.KLineFirstRender }
        resolve();
      });
    });

    this.widgetReadyPromise = widgetReadyPromise;

    this.readyPromise = widgetReadyPromise.then(() => {
      this.ready = true;
      this.handleChartReady();
    });

    // init modules
    this.moduleInstances.forEach((module, name) => {
      try {
        if (module.init) {
          module.init.call(module);
        }
      } catch (e) {
        console.warn(`TvChartLibraryWidgetBridge init module ${name}`, e);
      }
    });

    // error handling
    this.installDataErrorHandler();

    // wait until ready or timeout
    await Promise.race([
      this.readyPromise,
      new Promise((_, reject) =>
        setTimeout(reject, 6e4, new Error("TvChartLibraryWidgetBridge init timeout")),
      ),
    ]);
  }
  getWidgetOptions(): ChartingLibraryWidgetOptions | TradingTerminalWidgetOptions {
    const disabledFeatures = [
      "header_widget",
      "legend_inplace_edit",
      "display_market_status",
      "save_shortcut",
      "show_interval_dialog_on_key_press",
      "symbol_info",
      "symbol_search_hot_key",
      "trading_account_manager",
      "order_panel",
      "uppercase_instrument_names",
      "show_symbol_logo_in_legend",
      "show_symbol_logo_for_compare_studies",
      "chart_property_page_trading",
      "buy_sell_buttons",
      "trading_notifications",
      "drawing_templates",
    ];
    const enabledFeatures = [
      "determine_first_data_request_size_using_visible_range",
      "request_only_visible_range_on_reset",
      "show_exchange_logos",
      "show_symbol_logos",
      "dont_show_boolean_study_arguments",
      "hide_last_na_study_output",
      "hide_right_toolbar",
      "seconds_resolution",
      "saveload_separate_drawings_storage",
      "volume_force_overlay",
      "create_volume_indicator_by_default",
      "two_character_bar_marks_labels",
    ];
    if (this.settings.enableHideDrawingToolsByDefault) {
      enabledFeatures.push("hide_left_toolbar_by_default");
    }
    if (!this.settings.enableTimeframesToolbar) {
      disabledFeatures.push("timeframes_toolbar");
    }
    if (!this.settings.enableCreateVolumeIndicatorByDefault) {
      disabledFeatures.push("create_volume_indicator_by_default");
    }
    if (!this.settings.enableVolumeForceOverlay) {
      disabledFeatures.push("volume_force_overlay");
    }
    return {
      container: "",
      autosize: true,
      debug: false,
      load_last_chart: true,
      auto_save_delay: 1,
      timezone: this.localTimezone as Timezone,
      library_path: this.libraryPath,
      custom_css_url: this.customCssUrl,
      theme: getTvChartLibraryTheme(this.settings.theme),
      custom_font_family: window.getComputedStyle(document.body).fontFamily,
      symbol: this.chartManager.activeArea?.tickerSymbol,
      interval: getTvChartLibraryResolution(
        this.chartManager.activeArea?.resolution,
      ) as ResolutionString,
      locale: this.settings.locale,
      datafeed: this.getModule("datafeed"),
      save_load_adapter: this.getModule("saveLoadAdapter"),
      settings_adapter: this.getModule("settingsAdapter"),
      custom_formatters: {
        priceFormatterFactory: this.getPriceFormatterFactory(),
      },
      overrides: this.getInitOverrides(),
      studies_overrides: this.getInitStudiesOverrides(),
      disabled_features: disabledFeatures as ChartingLibraryFeatureset[],
      enabled_features: enabledFeatures as ChartingLibraryFeatureset[],
      broker_config: this.getBrokerConfig(),
      // TODO gmgn's trading view has 'extraProperty', but we don't have it.
      //   extra_property: {
      //     hiddenTrendOrderToolBar: true,
      //     customRenderWeight: customRenderWeight(this.chartManager),
      //   },
    };
  }
  getIframeElement() {
    return this.container?.lastElementChild as HTMLIFrameElement | null | undefined;
  }
  getContentDocument() {
    return this.getIframeElement()?.contentWindow?.document;
  }
  domEventTriggered(eventName: string): Observable<[number, Event]> {
    return this.domEventTriggered$.pipe(
      filter(([_i, e, _e]) => e === eventName),
      map(([index, _, evt]) => [index, evt]),
    );
  }
  onAutoSaveNeeded() {
    try {
      this.widget?.saveChartToServer(undefined, undefined, { defaultChartName: "DEFAULT" });
    } catch (e) {
      console.warn("TvChartLibraryWidgetBridge.onAutoSaveNeeded", e);
    }
  }
  activeChartChanged(index: number) {
    this.chartManager.selectedIndex = index;
    this.chartManager.settings.saveLoadAdapter.saveSettings(this.chartManager.settingsData);
  }
  layoutWillChange(layout: LayoutType) {
    this.layoutReady = false;
    this.chartManager.setLayout(getTvChartLayoutReverse(layout));
  }
  layoutChanged() {
    this.layoutReady = true;
    this.syncChartsChanges();
    this.subscribeChartsChanges();
    this.widget?.unloadUnusedCharts();
    this.widget?.saveChartToServer();
  }
  onContextMenu(_timestamp: number, price: number) {
    const menus: ContextMenuItem[] = [];
    if (
      this.settings.enablePriceAlert &&
      this.chartManager.showPriceAlertLabel &&
      price > 0 &&
      price < Number.MAX_SAFE_INTEGER
    ) {
      const formattedPrice = this.widget?.activeChart()?.priceFormatter()?.format(price) ?? "";
      const quote = parseSymbol(this.chartManager.activeArea?.tickerSymbol).quote;
      const menu = {
        position: "top",
        text: `@ ${formattedPrice} ${quote}`,
        click: () => {},
      } as ContextMenuItem;
      menus.push(menu);
    }
    return menus;
  }
  getModule(name: string) {
    if (!this.moduleInstances.has(name)) {
      const module = new MODULES_MAP[name](this.settings, this.chartManager, this);
      this.moduleInstances.set(name, module);
    }
    return this.moduleInstances.get(name);
  }
  initModules() {
    Object.entries(MODULES_MAP).forEach(([name, Module]) => {
      const module = new Module(this.settings, this.chartManager, this);
      this.moduleInstances.set(name, module);
    });
  }
  async onReady() {
    return new Promise((resolve, reject) => {
      if (this.widget) {
        this.widget.onChartReady(() => {
          this.readyPromise?.then(resolve).catch(reject);
        });
      } else {
        reject(Error("cannot call `onReady` before `init`"));
      }
    });
  }
  get isReady() {
    return this.ready;
  }
  async destroy() {
    this.moduleInstances.forEach((module) => {
      if (module.destroy) {
        module.destroy.call(module);
      }
    });

    this.symbolIntervalSubscriptions.forEach((unsubscribe, index, map) => {
      unsubscribe();
      map.delete(index);
    });

    this.domEventTriggered$.complete();
    this.symbolChanged$.complete();
    this.resolutionChanged$.complete();
    this.rightOffsetChanged$.complete();
    this.barSpacingChanged$.complete();
    this.crosshairMoved$.complete();
    this.visibleRangeChanged$.complete();
    this.changed$.complete();

    this.abortController.abort();

    this.ready = false;
    this.widgetReadyPromise = null;
    this.readyPromise = null;

    this.widget?.remove();
    this.widget = null;
  }
  get libraryPath() {
    // return "/_next/static/trading_platform/27.3.2-beta.4/charting_library/";
    return "/static/charting_library/";
  }
  get customCssUrl() {
    // return "light" === this.settings.theme
    //   ? "/static/custom7.light.css"
    //   : "/static/custom7.dark.css";
    return "/static/charting_library/custom-styles.css";
  }
  get localTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  getPriceFormatterFactory() {
    const { priceFormatterFactory } = this.settings;
    return priceFormatterFactory
      ? (symbolInfo: LibrarySymbolInfo | null, minTick: string) =>
          priceFormatterFactory(symbolInfo, minTick)
      : () => {};
  }
  getBrokerConfig(): SingleBrokerMetaInfo | undefined {
    if (this.chartManager.brokerTerminal) {
      return {
        configFlags: {
          supportClosePosition: true,
          supportExecutions: true,
          supportNativeReversePosition: true,
          supportPLUpdate: true,
          supportPositionBrackets: true,
          supportReversePosition: true,
        },
        customUI: {
          showOrderDialog: async (order: OrderTemplate | Order) => {
            this.brokerTerminal?.openOrderDialog(order);
            return false;
          },
          showPositionDialog: async (position: Position | IndividualPosition) => {
            this.brokerTerminal?.openPositionDialog(position);
            return false;
          },
        },
      };
    }
  }
  async asyncWidgetMethodContext(
    callback: (widget: IChartingLibraryWidget, callback: () => void) => void,
  ) {
    new Promise<void>((resolve, reject) => {
      const widgetReadyPromise = this.widgetReadyPromise;
      const abortSingnal = this.abortController.signal;

      if (widgetReadyPromise) {
        const layoutReadyPromise = widgetReadyPromise.then(() => this.waitForLayout());

        const handleAbort = () => reject(abortSingnal.reason);
        abortSingnal.addEventListener("abort", handleAbort);

        layoutReadyPromise
          .then(() => callback(this.widget!, resolve))
          .catch(reject)
          .finally(() => abortSingnal.removeEventListener("abort", handleAbort));
      } else {
        reject(new Error("TvChartLibraryWidgetBridge.asyncWidgetMethodContext: widget not ready"));
      }
    });
  }
  syncChartsChanges() {
    this.widget?.symbolSync()?.setValue(false);
    this.widget?.intervalSync()?.setValue(false);

    const chartCount = this.widget?.chartsCount() ?? 0;

    for (let e = 0; e < chartCount; e++) {
      const area = this.chartManager.areaByIndex(e);
      const chartWidgetApi = this.widget!.chart(e);
      const tickerSymbol = area?.tickerSymbol;
      const resolution = area?.resolution;
      chartWidgetApi.setSymbol(tickerSymbol ?? "", {
        doNotActivateChart: true,
      });
      chartWidgetApi.setResolution(getTvChartLibraryResolution(resolution) as ResolutionString, {
        doNotActivateChart: true,
      });
    }

    const syncSetting = this.chartManager.syncSetting;
    this.widget?.symbolSync()?.setValue(syncSetting.symbol);
    this.widget?.intervalSync()?.setValue(syncSetting.interval);
  }
  subscribeChartsChanges() {
    const chartCount = this.widget?.chartsCount() ?? 0;

    this.symbolIntervalSubscriptions.forEach((unsubscribe, index, map) => {
      if (parseInt(index) >= chartCount) {
        unsubscribe();
        map.delete(index);
      }
    });

    for (let i = 0; i < chartCount; i++) {
      if (this.symbolIntervalSubscriptions.has(`${i}`)) continue;

      const area = this.chartManager.areaByIndex(i) ?? null;
      const chartWidgetApi = this.widget!.chart(i);
      const timescaleApi = chartWidgetApi.getTimeScale();

      this.internalNewChartAdded(i, chartWidgetApi);

      const symbolChangedSubscription = chartWidgetApi.onSymbolChanged();
      const intervalChangedSubscription = chartWidgetApi.onIntervalChanged();
      const rightOffsetChangedSubscription = timescaleApi.rightOffsetChanged();
      const barSpacingChangedSubscription = timescaleApi.barSpacingChanged();
      const visibleRangeChangedSubscription = chartWidgetApi.onVisibleRangeChanged();
      const crosshairMovedSubscription = chartWidgetApi.crossHairMoved();

      const onSymbolChanged = () => {
        this.internalOnSymbolChanged(i, chartWidgetApi);
        area?.setSymbol(chartWidgetApi.symbol()).catch(() => {});
        this.onAutoSaveNeeded();
      };

      const onIntervalChanged = (interval: ResolutionString) => {
        const resolution = getTvChartResolutionReverse(interval);
        this.internalOnResolutionChanged(i, chartWidgetApi);
        area?.setResolution(resolution).catch(() => {});
      };

      const onRightOffsetChanged = (rightOffset: number) => {
        this.internalRightOffsetChanged(i, timescaleApi, rightOffset);
      };

      const onBarSpacingChanged = (newBarSpacing: number) => {
        this.internalBarSpacingChanged(i, timescaleApi, newBarSpacing);
      };

      const onCrosshairMoved = (params: CrossHairMovedEventParams) => {
        this.internalCrosshairMoved(i, timescaleApi, params);
      };

      symbolChangedSubscription.subscribe(area, onSymbolChanged);
      intervalChangedSubscription.subscribe(area, onIntervalChanged);
      rightOffsetChangedSubscription.subscribe(area, onRightOffsetChanged);
      barSpacingChangedSubscription.subscribe(area, onBarSpacingChanged);
      crosshairMovedSubscription.subscribe(area, onCrosshairMoved);

      // TODO why not unsubscribe this ?
      visibleRangeChangedSubscription.subscribe(area, (e) => {
        this.internalVisibleRangeChanged(i, timescaleApi, e);
      });

      this.symbolIntervalSubscriptions.set(`${i}`, () => {
        symbolChangedSubscription.unsubscribe(area, onSymbolChanged);
        intervalChangedSubscription.unsubscribe(area, onIntervalChanged);
        rightOffsetChangedSubscription.unsubscribe(area, onRightOffsetChanged);
        barSpacingChangedSubscription.unsubscribe(area, onBarSpacingChanged);
        crosshairMovedSubscription.unsubscribe(area, onCrosshairMoved);
      });
    }
  }
  updateCSSVariables() {
    Object.entries({
      // TODO ...
    })
      .map(([key, value]) => {
        return [key, getCssPropertyValue(value as string)];
      })
      .forEach(([key, value]) => {
        if (value) {
          this.widget?.setCSSCustomProperty(key, value);
        }
      });
  }
  getInitOverrides() {
    return { ...this.getSettingsOverrides(), ...this.getColorPaletteOverrides() };
  }
  getInitStudiesOverrides() {
    return this.getColorPaletteStudiesOverrides();
  }
  getSettingsOverrides() {
    const { enableLegendSeriesTitle, enableLegendVolume } = this.settings;

    const tradeSettings = this.chartManager.trade;

    const overrides: Record<string, any> = {
      "mainSeriesProperties.minTick": "default",
      "tradingProperties.bracketsPL.display": 2,
      "tradingProperties.horizontalAlignment": getTvChartLibraryAlignment(
        tradeSettings.linePosition,
      ),
      "tradingProperties.extendLeft": tradeSettings.lineHorzVisible,
    };

    if (enableLegendVolume) {
      overrides["paneProperties.legendProperties.showVolume"] = true;
    }
    if (!enableLegendSeriesTitle) {
      overrides["paneProperties.legendProperties.showSeriesTitle"] = false;
    }

    return overrides;
  }
  getColorPaletteStudiesOverrides() {
    return {
      "volume.volume.color.0": TV_CHART_THEME_COLORS.decrease,
      "volume.volume.color.1": TV_CHART_THEME_COLORS.increase,
      "volume.volume.transparency": 80,
    };
  }
  getColorPaletteOverrides() {
    const cardColor =
      "dark" === this.settings.theme
        ? TV_CHART_THEME_COLORS.card
        : TV_CHART_LIGHT_THEME_COLORS.card;
    return {
      "paneProperties.background": TV_CHART_THEME_COLORS.chartBg,
      "paneProperties.backgroundType": "solid" as ColorTypes,
      volumePaneSize: "medium",
      "mainSeriesProperties.candleStyle.upColor": TV_CHART_THEME_COLORS.increase,
      "mainSeriesProperties.barStyle.upColor": TV_CHART_THEME_COLORS.increase,
      "mainSeriesProperties.columnStyle.upColor": TV_CHART_THEME_COLORS.increase,
      "mainSeriesProperties.candleStyle.downColor": TV_CHART_THEME_COLORS.decrease,
      "mainSeriesProperties.barStyle.downColor": TV_CHART_THEME_COLORS.decrease,
      "mainSeriesProperties.columnStyle.downColor": TV_CHART_THEME_COLORS.decrease,
      "mainSeriesProperties.candleStyle.borderUpColor": TV_CHART_THEME_COLORS.increase,
      "mainSeriesProperties.candleStyle.borderDownColor": TV_CHART_THEME_COLORS.decrease,
      "mainSeriesProperties.candleStyle.wickUpColor": TV_CHART_THEME_COLORS.increase,
      "mainSeriesProperties.candleStyle.wickDownColor": TV_CHART_THEME_COLORS.decrease,
      "linetoolorder.quantityBackgroundActiveBuyColor": cardColor,
      "linetoolorder.bodyBackgroundColor": cardColor,
      "linetoolorder.bodyBackgroundTransparency": 0,
      "linetoolorder.bodyBorderActiveBuyColor": TV_CHART_THEME_COLORS.increase,
      "linetoolorder.bodyBorderActiveSellColor": TV_CHART_THEME_COLORS.decrease,
      "linetoolorder.bodyFontBold": false,
      "linetoolorder.bodyTextActiveBuyColor": TV_CHART_THEME_COLORS.increase,
      "linetoolorder.bodyTextActiveLimitColor": TV_CHART_THEME_COLORS.increase,
      "linetoolorder.bodyTextActiveSellColor": TV_CHART_THEME_COLORS.decrease,
      "linetoolorder.bodyTextActiveStopColor": TV_CHART_THEME_COLORS.decrease,
      "linetoolorder.cancelButtonBackgroundColor": cardColor,
      "linetoolorder.cancelButtonBackgroundTransparency": 0,
      "linetoolorder.cancelButtonBorderActiveBuyColor": TV_CHART_THEME_COLORS.increase,
      "linetoolorder.cancelButtonBorderActiveSellColor": TV_CHART_THEME_COLORS.decrease,
      "linetoolorder.cancelButtonIconActiveBuyColor": TV_CHART_THEME_COLORS.increase,
      "linetoolorder.cancelButtonIconActiveSellColor": TV_CHART_THEME_COLORS.decrease,
      "linetoolorder.lineActiveBuyColor": TV_CHART_THEME_COLORS.increase,
      "linetoolorder.lineActiveSellColor": TV_CHART_THEME_COLORS.decrease,
      "linetoolorder.quantityBackgroundActiveSellColor": cardColor,
      "linetoolorder.quantityBorderActiveBuyColor": TV_CHART_THEME_COLORS.increase,
      "linetoolorder.quantityBorderActiveSellColor": TV_CHART_THEME_COLORS.decrease,
      "linetoolorder.quantityFontBold": false,
    };
  }
  applyColorPaletteOverrides() {
    const overrides = this.getColorPaletteOverrides();
    const studyOverrides = this.getColorPaletteStudiesOverrides();
    this.widget?.applyOverrides(overrides);
    this.widget?.applyStudiesOverrides(studyOverrides);
  }
  async handleChartReady() {
    // wait for layout to be ready
    const layout = getTvChartLibraryLayout(this.settings.layout);
    if (layout !== this.widget?.layout()) {
      await this.waitForLayout(layout);
    }

    // set active chart
    const selectedIndex = this.chartManager.selectedIndex;
    this.widget?.setActiveChart(selectedIndex);

    // reset color palette
    const saveLoadAdapter = this.getModule("saveLoadAdapter") as TvChartSaveLoadAdapter;
    if (saveLoadAdapter.shouldResetColorPalette) {
      const theme = this.settings.theme;
      await this.widget?.changeTheme(getTvChartLibraryTheme(theme), {
        disableUndo: true,
      });
      this.applyColorPaletteOverrides();
    }

    // subscribe to events
    this.widget?.subscribe("onAutoSaveNeeded", this.onAutoSaveNeeded.bind(this));
    this.widget?.subscribe("activeChartChanged", this.activeChartChanged.bind(this));
    this.widget?.subscribe("layout_about_to_be_changed", this.layoutWillChange.bind(this));
    this.widget?.subscribe("layout_changed", this.layoutChanged.bind(this));
    this.widget?.subscribe("onSelectedLineToolChanged", this.onSelectedLineToolChanged.bind(this));
    this.widget?.subscribe("study", this.studyAdded.bind(this));
    this.widget?.onContextMenu(this.onContextMenu.bind(this));

    this.syncChartsChanges();
    this.subscribeChartsChanges();
    this.subscribeSettingsUpdate();
    this.installEventHooks();
    this.resetTimezone();
    this.legacyHandleOnChartReady();
  }
  installEventHooks() {
    const iframeElement = this.getIframeElement();
    const contentDocument = this.getContentDocument();

    contentDocument?.addEventListener("keydown", (e) => {
      // TODO why re-dispatch keyboard events?
      const elem = e.target as HTMLElement;
      if (!["input", "textarea"].includes(elem.tagName.toLowerCase()) && !elem.isContentEditable) {
        const evt = new KeyboardEvent("keydown", e);
        iframeElement?.dispatchEvent(evt);
      }
      if (checkKeyboardShortcut(e, "Period")) {
        e.preventDefault();
      }
      if (checkKeyboardShortcut(e, "KeyF", { shiftKey: true })) {
        e.preventDefault();
      }
    });

    contentDocument?.addEventListener("click", () => iframeElement?.click());

    if (contentDocument && contentDocument.defaultView?.MutationObserver) {
      const chartElementsSet = new WeakSet();
      const layoutElement = contentDocument.querySelector(".layout__area--center");
      if (layoutElement) {
        const registerChartListeners = () => {
          layoutElement.querySelectorAll(".chart-container").forEach((chartElement, index) => {
            if (!chartElementsSet.has(chartElement)) {
              chartElementsSet.add(chartElement);
              // forward chart dom events across iframe
              TV_CHART_INTERESTED_DOM_EVENTS.forEach((eventName) => {
                chartElement.addEventListener(
                  eventName,
                  (evt) => this.internalDomEventTriggered(index, eventName, evt),
                  {
                    passive: true,
                  },
                );
              });
            }
          });
        };
        // listen to chart layout changes, and register listeners for each new chart
        new contentDocument.defaultView.MutationObserver(registerChartListeners).observe(
          layoutElement,
          {
            childList: true,
          },
        );
        // register listeners for existing charts
        registerChartListeners();
      }
    }
  }
  resetTimezone() {
    try {
      const chartCount = this.widget?.chartsCount() ?? 0;
      for (let i = 0; i < chartCount; i++) {
        this.widget
          ?.chart(i)
          ?.getTimezoneApi()
          ?.setTimezone(this.localTimezone as TimezoneId);
      }
    } catch (e) {
      console.error("TvChartLibraryWidgetBridge: Reset timezone", e);
    }
  }
  installDataErrorHandler() {
    (this.getModule("datafeed") as TvChartDataFeed).onMainSeriesError().subscribe(() => {});
  }
  async resetErrors() {
    this.errorNotificationCloser?.();
    this.errorNotificationCloser = null;

    if (this.errorResetType === TvChartErrorResetType.ResetData) {
      this.errorRequests.forEach((request) => {
        const { tickerSymbol, resolution, params } = request;
        (this.getModule("datafeed") as TvChartDataFeed).resetData(
          tickerSymbol,
          resolution,
          params.priceType,
        );
        this.resetData(tickerSymbol, resolution, params.priceType);
      });
      this.errorRequests.clear();
      this.errorResetType = TvChartErrorResetType.None;
    }

    if (this.errorResetType === TvChartErrorResetType.ResetChart) {
      this.chartManager.reloadChart();
      throw new Error("TvChartLibraryWidgetBridge: Reset chart");
    }
  }
  getChartWidgets(
    tickerSymbol?: string,
    resolution?: string,
    _priceType?: string,
  ): [number, IChartWidgetApi][] {
    return Array.from({ length: this.widget?.chartsCount() ?? 0 })
      .map((_, index) => index)
      .filter((index) => {
        const area = this.chartManager.areaByIndex(index);
        return (
          (!tickerSymbol || tickerSymbol === area?.tickerSymbol) &&
          (!resolution || resolution === area?.resolution)
        );
      })
      .map((index) => [index, this.widget!.chart(index)]);
  }
  forceRerender() {
    this.getChartWidgets().forEach(([_, chartWidgetApi]) => {
      const timescaleApi = chartWidgetApi.getTimeScale();
      const spacing = timescaleApi.barSpacing() + 1e-10;
      timescaleApi.setBarSpacing(spacing);
    });
  }
  internalNewChartAdded(_index: number, chartWidgetApi: IChartWidgetApi) {
    chartWidgetApi.getPanes().forEach((pane) => {
      pane.getMainSourcePriceScale()?.setAutoScale(true);
    });
  }
  internalDomEventTriggered(index: number, eventName: string, event: Event) {
    this.domEventTriggered$.next([index, eventName, event]);
  }
  internalOnSymbolChanged(index: number, chartWidgetApi: IChartWidgetApi) {
    chartWidgetApi.dataReady(() => {
      this.symbolChanged$.next([index, chartWidgetApi.symbol()]);
    });
  }
  internalOnResolutionChanged(index: number, chartWidgetApi: IChartWidgetApi) {
    chartWidgetApi.dataReady(() => {
      this.resolutionChanged$.next([
        index,
        getTvChartResolutionReverse(chartWidgetApi.resolution()),
      ]);
    });
  }
  internalRightOffsetChanged(index: number, _timescale: ITimeScaleApi, offset: number) {
    this.rightOffsetChanged$.next([index, offset]);

    if (this.initRightOffset === null) {
      this.initRightOffset = offset;
    }

    if (this.rightOffsetChangedTimer !== null) {
      clearTimeout(this.rightOffsetChangedTimer);
      this.rightOffsetChangedTimer = null;
    }

    // TODO why reset right offset after 1s?
    this.rightOffsetChangedTimer = window.setTimeout(() => {
      this.initRightOffset = null;
    }, 1e3);
  }
  internalBarSpacingChanged(index: number, _timescale: ITimeScaleApi, spacing: number) {
    this.barSpacingChanged$.next([index, spacing]);

    if (this.initBarSpacing === null) {
      this.initBarSpacing = spacing;
    }

    if (this.barSpacingChangedTimer !== null) {
      clearTimeout(this.barSpacingChangedTimer);
      this.barSpacingChangedTimer = null;
    }

    // TODO why reset bar spacing after 1s?
    this.barSpacingChangedTimer = window.setTimeout(() => {
      this.initBarSpacing = null;
      this.onAutoSaveNeeded();
    }, 1e3);
  }
  internalVisibleRangeChanged(index: number, _timescale: ITimeScaleApi, range: VisibleTimeRange) {
    this.visibleRangeChanged$.next([index, range]);
  }
  internalCrosshairMoved(
    index: number,
    _timescale: ITimeScaleApi,
    params: CrossHairMovedEventParams,
  ) {
    this.crosshairMoved$.next([index, params]);
  }
  resetCustomIndicators() {
    const chartCount = this.widget?.chartsCount() ?? 0;
    for (let i = 0; i < chartCount; i++) {
      this.widget
        ?.chart(i)
        ?.getAllStudies()
        ?.forEach((it) => {
          const study = it as unknown as IStudyApi;
          if (study.getInputsInfo().find((input) => "reset" === input.id)) {
            const item = {
              id: "reset",
              value: Date.now(),
            } as StudyInputValueItem;
            study.setInputValues([item]);
          }
        });
    }
  }
  symbolChanged() {
    return this.symbolChanged$.asObservable();
  }
  resolutionChanged() {
    return this.resolutionChanged$.asObservable();
  }
  rightOffsetChanged() {
    return this.rightOffsetChanged$.asObservable();
  }
  barSpacingChanged() {
    return this.barSpacingChanged$.asObservable();
  }
  visibleRangeChanged() {
    return this.visibleRangeChanged$.asObservable();
  }
  crosshairMoved() {
    return this.crosshairMoved$.asObservable();
  }
  onSelectedLineToolChanged() {}
  subscribeSettingsUpdate() {}
  studyAdded() {}
  legacyHandleOnChartReady() {}
  getBrokerFactory() {}
}

// TODO gmgn register customer render layer, but we don't have it.
// function customRenderWeight(chartManager: TvChartManager) {
//   return class {
//     _chartWidgetCollection: any;

//     setChartWidgetCollection(chartWidgetCollection: any) {
//       this._chartWidgetCollection = chartWidgetCollection;
//       this._registerCustomSources(chartWidgetCollection);
//       chartManager.destroyed$.subscribe((destroyed) => {
//         if (destroyed) {
//           this.destroy();
//         }
//       });
//     }

//     _registerCustomSources(chartWidgetCollection: any) {
//       chartWidgetCollection.addCustomSource(
//         "HistoryTradesRender",
//         (id, model) => new HistoryTradesRender(id, model, this.chartManager),
//       );
//       chartWidgetCollection.addCustomSource(
//         "MarketOpenRender",
//         (id, model) => new MarketOpenRender(id, model, this.chartManager),
//       );
//     }
//     destroy() {
//       this._chartWidgetCollection?.removeCustomSource("HistoryTradesRender");
//       this._chartWidgetCollection?.removeCustomSource("MarketOpenRender");
//     }
//   };
// }
