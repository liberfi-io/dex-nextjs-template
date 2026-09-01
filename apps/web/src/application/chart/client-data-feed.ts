import {
  Chain,
  type GetTokenCandlesOptions,
  type IClient,
  type ISubscribeClient,
  type ISubscription,
  type Token,
  type TokenCandle,
  type TokenResolution,
} from "@liberfi.io/types";
import {
  ALL_TV_CHART_RESOLUTIONS,
  TradingViewDatafeedAdapter,
  TvChartPriceType,
  TvChartQuoteType,
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
  type TvChartSymbolInfo,
} from "@liberfi.io/ui-tradingview";
import { floorToResolution } from "./tick-floor";

function toClientResolution(resolution: TvChartResolution): TokenResolution {
  if (resolution === "1d") return "24h";
  return resolution as TokenResolution;
}

interface ChartSymbolSelection {
  chain: Chain;
  address: string;
  quote: TvChartQuoteType;
  priceType: TvChartPriceType;
}

type CandlePriceOptions = {
  priceType: "usd" | "native";
};

type CandleClient = Omit<IClient, "getTokenCandles"> & {
  getTokenCandles(
    chain: Chain,
    address: string,
    resolution: TokenResolution,
    options: GetTokenCandlesOptions & CandlePriceOptions,
  ): Promise<TokenCandle[]>;
};

type CandleSubscribeClient = Omit<ISubscribeClient, "subscribeTokenCandles"> & {
  subscribeTokenCandles(
    chain: Chain,
    address: string,
    resolution: TokenResolution,
    callback: (candles: TokenCandle[]) => void,
    options?: CandlePriceOptions,
  ): ISubscription;
};

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
      this.tokenCache.set(this.tokenKey(this.chain, this.tokenAddress), token);
    } catch {
      // Token prefetch is optional; resolveSymbol will retry.
    }
  }

  onDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
  }

  async resolveSymbol(symbolName: string): Promise<LibrarySymbolInfo | null> {
    const { address, chain, priceType, quote } = this.resolveChartSymbol(symbolName);
    let token: Token;
    try {
      token = await this.getToken(chain, address);
    } catch {
      return null;
    }
    const pricescale =
      priceType === TvChartPriceType.MarketCap
        ? 100
        : token.decimals
          ? Math.pow(10, Math.min(token.decimals, 8))
          : 1e8;
    const modeSuffix = priceType === TvChartPriceType.MarketCap ? " / MCAP" : "";
    const symbolInfo: TvChartSymbolInfo = {
      name: symbolName,
      symbol: token.symbol,
      full_name: symbolName,
      ticker: symbolName,
      address,
      priceType,
      quote,
      precision: pricescale,
      description: `${token.symbol} / ${quote}${modeSuffix}`,
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
      supported_resolutions: ALL_TV_CHART_RESOLUTIONS.map(
        getTvChartLibraryResolution,
      ) as ResolutionString[],
    };
    return symbolInfo;
  }

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
  ): Promise<Bar[]> {
    const tvResolution = getTvChartResolutionReverse(resolution);
    const clientResolution = toClientResolution(tvResolution);
    const symbol = this.resolveChartSymbol(symbolInfo.ticker ?? symbolInfo.name);
    try {
      const candleClient = this.client as CandleClient;
      const candles = await candleClient.getTokenCandles(
        symbol.chain,
        symbol.address,
        clientResolution,
        {
          after: new Date(periodParams.from * 1000),
          before: new Date(periodParams.to * 1000),
          limit: periodParams.countBack || 300,
          priceType: this.toCandlePriceType(symbol.quote),
        },
      );
      const multiplier = await this.getPriceMultiplier(symbol);
      const bars = candles.map((candle) => this.toBar(candle, tvResolution, multiplier));
      if (bars.length > 0) {
        const key = this.candleKey(symbol, tvResolution);
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
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    _onResetCacheNeededCallback?: () => void,
  ): void {
    void _onResetCacheNeededCallback;
    this.unsubscribeBars(listenerGuid);
    const tvResolution = getTvChartResolutionReverse(resolution);
    const clientResolution = toClientResolution(tvResolution);
    const symbol = this.resolveChartSymbol(symbolInfo.ticker ?? symbolInfo.name);
    const key = this.candleKey(symbol, tvResolution);
    const multiplier = this.getCachedPriceMultiplier(symbol);
    const candleSubscribeClient = this.subscribeClient as CandleSubscribeClient;
    const sub = candleSubscribeClient.subscribeTokenCandles(
      symbol.chain,
      symbol.address,
      clientResolution,
      (candles) => {
        const minTimeMs = this.lastBarTimeMs.get(key) ?? 0;
        for (const candle of candles) {
          const barTime = floorToResolution(candle.timestamp.getTime(), tvResolution);
          if (barTime < minTimeMs) continue;
          onTick(this.toBar(candle, tvResolution, multiplier));
        }
      },
      { priceType: this.toCandlePriceType(symbol.quote) },
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
      case "1":
      case "ethereum":
      case "eth":
        return Chain.ETHEREUM;
      case "56":
      case "binance":
      case "bsc":
        return Chain.BINANCE;
      case "900900900":
      case "solana":
      case "sol":
        return Chain.SOLANA;
      default:
        return this.chain;
    }
  }

  private resolveChartSymbol(symbolName: string): ChartSymbolSelection {
    const parsed = parseSymbol(symbolName);
    return {
      chain: parsed.chain ? this.resolveChain(parsed.chain) : this.chain,
      address: parsed.address || this.tokenAddress,
      quote: parsed.quote ?? TvChartQuoteType.USD,
      priceType: parsed.priceType ?? TvChartPriceType.Price,
    };
  }

  private tokenKey(chain: Chain, address: string): string {
    return `${chain}:${address}`;
  }

  private async getToken(chain: Chain, address: string): Promise<Token> {
    const key = this.tokenKey(chain, address);
    const cached = this.tokenCache.get(key);
    if (cached) return cached;
    const token = await this.client.getToken(chain, address);
    this.tokenCache.set(key, token);
    return token;
  }

  private toCandlePriceType(quote: TvChartQuoteType): "usd" | "native" {
    return quote === TvChartQuoteType.USD ? "usd" : "native";
  }

  private async getPriceMultiplier(symbol: ChartSymbolSelection): Promise<number> {
    if (symbol.priceType !== TvChartPriceType.MarketCap) return 1;
    const token = await this.getToken(symbol.chain, symbol.address);
    return this.getSupplyMultiplier(token);
  }

  private getCachedPriceMultiplier(symbol: ChartSymbolSelection): number {
    if (symbol.priceType !== TvChartPriceType.MarketCap) return 1;
    const token = this.tokenCache.get(this.tokenKey(symbol.chain, symbol.address));
    return token ? this.getSupplyMultiplier(token) : 1;
  }

  private getSupplyMultiplier(token: Token): number {
    const supply = Number(token.marketData?.totalSupply);
    return Number.isFinite(supply) && supply > 0 ? supply : 1;
  }

  private candleKey(symbol: ChartSymbolSelection, resolution: TvChartResolution): string {
    return `${symbol.chain}:${symbol.address}:${symbol.quote}:${symbol.priceType}:${resolution}`;
  }

  private toBar(candle: TokenCandle, resolution: TvChartResolution, multiplier: number): Bar {
    return {
      time: floorToResolution(candle.timestamp.getTime(), resolution),
      open: parseFloat(candle.open) * multiplier,
      high: parseFloat(candle.high) * multiplier,
      low: parseFloat(candle.low) * multiplier,
      close: parseFloat(candle.close) * multiplier,
      volume: parseFloat(candle.volume),
    };
  }
}

function asCandleSource(module: ClientDataFeedModule): CandleSource {
  return {
    getHistory: async (request) =>
      module.getBars(request.symbolInfo, request.resolution, request.periodParams),
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

export function createTradingViewDatafeedFromModule(
  module: ClientDataFeedModule,
): TradingViewDatafeedAdapter {
  return new TradingViewDatafeedAdapter(asCandleSource(module), {
    resolveSymbol: (symbolName) => module.resolveSymbol(symbolName),
    onReady: () => module.onReady(),
    onDestroy: () => module.onDestroy(),
  });
}
