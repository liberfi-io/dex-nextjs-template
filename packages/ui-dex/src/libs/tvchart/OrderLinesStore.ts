import { PositionLinesStore } from "./PositionLinesStore";
import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";

export class OrderLinesStore {
  constructor(
    _settings: TvChartSettings,
    _chartManager: TvChartManager,
    _positionLinesStore: PositionLinesStore,
  ) {}

  reset() {
    console.debug("reset");
  }
  destroy() {
    console.debug("destroy");
  }
}
