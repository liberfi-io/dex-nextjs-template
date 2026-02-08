/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThemeName } from "../../../../../apps/web/public/static/charting_library";
import { TvChartLibraryWidgetBridge } from "./TvChartLibraryWidgetBridge";
import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";
import { TvChartWidget } from "./TvChartWidget";
import { TvChartLayout } from "./types";
import { getTvChartLibraryLayout } from "./utils";

export class TvChartLibraryWidget {
  settings: TvChartSettings;
  chartManager: TvChartManager;
  bridge: TvChartLibraryWidgetBridge;

  constructor(
    settings: TvChartSettings,
    chartManager: TvChartManager,
    bridge: TvChartLibraryWidgetBridge,
  ) {
    this.settings = settings;
    this.chartManager = chartManager;
    this.bridge = bridge;
  }

  get widget() {
    return this.bridge.getWidget();
  }
  chartByIndex(index: number) {
    return new TvChartWidget(this.settings, this.chartManager, this.bridge, index);
  }
  activeChart() {
    const activeChartIndex = this.widget?.activeChartIndex();
    return activeChartIndex === undefined ? undefined : this.chartByIndex(activeChartIndex);
  }
  openIndicatorSettingsDialog() {
    this.widget?.activeChart().executeActionById("insertIndicator");
  }
  openSettingsDialog() {
    this.widget?.activeChart().executeActionById("chartProperties");
  }
  openCompareSymbolDialog() {
    this.widget?.activeChart().executeActionById("compareOrAdd");
  }
  takeClientScreenshot() {
    return this.widget?.takeClientScreenshot();
  }
  // TODO toast?
  showNotification(_message: string) {
    // return this.instance.notificationManager?.showNotification(message);
  }
  onLayoutChange(layout: TvChartLayout) {
    this.widget?.setLayout(getTvChartLibraryLayout(layout));
  }
  async onThemeChange(theme: ThemeName, _reverseColor: boolean) {
    await this.widget?.changeTheme(theme, { disableUndo: true });
    this.bridge.updateCSSVariables();
    this.bridge.applyColorPaletteOverrides();
  }
  legacyOrdersUpdate(e: any) {
    this.bridge.brokerTerminal?.internalOrdersUpdate(e);
  }
  barSelected() {}
  legacyLeverageInfoUpdate() {}
}
