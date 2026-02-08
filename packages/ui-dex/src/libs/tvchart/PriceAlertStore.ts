/* eslint-disable @typescript-eslint/no-explicit-any */
import { TvChartManager } from "./TvChartManager";

export class PriceAlertStore {
  constructor(
    _chartManager: TvChartManager,
  ) {}

  reset() {
    console.log("reset");
  }

  toggleDialog(on: boolean, e: any, type: string) {
    console.log("toggleDialog", on, e, type);
  }
}
