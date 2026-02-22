import {
  createContext,
  forwardRef,
  PropsWithChildren,
  useContext,
  useImperativeHandle,
  useMemo,
} from "react";
import { TvChartManager } from "../../libs/tvchart/TvChartManager";
import { TvChartSettings } from "../../libs/tvchart/TvChartSettings";
import { Timezone } from "../../../../../apps/web/public/static/charting_library";
import { TvChartLayout, TvChartResolution, TvChartType } from "../../libs/tvchart";
import { TvChartConfig, TvChartConfigProvider } from "./TvChartConfigProvider";

export type TvChartContextValue = {
  chartSettings: TvChartSettings;
  chartManager: TvChartManager;
};

export const TvChartContext = createContext<TvChartContextValue>({} as TvChartContextValue);

export function useTvChartContext() {
  const context = useContext(TvChartContext);
  if (!context) {
    throw new Error("useTvChartContext must be used within a TvChartContext.Provider");
  }
  return context;
}

export function useTvChartManager() {
  const context = useTvChartContext();
  return context.chartManager;
}

export type TvChartProviderProps = PropsWithChildren<{
  initConfig: TvChartConfig;
}>;

export const TvChartProvider = forwardRef<TvChartHandle, TvChartProviderProps>(
  ({ children, initConfig }, ref) => {
    const chartSettings = useMemo(() => new TvChartSettings(), []);
    const chartManager = useMemo(() => new TvChartManager(chartSettings), [chartSettings]);
    const handle = useMemo(
      () => new TvChartHandle(chartSettings, chartManager),
      [chartSettings, chartManager],
    );
    // const value = useMemo(() => ({ chartSettings, chartManager }), [chartSettings, chartManager]);
    useImperativeHandle(ref, () => handle, [handle]);
    return (
      <TvChartContext.Provider value={{ chartSettings, chartManager }}>
        <TvChartConfigProvider initConfig={initConfig}>{children}</TvChartConfigProvider>
      </TvChartContext.Provider>
    );
  },
);

export class TvChartHandle {
  setting: TvChartSettings;
  chartManager: TvChartManager;

  constructor(setting: TvChartSettings, chartManager: TvChartManager) {
    this.setting = setting;
    this.chartManager = chartManager;
  }
  get internalWidget() {
    return this.chartManager.internalWidget;
  }
  chartCount() {
    return this.chartManager.chartCount;
  }
  chart(index: number) {
    if (index < this.chartCount()) {
      return new TvChartAreaHandle(this.setting, this.chartManager, index);
    }
  }
  activeChart() {
    return this.chart(this.chartManager.selectedIndex);
  }
  setActiveChart(index: number) {
    if (index < this.chartCount()) {
      this.chartManager.selectedIndex = index;
    }
  }
  layout(): TvChartLayout {
    return this.setting.layout;
  }
  setLayout(layout: TvChartLayout) {
    this.chartManager.setLayout(layout);
  }
  theme(): string {
    return this.setting.theme;
  }
  setTheme(theme: string) {
    this.chartManager.setTheme(theme);
  }
  reverseColor(): boolean {
    return this.setting.reverseColor;
  }
  setReverseColor(reverseColor: boolean) {
    this.chartManager.setReverseColor(reverseColor);
  }
  timezone(): Timezone {
    return this.setting.timezone;
  }
  setTimezone(timezone: Timezone) {
    this.chartManager.setTimezone(timezone);
  }
  setChartType(chartType: TvChartType) {
    this.chartManager.setChartType(chartType);
  }
  toggleLoading(loading: boolean) {
    this.chartManager.setLoading(loading);
  }
  getSetting() {
    return this.setting;
  }
  getChartManager() {
    return this.chartManager;
  }
}

export class TvChartAreaHandle {
  setting: TvChartSettings;
  chartManager: TvChartManager;
  chartIndex: number;

  constructor(setting: TvChartSettings, chartManager: TvChartManager, chartIndex: number) {
    this.setting = setting;
    this.chartManager = chartManager;
    this.chartIndex = chartIndex;
  }
  get chartAreaManager() {
    return this.chartManager.areaByIndex(this.chartIndex);
  }
  get internalChartWidget() {
    return this.chartManager.internalWidget?.chartByIndex(this.chartIndex);
  }
  symbol() {
    return this.chartAreaManager?.tickerSymbol;
  }
  resolution(): TvChartResolution {
    return this.chartAreaManager?.resolution;
  }
  latestBar() {
    return this.internalChartWidget?.latestBar() ?? null;
  }
  async setSymbol(symbol: string) {
    await this.chartAreaManager?.setSymbol(symbol);
  }
  async setResolution(resolution: TvChartResolution) {
    await this.chartAreaManager?.setResolution(resolution);
  }
  setPrecision(precision: number) {
    this.internalChartWidget?.setPrecision(precision);
  }
  dataReady() {
    return this.internalChartWidget?.dataReady() ?? Promise.reject();
  }
  toggleLoading(loading: boolean) {
    this.internalChartWidget?.toggleLoading(loading);
  }
  setDepth(depth: number) {
    this.internalChartWidget?.legacySetDepth(depth);
  }
  setMarket(market: string) {
    this.internalChartWidget?.legacySetMarket(market);
  }
}
