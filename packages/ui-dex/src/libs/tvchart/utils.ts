import {
  LanguageCode,
  LayoutType,
  ResolutionString,
  ThemeName,
} from "../../../../../apps/web/public/static/charting_library";
import {
  TvChartLayout,
  TvChartPriceType,
  TvChartQuoteType,
  TvChartResolution,
  TvChartSymbol,
} from "./types";

export function parseSymbol(symbol: string): TvChartSymbol {
  const [chain, address, quote, priceType] = symbol.split("/");
  return {
    address,
    chain,
    quote: quote as TvChartQuoteType,
    priceType: priceType as TvChartPriceType,
  };
}

export function stringifySymbol(symbol: TvChartSymbol): string {
  if (!symbol.quote || !symbol.priceType) {
    return `${symbol.chain}/${symbol.address}`;
  } else {
    return `${symbol.chain}/${symbol.address}/${symbol.quote}/${symbol.priceType}`;
  }
}

export function stringifySymbolShort(symbol: TvChartSymbol): string {
  return `${symbol.chain}/${symbol.address}`;
}

const THEME_MAP: Record<string, ThemeName> = {
  dark: "Dark",
  light: "Light",
  classic: "Classic",
};

export function getTvChartLibraryTheme(theme: string): ThemeName {
  return THEME_MAP[theme.toLowerCase()] ?? "Dark";
}

const RESOLUTION_MAP: Record<TvChartResolution, string> = {
  "1s": "1S",
  "5s": "5S",
  "15s": "15S",
  "30s": "30S",
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "30m": "30",
  "1h": "60",
  "4h": "240",
  "12h": "720",
  "1d": "1D",
};

export function getTvChartLibraryResolution(
  resolution: TvChartResolution = "1m",
): ResolutionString {
  return (RESOLUTION_MAP[resolution] ?? RESOLUTION_MAP["1m"]) as ResolutionString;
}

const RESOLUTION_MAP_REVERSE: Record<string, TvChartResolution> = {
  "1S": "1s",
  "5S": "5s",
  "15S": "15s",
  "30S": "30s",
  "1": "1m",
  "5": "5m",
  "15": "15m",
  "30": "30m",
  "60": "1h",
  "240": "4h",
  "720": "12h",
  "1D": "1d",
};

export function getTvChartResolutionReverse(resolution: string): TvChartResolution {
  return RESOLUTION_MAP_REVERSE[resolution] ?? "1s";
}

const LOCALE_MAP: Record<string, LanguageCode> = {
  en: "en",
  "zh-CN": "zh",
  "zh-TW": "zh",
} as Record<string, LanguageCode>;

export function getTvChartLibraryLocale(locale: string): LanguageCode {
  return LOCALE_MAP[locale] ?? locale;
}

export const LAYOUT_MAP: Record<TvChartLayout, LayoutType> = {
  [TvChartLayout.Layout1A]: "s",
  [TvChartLayout.Layout2A]: "2h",
  [TvChartLayout.Layout2B]: "2v",
  [TvChartLayout.Layout3A]: "3s",
  [TvChartLayout.Layout3B]: "3h",
  [TvChartLayout.Layout3C]: "3v",
  [TvChartLayout.Layout3D]: "2-1",
  [TvChartLayout.Layout3E]: "1-2",
  [TvChartLayout.Layout3F]: "3r",
  [TvChartLayout.Layout4A]: "4",
  [TvChartLayout.Layout4B]: "4h",
  [TvChartLayout.Layout4C]: "4v",
  [TvChartLayout.Layout4D]: "4s",
  [TvChartLayout.Layout4E]: "1-3",
  [TvChartLayout.Layout4F]: "2-2",
  [TvChartLayout.Layout5A]: "1-4",
  [TvChartLayout.Layout5B]: "5s",
  [TvChartLayout.Layout5C]: "2-3",
  [TvChartLayout.Layout5D]: "5h",
  [TvChartLayout.Layout6A]: "6",
  [TvChartLayout.Layout6B]: "6c",
  [TvChartLayout.Layout6C]: "6h",
  [TvChartLayout.Layout7A]: "7h",
  [TvChartLayout.Layout8A]: "8",
  [TvChartLayout.Layout8B]: "8c",
  [TvChartLayout.Layout8C]: "8h",
};

export function getTvChartLibraryLayout(layout: TvChartLayout): LayoutType {
  return LAYOUT_MAP[layout] ?? "s";
}

const LAYOUT_MAP_REVERSE: Record<LayoutType, TvChartLayout> = {
  s: TvChartLayout.Layout1A,
  "1-2": TvChartLayout.Layout3E,
  "1-3": TvChartLayout.Layout4E,
  "1-4": TvChartLayout.Layout5A,
  "2-1": TvChartLayout.Layout3D,
  "2-2": TvChartLayout.Layout4F,
  "2-3": TvChartLayout.Layout5C,
  "2h": TvChartLayout.Layout2A,
  "2v": TvChartLayout.Layout2B,
  "3h": TvChartLayout.Layout3B,
  "3r": TvChartLayout.Layout3F,
  "3s": TvChartLayout.Layout3A,
  "3v": TvChartLayout.Layout3C,
  4: TvChartLayout.Layout4A,
  "4h": TvChartLayout.Layout4B,
  "4v": TvChartLayout.Layout4C,
  "4s": TvChartLayout.Layout4D,
  "5s": TvChartLayout.Layout5B,
  "5h": TvChartLayout.Layout5D,
  6: TvChartLayout.Layout6A,
  "6c": TvChartLayout.Layout6B,
  "6h": TvChartLayout.Layout6C,
  "7h": TvChartLayout.Layout7A,
  8: TvChartLayout.Layout8A,
  "8c": TvChartLayout.Layout8B,
  "8h": TvChartLayout.Layout8C,
};

export function getTvChartLayoutReverse(layout: LayoutType): TvChartLayout {
  return LAYOUT_MAP_REVERSE[layout] ?? TvChartLayout.Layout1A;
}

const ALIGNMENTS_MAP: Record<string, number> = {
  left: 0,
  center: 1,
  right: 2,
};

export function getTvChartLibraryAlignment(alignment: string): number {
  return ALIGNMENTS_MAP[alignment] ?? 0;
}

const RESOLUTION_FRAMES: Record<TvChartResolution, number> = {
  ["1s"]: 1e3,
  ["5s"]: 5e3,
  ["15s"]: 15e3,
  ["30s"]: 3e4,
  ["1m"]: 6e4,
  ["5m"]: 3e5,
  ["15m"]: 9e5,
  ["30m"]: 18e5,
  ["1h"]: 36e5,
  ["4h"]: 144e5,
  ["12h"]: 432e5,
  ["1d"]: 864e5,
};

export function getTvChartResolutionFrame(resolution: TvChartResolution): number {
  const frame = RESOLUTION_FRAMES[resolution];
  if (!frame) throw new Error(`Invalid interval: ${resolution}`);
  return frame;
}

export function getTvChartTickTimestamp(time: number, timeframe: number): number {
  const timeInMs = time.toString().length > 10 ? time : 1e3 * time;
  return Math.floor(timeInMs / timeframe) * timeframe;
}
