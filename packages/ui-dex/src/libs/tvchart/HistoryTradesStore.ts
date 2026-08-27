import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";

export class HistoryTradesStore {
  constructor(_settings: TvChartSettings, _chartManager: TvChartManager) {}

  reset() {
    console.debug("reset");
  }
  destroy() {
    console.debug("destroy");
  }
}
