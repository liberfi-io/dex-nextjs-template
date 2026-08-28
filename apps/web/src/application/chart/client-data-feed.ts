import {
  Chain,
  type IClient,
  type ISubscribeClient,
  type ISubscription,
  type Token,
  type TokenResolution,
} from "@liberfi.io/types";
import {
  ALL_TV_CHART_RESOLUTIONS,
  TradingViewDatafeedAdapter,
  getTvChartLibraryResolution,
  getTvChartResolutionReverse,
  parseSymbol,
  type Bar,
  type CandleSource,
  type LibrarySymbolInfo,
  type PeriodParams,
  type ResolutionString,
  type SubscribeBarsCallback,
  type TvChartResolution,
} from "@liberfi.io/ui-tradingview";
import { floorToResolution } from "./tick-floor";

function toClientResolution(resolution: TvChartResolution): TokenResolution {
  if (resolution === "1d") return "24h";
  return resolution as TokenResolution;
}

export class ClientDataFeedModule {
  private tokenCache = new Map<string, Token>();
  private subscriptions = new Map<string, ISubscription>();
  private lastBarTimeMs = new Map<string, number>();

  constructor(
    private readonly client: IClient,
    private readonly subscribeClient: ISubscribeClient,
    private readonly chain: Chain,
    private readonly tokenAddress: string,
  ) {}

  async onReady(_options?: {
    setting?: unknown;
    chartManager?: unknown;
    instance?: unknown;
  }): Promise<void> {
    void _options;
    try {
      const token = await this.client.getToken(this.chain, this.tokenAddress);
      this.tokenCache.set(this.tokenAddress, token);
    } catch {
      // Token prefetch is optional; resolveSymbol will retry.
    }
  }

  onDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
  }

  async resolveSymbol(symbolName: string): Promise<LibrarySymbolInfo | null> {
    const parsed = parseSymbol(symbolName);
    const chain = this.resolveChain(parsed.chain);
    const address = parsed.address || this.tokenAddress;
    let token = this.tokenCache.get(address);
    if (!token) {
      try {
        token = await this.client.getToken(chain, address);
        this.tokenCache.set(address, token);
      } catch {
        return null;
      }
    }
    const pricescale = token.decimals ? Math.pow(10, Math.min(token.decimals, 8)) : 1e8;
    return {
      name: symbolName,
      full_name: symbolName,
      ticker: symbolName,
      description: `${token.symbol} / USD`,
      type: "crypto",
      session: "24x7",
      exchange: "DEX",
      listed_exchange: "DEX",
      timezone: "Etc/UTC",
      format: "price",
      pricescale,
      minmov: 1,
      has_intraday: true,
      has_seconds: true,
      visible_plots_set: "ohlcv",
      supported_resolutions: ALL_TV_CHART_RESOLUTIONS.map(getTvChartLibraryResolution) as ResolutionString[],
    };
  }

  async getBars(
    _symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
  ): Promise<Bar[]> {
    const tvResolution = getTvChartResolutionReverse(resolution);
    const clientResolution = toClientResolution(tvResolution);
    try {
      const candles = await this.client.getTokenCandles(this.chain, this.tokenAddress, clientResolution, {
        after: new Date(periodParams.from * 1000),
        before: new Date(periodParams.to * 1000),
        limit: periodParams.countBack || 300,
      });
      const bars = candles.map((candle) => ({
        time: floorToResolution(candle.timestamp.getTime(), tvResolution),
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
        volume: parseFloat(candle.volume),
      }));
      if (bars.length > 0) {
        const key = `${this.tokenAddress}:${tvResolution}`;
        const next = Math.max(...bars.map((bar) => bar.time));
        const prev = this.lastBarTimeMs.get(key) ?? 0;
        if (next > prev) this.lastBarTimeMs.set(key, next);
      }
      return bars;
    } catch {
      return [];
    }
  }

  subscribeBars(
    _symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    _onResetCacheNeededCallback?: () => void,
  ): void {
    void _onResetCacheNeededCallback;
    this.unsubscribeBars(listenerGuid);
    const tvResolution = getTvChartResolutionReverse(resolution);
    const clientResolution = toClientResolution(tvResolution);
    const key = `${this.tokenAddress}:${tvResolution}`;
    const sub = this.subscribeClient.subscribeTokenCandles(
      this.chain,
      this.tokenAddress,
      clientResolution,
      (candles) => {
        const minTimeMs = this.lastBarTimeMs.get(key) ?? 0;
        for (const candle of candles) {
          const barTime = floorToResolution(candle.timestamp.getTime(), tvResolution);
          if (barTime < minTimeMs) continue;
          onTick({
            time: barTime,
            open: parseFloat(candle.open),
            high: parseFloat(candle.high),
            low: parseFloat(candle.low),
            close: parseFloat(candle.close),
            volume: parseFloat(candle.volume),
          });
        }
      },
    );
    this.subscriptions.set(listenerGuid, sub);
  }

  unsubscribeBars(listenerGuid: string): void {
    const sub = this.subscriptions.get(listenerGuid);
    if (!sub) return;
    sub.unsubscribe();
    this.subscriptions.delete(listenerGuid);
  }

  private resolveChain(chainStr: string): Chain {
    switch (chainStr.toLowerCase()) {
      case "ethereum":
      case "eth":
        return Chain.ETHEREUM;
      case "binance":
      case "bsc":
        return Chain.BINANCE;
      default:
        return Chain.SOLANA;
    }
  }
}

function asCandleSource(module: ClientDataFeedModule): CandleSource {
  return {
    getHistory: async (request) => module.getBars(request.symbolInfo, request.resolution, request.periodParams),
    subscribe: (request, onCandle) => {
      module.subscribeBars(
        request.symbolInfo,
        request.resolution,
        (bar) => onCandle(bar),
        request.listenerGuid,
      );
    },
    unsubscribe: (listenerGuid) => {
      module.unsubscribeBars(listenerGuid);
    },
  };
}

export function createTradingViewDatafeedFromModule(module: ClientDataFeedModule): TradingViewDatafeedAdapter {
  return new TradingViewDatafeedAdapter(asCandleSource(module), {
    resolveSymbol: (symbolName) => module.resolveSymbol(symbolName),
    onReady: () => module.onReady(),
    onDestroy: () => module.onDestroy(),
  });
}
