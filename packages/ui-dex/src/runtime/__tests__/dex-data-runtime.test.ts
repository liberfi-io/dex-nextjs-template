import { QueryClient } from "@tanstack/react-query";
import { ChainStreamClient, Token, TokenCandle, TokenMarketData } from "@chainstream-io/sdk";
import { Unsubscribable, WsCandle } from "@chainstream-io/sdk/stream";
import { Chain } from "@liberfi/core";
import { render } from "@testing-library/react";
import { createElement, useEffect } from "react";
import {
  ChainStreamDexDataAdapter,
  createChainStreamDexDataAdapter,
} from "../ChainStreamDexDataAdapter";
import { DexDataRuntime, DexDataScheduler } from "../DexDataRuntime";
import { DexDataRuntimeProvider, useDexDataRuntime } from "../DexDataRuntimeProvider";
import { TvChartDataFeedModule } from "../../components/tvchart/TvChartDataFeedModule";
import { TvChartPriceType, TvChartQuoteType } from "../../libs/tvchart";

function createSourceFake() {
  const unsubscribe = jest.fn();
  const token = {
    getToken: jest.fn().mockResolvedValue({ address: "token-a" } as Token),
    getTokens: jest.fn().mockResolvedValue([] as Token[]),
    getMarketData: jest.fn().mockResolvedValue({ priceInUsd: "1" } as TokenMarketData),
    getCandles: jest.fn().mockResolvedValue([] as TokenCandle[]),
  };
  const stream = {
    subscribeTokenCandles: jest.fn().mockReturnValue({ unsubscribe } as Unsubscribable),
  };
  return {
    client: { token, stream } as unknown as ChainStreamClient,
    token,
    stream,
    unsubscribe,
  };
}

function createSchedulerFake() {
  const intervals = new Set<() => void>();
  const timeouts = new Set<() => void>();
  const scheduler: DexDataScheduler = {
    setInterval(callback) {
      intervals.add(callback);
      return callback;
    },
    clearInterval(handle) {
      intervals.delete(handle as () => void);
    },
    setTimeout(callback) {
      timeouts.add(callback);
      return callback;
    },
    clearTimeout(handle) {
      timeouts.delete(handle as () => void);
    },
  };
  return {
    scheduler,
    flushIntervals: () => [...intervals].forEach((callback) => callback()),
    flushTimeouts: () => [...timeouts].forEach((callback) => callback()),
    intervalCount: () => intervals.size,
    timeoutCount: () => timeouts.size,
  };
}

describe("ChainStreamDexDataAdapter", () => {
  it("delegates all five frozen methods to the injected ChainStream client", async () => {
    const source = createSourceFake();
    const adapter = createChainStreamDexDataAdapter(source.client);
    const callback = jest.fn<void, [WsCandle]>();

    await adapter.getToken(Chain.SOLANA, "token-a");
    await adapter.getTokens({ chain: Chain.SOLANA, tokenAddresses: ["token-b", "token-a"] });
    await adapter.getTokenMarketData(Chain.SOLANA, "token-a");
    await adapter.getTokenCandles({
      chain: Chain.SOLANA,
      tokenAddress: "token-a",
      resolution: "1m",
      from: 10,
      to: 20,
      limit: 50,
    });
    const subscription = adapter.subscribeTokenCandles({
      chain: Chain.SOLANA,
      tokenAddress: "token-a",
      resolution: "1m",
      callback,
    });

    expect(source.token.getToken).toHaveBeenCalledTimes(1);
    expect(source.token.getTokens).toHaveBeenCalledWith("sol", {
      tokenAddresses: "token-a,token-b",
    });
    expect(source.token.getMarketData).toHaveBeenCalledTimes(1);
    expect(source.token.getCandles).toHaveBeenCalledWith("sol", "token-a", {
      from: 10,
      to: 20,
      limit: 50,
      resolution: "1m",
    });
    expect(source.stream.subscribeTokenCandles).toHaveBeenCalledWith(
      expect.objectContaining({ callback }),
    );
    expect(subscription).toBeDefined();
  });

  it("preserves producer errors", async () => {
    const source = createSourceFake();
    const failure = new Error("upstream failed");
    source.token.getToken.mockRejectedValueOnce(failure);

    await expect(
      createChainStreamDexDataAdapter(source.client).getToken(Chain.SOLANA, "token-a"),
    ).rejects.toBe(failure);
  });
});

describe("DexDataRuntime", () => {
  it("owns quote polling and stops all work after dispose", async () => {
    const source = createSourceFake();
    const scheduler = createSchedulerFake();
    const runtime = new DexDataRuntime(
      new QueryClient(),
      createChainStreamDexDataAdapter(source.client),
      scheduler.scheduler,
    );

    runtime.startQuotePricePolling(Chain.SOLANA, "token-a", "SOL", jest.fn());
    await Promise.resolve();
    expect(source.token.getMarketData).toHaveBeenCalledTimes(1);
    expect(scheduler.intervalCount()).toBe(1);

    scheduler.flushIntervals();
    await Promise.resolve();
    expect(source.token.getMarketData).toHaveBeenCalledTimes(2);

    runtime.dispose();
    scheduler.flushIntervals();
    await Promise.resolve();
    expect(source.token.getMarketData).toHaveBeenCalledTimes(2);
    expect(scheduler.intervalCount()).toBe(0);
  });

  it("unsubscribes a candle handle exactly once", () => {
    const source = createSourceFake();
    const runtime = new DexDataRuntime(
      new QueryClient(),
      createChainStreamDexDataAdapter(source.client),
      createSchedulerFake().scheduler,
    );

    runtime.subscribeTokenCandles("chart-a", {
      chain: Chain.SOLANA,
      tokenAddress: "token-a",
      resolution: "1m",
      callback: jest.fn(),
    });
    runtime.unsubscribeTokenCandles("chart-a");
    runtime.unsubscribeTokenCandles("chart-a");
    runtime.dispose();

    expect(source.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("keeps clients, query caches and scheduled work instance-scoped", async () => {
    const firstSource = createSourceFake();
    const secondSource = createSourceFake();
    const firstScheduler = createSchedulerFake();
    const secondScheduler = createSchedulerFake();
    const first = new DexDataRuntime(
      new QueryClient(),
      createChainStreamDexDataAdapter(firstSource.client),
      firstScheduler.scheduler,
    );
    const second = new DexDataRuntime(
      new QueryClient(),
      createChainStreamDexDataAdapter(secondSource.client),
      secondScheduler.scheduler,
    );

    first.startQuotePricePolling(Chain.SOLANA, "token-a", "SOL", jest.fn());
    await Promise.resolve();

    expect(firstSource.token.getMarketData).toHaveBeenCalledTimes(1);
    expect(secondSource.token.getMarketData).not.toHaveBeenCalled();
    expect(first.queryClient).not.toBe(second.queryClient);
    expect(firstScheduler.intervalCount()).toBe(1);
    expect(secondScheduler.intervalCount()).toBe(0);
  });
});

describe("DexDataRuntimeProvider", () => {
  it("disposes active subscriptions exactly once on unmount", () => {
    const unsubscribe = jest.fn();
    const adapter: ChainStreamDexDataAdapter = {
      getToken: jest.fn(),
      getTokens: jest.fn(),
      getTokenMarketData: jest.fn(),
      getTokenCandles: jest.fn(),
      subscribeTokenCandles: jest.fn().mockReturnValue({ unsubscribe }),
    };
    const Consumer = () => {
      const runtime = useDexDataRuntime();
      useEffect(() => {
        runtime.subscribeTokenCandles("chart-a", {
          chain: Chain.SOLANA,
          tokenAddress: "token-a",
          resolution: "1m",
          callback: jest.fn(),
        });
      }, [runtime]);
      return null;
    };

    const { unmount } = render(
      createElement(
        DexDataRuntimeProvider,
        {
          queryClient: new QueryClient(),
          adapter,
          scheduler: createSchedulerFake().scheduler,
        },
        createElement(Consumer),
      ),
    );
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

describe("TradingView data runtime contract", () => {
  it("preserves history parameters and the single-candle callback shape", async () => {
    const source = createSourceFake();
    let streamCallback: ((candle: WsCandle) => void) | undefined;
    source.stream.subscribeTokenCandles.mockImplementation((params) => {
      streamCallback = params.callback;
      return { unsubscribe: source.unsubscribe } as Unsubscribable;
    });
    const runtime = new DexDataRuntime(
      new QueryClient(),
      createChainStreamDexDataAdapter(source.client),
      createSchedulerFake().scheduler,
    );
    const datafeed = new TvChartDataFeedModule(runtime);
    const symbolInfo = {
      token: {
        chain: "sol",
        address: "token-a",
        symbol: "TOKEN",
        marketData: { totalSupply: "100" },
      } as Token,
      quote: TvChartQuoteType.USD,
      priceType: TvChartPriceType.Price,
    };

    await datafeed.getHistoryBars(
      symbolInfo as never,
      "1" as never,
      { from: 60, to: 120, firstDataRequest: false } as never,
      { retryCount: 0, retryDelay: 0 },
    );
    expect(source.token.getCandles).toHaveBeenCalledWith("sol", "token-a", {
      from: 0,
      to: 120_000,
      limit: 2,
      resolution: "1m",
    });

    const onTick = jest.fn();
    datafeed.subscribeBars(symbolInfo as never, "1" as never, onTick, "chart-a", jest.fn());
    streamCallback?.({
      time: 120_000,
      open: "1",
      high: "2",
      low: "0.5",
      close: "1.5",
      volume: "10",
    } as WsCandle);

    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick).toHaveBeenCalledWith(expect.objectContaining({ time: 120_000, close: 1.5 }));
  });
});
