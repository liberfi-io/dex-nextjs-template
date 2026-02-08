/* eslint-disable @typescript-eslint/no-explicit-any */
import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";
import { TvChartLibraryWidgetBridge } from "./TvChartLibraryWidgetBridge";

const CHART_SETTINGS_KEY = "trading.chart.proterty";
const SETTINGS_PREFIX = "tradingview-pi.";
const DEPRECATED_SETTINGS_PREFIX = "tradingview.";

function trimDeprecatedSettingsPrefix(key: string): string | null {
  if (key && key.startsWith(DEPRECATED_SETTINGS_PREFIX)) {
    return key.replace(DEPRECATED_SETTINGS_PREFIX, "");
  } else {
    return null;
  }
}

function trimSettingsPrefix(key: string): string | null {
  if (key && key.startsWith(SETTINGS_PREFIX)) {
    return key.replace(SETTINGS_PREFIX, "");
  } else {
    return null;
  }
}

export class TvChartSettingsAdapter {
  settings: TvChartSettings;
  chartManager: TvChartManager;
  bridge: TvChartLibraryWidgetBridge;
  initialSettings: Record<string, any>;

  constructor(
    settings: TvChartSettings,
    chartManager: TvChartManager,
    bridge: TvChartLibraryWidgetBridge,
  ) {
    this.settings = settings;
    this.chartManager = chartManager;
    this.bridge = bridge;
    this.initialSettings = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key);
      const settingsKey = trimSettingsPrefix(key);
      const deprecatedSettingsKey = trimDeprecatedSettingsPrefix(key);

      if (settingsKey) {
        this.initialSettings[settingsKey] = value;
      } else if (deprecatedSettingsKey) {
        if (!localStorage.getItem(`${SETTINGS_PREFIX}${deprecatedSettingsKey}`)) {
          this.initialSettings[deprecatedSettingsKey] = value;
        }
      }
    }

    const defaultChartSettings = { noConfirmEnabled: 1 };
    if (this.initialSettings[CHART_SETTINGS_KEY]) {
      try {
        const chartSettings = JSON.parse(this.initialSettings[CHART_SETTINGS_KEY]);
        Object.assign(defaultChartSettings, chartSettings);
        Object.assign(defaultChartSettings, { noConfirmEnabled: true });
      } catch (e) {
        console.error(`TvChartSettingsAdapter: failed to parse chart settings`, e);
      }
    }
    this.initialSettings[CHART_SETTINGS_KEY] = JSON.stringify(defaultChartSettings);
  }
  toJSON() {
    return null;
  }
  removeValue(key: string) {
    delete this.initialSettings[key];
    localStorage.removeItem(`${SETTINGS_PREFIX}${key}`);
  }
  setValue(key: string, value: any) {
    this.initialSettings[key] = value;
    localStorage.setItem(`${SETTINGS_PREFIX}${key}`, value);
  }
}
