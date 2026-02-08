import { reverse } from "lodash-es";

export const CHART_COLORS = [
  "#bcff2e",
  "#f76816",
  "#9353d3",
  "#f31260",
  "#006FEE",
  "#14b8a6",
  "#eab308",
  "#c026d3",
];

export const PIE_MAX_COUNT = 6;

export function interpolateTimes(time: string): Date[] {
  const now = new Date();
  const timestamps = [];

  const timeConfig = {
    "1d": { count: 24, interval: 60 * 60 * 1000 },
    "1w": { count: 7, interval: 24 * 60 * 60 * 1000 },
    "1M": { count: 30, interval: 24 * 60 * 60 * 1000 },
    "3M": { count: 13, interval: 7 * 24 * 60 * 60 * 1000 },
    "6M": { count: 26, interval: 7 * 24 * 60 * 60 * 1000 },
  };

  const config = timeConfig[time as keyof typeof timeConfig];

  if (config) {
    for (let i = 0; i < config.count; i++) {
      timestamps.push(new Date(now.getTime() - i * config.interval));
    }
  }
  return reverse(timestamps);
}
