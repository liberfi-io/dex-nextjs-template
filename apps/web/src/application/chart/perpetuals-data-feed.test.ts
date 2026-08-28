import {
  PerpetualsCandleSource,
  createPerpetualsTradingViewDatafeed,
  toPerpetualsKlineInterval,
  type PerpetualsChartClient,
} from "./perpetuals-data-feed";
import type { LibrarySymbolInfo, PeriodParams, ResolutionString } from "@liberfi.io/ui-tradingview";

function fakeClient(overrides: Partial<PerpetualsChartClient> = {}): PerpetualsChartClient {
  return {
    getMarket: jest.fn().mockResolvedValue({
      symbol: "BTC-USDC",
      price: 64000,
      change24h: 0,
      volume24h: 0,
      fundingRate: 0,
      openInterest: 0,
      markPrice: 64000,
    }),
    getKlines: jest.fn().mockResolvedValue([
      {
        symbol: "BTC-USDC",
        open: 1,
        high: 3,
        low: 0.5,
        close: 2,
        volume: 10,
        timestamp: 1_700_000_000_000,
        closeTimestamp: 1_700_000_060_000,
      },
    ]),
    connectWebSocket: jest.fn().mockResolvedValue(undefined),
    subscribeCandles: jest.fn().mockReturnValue("sub-1"),
    unsubscribe: jest.fn(),
    ...overrides,
  };
}

const symbolInfo = {
  name: "BTC/USDC",
  ticker: "BTC-USDC",
} as LibrarySymbolInfo;

const period = {
  from: 1_700_000_000,
  to: 1_700_000_300,
  countBack: 50,
  firstDataRequest: true,
} as PeriodParams;

describe("toPerpetualsKlineInterval", () => {
  it("maps TradingView library resolutions onto Hyperliquid intervals", () => {
    expect(toPerpetualsKlineInterval("1")).toBe("1m");
    expect(toPerpetualsKlineInterval("60")).toBe("1h");
    expect(toPerpetualsKlineInterval("1D")).toBe("1d");
    expect(toPerpetualsKlineInterval("15m")).toBe("15m");
  });
});

describe("PerpetualsCandleSource", () => {
  it("resolves a Hyperliquid market into a library symbol", async () => {
    const client = fakeClient();
    const source = new PerpetualsCandleSource(client);
    const info = await source.resolveSymbol("BTC-USDC");

    expect(client.getMarket).toHaveBeenCalledWith("BTC-USDC");
    expect(info?.ticker).toBe("BTC-USDC");
    expect(info?.exchange).toBe("Hyperliquid");
    expect(info?.pricescale).toBe(100);
  });

  it("appends -USDC when the ticker has no quote", async () => {
    const client = fakeClient();
    const source = new PerpetualsCandleSource(client);
    await source.resolveSymbol("ETH");
    expect(client.getMarket).toHaveBeenCalledWith("ETH-USDC");
  });

  it("forwards the TradingView window to getKlines", async () => {
    const client = fakeClient();
    const source = new PerpetualsCandleSource(client);
    const candles = await source.getHistory({
      symbolInfo,
      resolution: "1" as ResolutionString,
      periodParams: period,
    });

    expect(client.getKlines).toHaveBeenCalledWith("BTC-USDC", "1m", {
      from: period.from * 1000,
      to: period.to * 1000,
      limit: 50,
    });
    expect(candles).toEqual([
      {
        time: 1_700_000_000_000,
        open: 1,
        high: 3,
        low: 0.5,
        close: 2,
        volume: 10,
      },
    ]);
  });

  it("subscribes after the websocket connects and unsubscribes by guid", async () => {
    const client = fakeClient();
    const source = new PerpetualsCandleSource(client);
    const onCandle = jest.fn();

    source.subscribe(
      {
        symbolInfo,
        resolution: "1" as ResolutionString,
        listenerGuid: "guid-1",
        onResetCacheNeededCallback: () => undefined,
      },
      onCandle,
    );

    await Promise.resolve();
    expect(client.connectWebSocket).toHaveBeenCalledTimes(1);
    expect(client.subscribeCandles).toHaveBeenCalledWith(
      "BTC-USDC",
      "1m",
      expect.any(Function),
    );

    source.unsubscribe("guid-1");
    expect(client.unsubscribe).toHaveBeenCalledWith("sub-1");
  });
});

describe("createPerpetualsTradingViewDatafeed", () => {
  it("wraps the Hyperliquid source in the SDK adapter", async () => {
    const client = fakeClient();
    const adapter = createPerpetualsTradingViewDatafeed(client);
    const info = await adapter.resolveSymbol("BTC-USDC");
    expect(info?.ticker).toBe("BTC-USDC");
    expect(client.getMarket).toHaveBeenCalled();
  });
});
