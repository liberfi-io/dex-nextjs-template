export type ChartResolution =
  | "1s"
  | "5s"
  | "15s"
  | "30s"
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "12h"
  | "1d";

const RESOLUTION_MS: Record<ChartResolution, number> = {
  "1s": 1_000,
  "5s": 5_000,
  "15s": 15_000,
  "30s": 30_000,
  "1m": 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "4h": 4 * 60 * 60_000,
  "12h": 12 * 60 * 60_000,
  "1d": 24 * 60 * 60_000,
};

/** Same G2/SDK candle open-time floor used by T51-07 parity fixtures. */
export function floorToResolution(timestampMs: number, resolution: ChartResolution): number {
  const periodMs = RESOLUTION_MS[resolution] ?? 60_000;
  return Math.floor(timestampMs / periodMs) * periodMs;
}
