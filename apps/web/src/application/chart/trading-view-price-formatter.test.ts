import {
  TvChartPriceType,
  TvChartQuoteType,
  type LibrarySymbolInfo,
} from "@liberfi.io/ui-tradingview";
import { createTokenChartPriceFormatter } from "./trading-view-price-formatter";

function symbolInfo(priceType: TvChartPriceType, quote: TvChartQuoteType): LibrarySymbolInfo {
  return {
    name: "sol/mint/USD/market_cap",
    full_name: "sol/mint/USD/market_cap",
    description: "EX / USD / MCAP",
    type: "crypto",
    session: "24x7",
    exchange: "DEX",
    listed_exchange: "DEX",
    timezone: "Etc/UTC",
    format: "price",
    pricescale: 100,
    minmov: 1,
    priceType,
    quote,
  };
}

describe("createTokenChartPriceFormatter", () => {
  it("compacts USD market-cap OHLC values", () => {
    const formatter = createTokenChartPriceFormatter(
      symbolInfo(TvChartPriceType.MarketCap, TvChartQuoteType.USD),
      "default",
    );

    expect(formatter?.format(2_089_491_826.331852)).toBe("$2.08B");
  });

  it("compacts native market-cap OHLC values without a USD prefix", () => {
    const formatter = createTokenChartPriceFormatter(
      symbolInfo(TvChartPriceType.MarketCap, TvChartQuoteType.SOL),
      "default",
    );

    expect(formatter?.format(1_234_567)).toBe("1.23M");
  });

  it("keeps TradingView's built-in formatter for token prices", () => {
    expect(
      createTokenChartPriceFormatter(
        symbolInfo(TvChartPriceType.Price, TvChartQuoteType.USD),
        "default",
      ),
    ).toBeNull();
  });
});
