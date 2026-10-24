import { formatMCap, formatMCapInUsd } from "@liberfi.io/utils";
import {
  TvChartPriceType,
  TvChartQuoteType,
  type LibrarySymbolInfo,
} from "@liberfi.io/ui-tradingview";

type TokenChartPriceFormatterFactory = (
  symbolInfo: LibrarySymbolInfo | null,
  minTick: string,
) => { format: (price: number) => string } | null;

export const createTokenChartPriceFormatter: TokenChartPriceFormatterFactory = (symbolInfo) => {
  if (symbolInfo?.priceType !== TvChartPriceType.MarketCap) return null;

  return {
    format: symbolInfo.quote === TvChartQuoteType.USD ? formatMCapInUsd : formatMCap,
  };
};
