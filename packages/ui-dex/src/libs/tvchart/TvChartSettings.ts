/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, distinctUntilChanged, map, Observable } from "rxjs";
import {
  ALL_TV_CHART_RESOLUTIONS,
  ENABLED_TV_CHART_FEATURES,
  SUPPORTED_TV_CHART_LAYOUTS,
} from "./constants";
import { TvChartSettingsStore } from "./TvChartSettingsStore";
import { TvChartFeature, TvChartLayout, TvChartType } from "./types";
import { getTvChartLibraryResolution } from "./utils";

const defaultSettings = {
  enabledFeatures: [] as TvChartFeature[],
  disabledFeatures: [] as TvChartFeature[],
  supportedResolutions: ALL_TV_CHART_RESOLUTIONS.map(getTvChartLibraryResolution),
  supportedLayouts: SUPPORTED_TV_CHART_LAYOUTS,
  supportedChartTypes: [TvChartType.TradingView],
  chartNames: {} as Record<string, string>,
  storageId: "kline",
  inverseTradeUnit: 0,
  linearTradeUnit: 0,
  saveLoadAdapter: new TvChartSettingsStore("kline"),
  symbol: "",
  tickerSymbol: "",
  layout: TvChartLayout.Layout1A,
  chartType: TvChartType.TradingView,
  priceFormatterFactory: null,
  timezone: "Etc/UTC",
  locale: "en",
  theme: "dark",
  reverseColor: false,
  longShortMode: false,
  onThemeChange: null,
  openPlaceOrderPane: null,
  getTradeHeader: null,
  backgroundColor: null,
  renderAlertHeaderPortal: false,
  chartTradeSettingActions: undefined,
};

export class TvChartSettings {
  private state$: BehaviorSubject<any>;

  constructor() {
    this.state$ = new BehaviorSubject<any>(defaultSettings);
  }
  getState(key: string) {
    return this.state$.getValue()[key];
  }
  getState$() {
    return this.state$.asObservable();
  }
  setState(field: string, value: any) {
    if (value !== null && value !== undefined) {
      this.state$.next({ ...this.state$.getValue(), [field]: value });
    }
  }
  get enabledFeatures(): string[] {
    return this.getState("enabledFeatures");
  }
  get disabledFeatures(): string[] {
    return this.getState("disabledFeatures");
  }
  get supportedResolutions() {
    return this.getState("supportedResolutions");
  }
  get layout() {
    return this.getState("layout");
  }
  get theme(): string {
    return this.getState("theme");
  }
  get reverseColor() {
    return this.getState("reverseColor");
  }
  get timezone() {
    return this.getState("timezone");
  }
  get locale() {
    return this.getState("locale");
  }
  get backgroundColor() {
    return this.getState("backgroundColor");
  }
  get renderAlertHeaderPortal() {
    return this.getState("renderAlertHeaderPortal");
  }
  get chartTradeSettingActions() {
    return this.getState("chartTradeSettingActions");
  }
  get chartType(): TvChartType {
    return this.getState("chartType");
  }
  get tickerSymbol(): string {
    return this.getState("tickerSymbol");
  }
  get symbol(): string {
    return this.getState("symbol");
  }
  get inverseTradeUnit() {
    return this.getState("inverseTradeUnit");
  }
  get linearTradeUnit(): string {
    return this.getState("linearTradeUnit");
  }
  get saveLoadAdapter() {
    return this.getState("saveLoadAdapter");
  }
  get storageId() {
    return this.getState("storageId");
  }
  get priceFormatterFactory() {
    return this.getState("priceFormatterFactory");
  }
  updateValue(key: string, value: any) {
    this.setState(key, value);
  }
  updateMultipleValues(kvs: any) {
    this.state$.next({ ...this.state$.getValue(), ...kvs });
  }
  isFeatureEnabled(feature: TvChartFeature): boolean {
    const enabledFeatures = this.getState("enabledFeatures");
    const disabledFeatures = this.getState("disabledFeatures");
    return (
      (!disabledFeatures.includes(feature) && enabledFeatures.includes(feature)) ||
      ENABLED_TV_CHART_FEATURES.includes(feature)
    );
  }
  subscribeValueChange<T>(field: string): Observable<T> {
    return this.state$.pipe(
      map((v) => v[field]),
      distinctUntilChanged(),
    );
  }
  on<T>(field: string): Observable<T> {
    return this.subscribeValueChange(field) as Observable<T>;
  }
  setFeature(feature: string, enabled: boolean) {
    this.resetFeature(feature);
    if (enabled) {
      this.setState("enabledFeatures", [...this.enabledFeatures, feature]);
    } else {
      this.setState("disabledFeatures", [...this.disabledFeatures, feature]);
    }
  }
  resetFeature(feature: string) {
    this.updateMultipleValues({
      enabledFeatures: this.enabledFeatures.filter((f) => f !== feature),
      disabledFeatures: this.disabledFeatures.filter((f) => f !== feature),
    });
  }
  get enableHeaderWidget() {
    return this.isFeatureEnabled(TvChartFeature.HeaderWidget);
  }
  get enableHeaderSimpleMode() {
    return this.isFeatureEnabled(TvChartFeature.HeaderSimpleMode);
  }
  get enableHeaderKLineTradeMode() {
    return this.isFeatureEnabled(TvChartFeature.HeaderKLineTradeMode);
  }
  get enableHeaderPriceTypeMenu() {
    return this.isFeatureEnabled(TvChartFeature.HeaderPriceTypeMenu);
  }
  get enableHeaderLayoutSelectMenu() {
    return this.isFeatureEnabled(TvChartFeature.HeaderLayoutSelectMenu);
  }
  get enableHeaderCandleStyleMenu() {
    return this.isFeatureEnabled(TvChartFeature.HeaderCandleStyleMenu);
  }
  get enableHeaderCompareSymbolMenu() {
    return this.isFeatureEnabled(TvChartFeature.HeaderCompareSymbolMenu);
  }
  get enableHeaderFullscreenButton() {
    return this.isFeatureEnabled(TvChartFeature.HeaderFullscreenButton);
  }
  get enableMultiCharts() {
    return this.isFeatureEnabled(TvChartFeature.MultiCharts);
  }
  get enablePercentageMarketOrder() {
    return this.isFeatureEnabled(TvChartFeature.PercentageMarketOrder);
  }
  get enablePercentageLimitOrder() {
    return this.isFeatureEnabled(TvChartFeature.PercentageLimitOrder);
  }
  get enableDisplayOrderQuantityHint() {
    return this.isFeatureEnabled(TvChartFeature.DisplayOrderQuantityHint);
  }
  get enableTrade() {
    return this.isFeatureEnabled(TvChartFeature.Trade);
  }
  get enableTradeOrderRecord() {
    return this.enableTrade && this.isFeatureEnabled(TvChartFeature.TradeOrderRecord);
  }
  get enableTradeOrderPanel() {
    return this.enableTrade && this.isFeatureEnabled(TvChartFeature.TradeOrderPanel);
  }
  get enableTradeOrderButton() {
    return this.enableTrade && this.isFeatureEnabled(TvChartFeature.TradeOrderButton);
  }
  get enableTradeIndicator() {
    return this.isFeatureEnabled(TvChartFeature.TradeIndicator);
  }
  get enableCreateVolumeIndicatorByDefault() {
    return this.isFeatureEnabled(TvChartFeature.CreateVolumeIndicatorByDefault);
  }
  get enableHideDrawingToolsByDefault() {
    return this.isFeatureEnabled(TvChartFeature.HideDrawingToolsByDefault);
  }
  get enableLegendSeriesTitle() {
    return this.isFeatureEnabled(TvChartFeature.LegendSeriesTitle);
  }
  get enableLegendVolume() {
    return this.isFeatureEnabled(TvChartFeature.LegendVolume);
  }
  get enableTimeframesToolbar() {
    return this.isFeatureEnabled(TvChartFeature.TimeframesToolbar);
  }
  get enablePriceAlert() {
    return this.isFeatureEnabled(TvChartFeature.PriceAlert);
  }
  get enableTradingViewWebhookAlert() {
    return this.isFeatureEnabled(TvChartFeature.TradingViewWebhookAlert);
  }
  get enableSaveDrawingToServer() {
    return this.isFeatureEnabled(TvChartFeature.SaveDrawingToServer);
  }
  get enableSaveIndicatorSettingToServer() {
    return this.isFeatureEnabled(TvChartFeature.SaveIndicatorSettingToServer);
  }
  get enableHistoryDataTools() {
    return this.isFeatureEnabled(TvChartFeature.HistoryDataTools);
  }
  get enableVolumeForceOverlay() {
    return this.isFeatureEnabled(TvChartFeature.VolumeForceOverlay);
  }
}
