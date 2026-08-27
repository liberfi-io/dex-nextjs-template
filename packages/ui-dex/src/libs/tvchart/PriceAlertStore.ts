/* eslint-disable @typescript-eslint/no-explicit-any */
import { TvChartManager } from "./TvChartManager";

export class PriceAlertStore {
  constructor(
    _chartManager: TvChartManager,
  ) {}

  reset() {
    console.debug("reset");
  }

  toggleDialog(on: boolean, e: any, type: string) {
    console.debug("toggleDialog", on, e, type);
  }
}
