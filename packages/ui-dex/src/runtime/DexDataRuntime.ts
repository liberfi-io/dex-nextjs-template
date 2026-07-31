import { QueryClient } from "@tanstack/react-query";
import { Token, TokenCandle, TokenMarketData } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";
import { QueryKeys, UseTokenCandlesQueryParams, UseTokensQueryParams } from "@liberfi/react-dex";
import {
  ChainStreamDexDataAdapter,
  SubscribeTokenCandlesParams,
} from "./ChainStreamDexDataAdapter";

export interface DexDataScheduler {
  setInterval(callback: () => void, delay: number): unknown;
  clearInterval(handle: unknown): void;
  setTimeout(callback: () => void, delay: number): unknown;
  clearTimeout(handle: unknown): void;
}

export const browserDexDataScheduler: DexDataScheduler = {
  setInterval: (callback, delay) => globalThis.setInterval(callback, delay),
  clearInterval: (handle) => globalThis.clearInterval(handle as ReturnType<typeof setInterval>),
  setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export class DexDataRuntime {
  readonly queryClient: QueryClient;
  readonly adapter: ChainStreamDexDataAdapter;

  private readonly scheduler: DexDataScheduler;
  private readonly intervals = new Set<unknown>();
  private readonly timeouts = new Set<unknown>();
  private readonly candleSubscriptions = new Map<string, () => void>();
  private disposed = false;
  private quoteSymbol: string | null = null;

  constructor(
    queryClient: QueryClient,
    adapter: ChainStreamDexDataAdapter,
    scheduler: DexDataScheduler = browserDexDataScheduler,
  ) {
    this.queryClient = queryClient;
    this.adapter = adapter;
    this.scheduler = scheduler;
  }

  getToken(chain: Chain, tokenAddress: string): Promise<Token> {
    return this.queryClient.fetchQuery({
      queryKey: QueryKeys.token(chain, tokenAddress),
      queryFn: () => this.adapter.getToken(chain, tokenAddress),
    });
  }

  getTokens(params: UseTokensQueryParams): Promise<Token[]> {
    return this.queryClient.fetchQuery({
      queryKey: QueryKeys.tokens(params),
      queryFn: () => this.adapter.getTokens(params),
    });
  }

  getTokenMarketData(chain: Chain, tokenAddress: string): Promise<TokenMarketData | null> {
    return this.queryClient.fetchQuery({
      queryKey: QueryKeys.tokenMarketData(chain, tokenAddress),
      queryFn: () => this.adapter.getTokenMarketData(chain, tokenAddress),
    });
  }

  getTokenCandles(
    params: UseTokenCandlesQueryParams,
    options: { retry: number; retryDelay: number },
  ): Promise<TokenCandle[]> {
    return this.queryClient.fetchQuery({
      queryKey: QueryKeys.tokenCandles(params),
      queryFn: () => this.adapter.getTokenCandles(params),
      retry: options.retry,
      retryDelay: options.retryDelay,
    });
  }

  startQuotePricePolling(
    chain: Chain,
    tokenAddress: string,
    symbol: string,
    onPrice: (price: number) => void,
  ): void {
    if (this.disposed || this.quoteSymbol === symbol) return;
    this.stopQuotePricePolling();
    this.quoteSymbol = symbol;

    const fetchPrice = () => {
      if (this.disposed) return;
      this.adapter
        .getTokenMarketData(chain, tokenAddress)
        .then((marketData) => {
          this.queryClient.setQueryData(QueryKeys.tokenMarketData(chain, tokenAddress), marketData);
          if (marketData?.priceInUsd) onPrice(Number(marketData.priceInUsd));
        })
        .catch(() => undefined);
    };

    fetchPrice();
    const handle = this.scheduler.setInterval(fetchPrice, 12e3);
    this.intervals.add(handle);
  }

  stopQuotePricePolling(): void {
    for (const handle of this.intervals) this.scheduler.clearInterval(handle);
    this.intervals.clear();
    this.quoteSymbol = null;
  }

  schedule(callback: () => void, delay: number): unknown {
    if (this.disposed) return undefined;
    const handle = this.scheduler.setTimeout(() => {
      this.timeouts.delete(handle);
      if (!this.disposed) callback();
    }, delay);
    this.timeouts.add(handle);
    return handle;
  }

  cancelScheduled(handle: unknown): void {
    if (!this.timeouts.delete(handle)) return;
    this.scheduler.clearTimeout(handle);
  }

  subscribeTokenCandles(key: string, params: SubscribeTokenCandlesParams): void {
    if (this.disposed) return;
    this.unsubscribeTokenCandles(key);
    const subscription = this.adapter.subscribeTokenCandles(params);
    if (!subscription) return;
    let active = true;
    this.candleSubscriptions.set(key, () => {
      if (!active) return;
      active = false;
      subscription.unsubscribe();
    });
  }

  unsubscribeTokenCandles(key: string): void {
    const unsubscribe = this.candleSubscriptions.get(key);
    if (!unsubscribe) return;
    this.candleSubscriptions.delete(key);
    unsubscribe();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopQuotePricePolling();
    for (const handle of this.timeouts) this.scheduler.clearTimeout(handle);
    this.timeouts.clear();
    for (const unsubscribe of this.candleSubscriptions.values()) unsubscribe();
    this.candleSubscriptions.clear();
  }
}
