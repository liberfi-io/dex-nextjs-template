import {
  Chain,
  type IClient,
  type ISubscribeClient,
  type Token,
  type TokenCandle,
} from "@liberfi.io/types";
import { TvChartPriceType, TvChartQuoteType, stringifySymbol } from "@liberfi.io/ui-tradingview";
import { ClientDataFeedModule } from "./client-data-feed";
import { floorToResolution } from "./tick-floor";

describe("SDK candle tick floor used by the token chart", () => {
  const minuteOpen = 60_000 * 28_333_334;

  it("maps millisecond timestamps onto the 1m open", () => {
    expect(floorToResolution(minuteOpen + 7_287, "1m")).toBe(minuteOpen);
  });

  it("maps unix-second values after the caller converts to ms", () => {
    expect(floorToResolution((minuteOpen / 1000 + 7) * 1000, "1m")).toBe(minuteOpen);
  });
});

describe("ClientDataFeedModule chart modes", () => {
  const token = {
    chain: Chain.SOLANA,
    address: "mint",
    name: "Example",
    symbol: "EX",
    decimals: 6,
    marketData: { totalSupply: "1000" },
  } as Token;
  const candle = {
    timestamp: new Date("2026-08-31T12:00:00.000Z"),
    open: "2",
    high: "3",
    low: "1",
    close: "2.5",
    volume: "20",
  } as TokenCandle;

  function createModule() {
    const unsubscribe = jest.fn();
    const client = {
      getToken: jest.fn().mockResolvedValue(token),
      getTokenCandles: jest.fn().mockResolvedValue([candle]),
    } as unknown as IClient;
    const subscribeClient = {
      subscribeTokenCandles: jest.fn().mockReturnValue({ unsubscribe }),
    } as unknown as ISubscribeClient;
    return {
      client,
      module: new ClientDataFeedModule(client, subscribeClient, Chain.SOLANA, token.address),
      subscribeClient,
    };
  }

  it("requests native candles and converts price OHLC values to market cap", async () => {
    const { client, module } = createModule();
    const symbolName = stringifySymbol({
      chain: "sol",
      address: token.address,
      quote: TvChartQuoteType.SOL,
      priceType: TvChartPriceType.MarketCap,
    });
    const symbolInfo = await module.resolveSymbol(symbolName);

    expect(symbolInfo?.description).toBe("EX / SOL / MCAP");
    const bars = await module.getBars(symbolInfo!, "1", {
      from: 1_788_112_000,
      to: 1_788_198_400,
      countBack: 100,
      firstDataRequest: true,
    });

    expect(client.getTokenCandles).toHaveBeenCalledWith(
      Chain.SOLANA,
      token.address,
      "1m",
      expect.objectContaining({ priceType: "native" }),
    );
    expect(bars[0]).toEqual(
      expect.objectContaining({
        open: 2000,
        high: 3000,
        low: 1000,
        close: 2500,
        volume: 20,
      }),
    );
  });

  it("subscribes to the symbol-specific native candle channel", async () => {
    const { module, subscribeClient } = createModule();
    const symbolName = stringifySymbol({
      chain: "sol",
      address: token.address,
      quote: TvChartQuoteType.SOL,
      priceType: TvChartPriceType.Price,
    });
    const symbolInfo = await module.resolveSymbol(symbolName);

    module.subscribeBars(symbolInfo!, "1", jest.fn(), "listener");

    expect(subscribeClient.subscribeTokenCandles).toHaveBeenCalledWith(
      Chain.SOLANA,
      token.address,
      "1m",
      expect.any(Function),
      { priceType: "native" },
    );
  });
});
