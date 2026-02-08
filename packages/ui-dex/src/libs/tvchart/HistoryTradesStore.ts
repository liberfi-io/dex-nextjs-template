import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";

export class HistoryTradesStore {
  constructor(_settings: TvChartSettings, _chartManager: TvChartManager) {}

  reset() {
    console.log("reset");
  }
  destroy() {
    console.log("destroy");
  }
}
