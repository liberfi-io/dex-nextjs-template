import type { IPerpetualsClient, KlineInterval } from "@liberfi.io/ui-perpetuals";
import {
  TradingViewDatafeedAdapter,
  getTvChartLibraryResolution,
  getTvChartResolutionReverse,
  type CandleSource,
  type LibrarySymbolInfo,
  type ResolutionString,
  type TradingViewCandle,
  type TradingViewHistoryRequest,
  type TradingViewLiveSubscribeRequest,
  type TvChartResolution,
} from "@liberfi.io/ui-tradingview";

export type PerpetualsChartClient = Pick<
  IPerpetualsClient,
  "getMarket" | "getKlines" | "connectWebSocket" | "subscribeCandles" | "unsubscribe"
>;

export const PERPETUALS_CHART_RESOLUTIONS: TvChartResolution[] = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
];

const KLINE_INTERVAL_MS: Record<KlineInterval, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "4h": 14_400_000,
  "1d": 86_400_000,
  "1w": 604_800_000,
};

const RESOLUTION_TO_KLINE: Record<string, KlineInterval> = {
  "1": "1m",
  "1m": "1m",
  "5": "5m",
  "5m": "5m",
  "15": "15m",
  "15m": "15m",
  "30": "30m",
  "30m": "30m",
  "60": "1h",
  "1h": "1h",
  "240": "4h",
  "4h": "4h",
  "1D": "1d",
  "1d": "1d",
};

export function toPerpetualsKlineInterval(resolution: string): KlineInterval {
  if (resolution in RESOLUTION_TO_KLINE) return RESOLUTION_TO_KLINE[resolution];
  return RESOLUTION_TO_KLINE[getTvChartResolutionReverse(resolution)] ?? "1m";
}

function klineToCandle(kline: {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}): TradingViewCandle {
  return {
    time: kline.timestamp,
    open: kline.open,
    high: kline.high,
    low: kline.low,
    close: kline.close,
    volume: kline.volume,
  };
}

export class PerpetualsCandleSource implements CandleSource {
  private subscriptions = new Map<string, string>();

  constructor(private readonly client: PerpetualsChartClient) {}

  async resolveSymbol(symbolName: string): Promise<LibrarySymbolInfo | null> {
    try {
      const coin = symbolName.split("-")[0] || symbolName;
      const symbol = symbolName.includes("-") ? symbolName : `${symbolName}-USDC`;
      const market = await this.client.getMarket(symbol);
      if (!market) return null;

      const price = market.price;
      const precision = price > 1000 ? 2 : price > 1 ? 4 : price > 0.001 ? 6 : 8;

      return {
        name: `${coin}/USDC`,
        description: `${coin} Perpetual`,
        full_name: symbolName,
        ticker: symbolName,
        type: "crypto",
        session: "24x7",
        exchange: "Hyperliquid",
        listed_exchange: "Hyperliquid",
        format: "price",
        pricescale: Math.pow(10, precision),
        minmov: 1,
        has_intraday: true,
        has_seconds: false,
        has_no_volume: false,
        supported_resolutions: PERPETUALS_CHART_RESOLUTIONS.map(
          getTvChartLibraryResolution,
        ) as ResolutionString[],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } catch (error) {
      console.error("PerpetualsCandleSource.resolveSymbol", error);
      return null;
    }
  }

  async getHistory(request: TradingViewHistoryRequest): Promise<TradingViewCandle[]> {
    try {
      const symbol = request.symbolInfo.ticker || request.symbolInfo.name;
      const interval = toPerpetualsKlineInterval(request.resolution);
      const intervalMs = KLINE_INTERVAL_MS[interval];
      const fromMs = request.periodParams.from * 1000;
      const toMs = request.periodParams.to * 1000;
      const windowEstimate = Math.ceil((toMs - fromMs) / intervalMs) + 1;
      const limit = Math.min(5000, Math.max(request.periodParams.countBack || windowEstimate, 1));

      const klines = await this.client.getKlines(symbol, interval, {
        from: fromMs,
        to: toMs,
        limit,
      });

      return klines
        .map(klineToCandle)
        .sort((a, b) => Number(a.time) - Number(b.time));
    } catch (error) {
      console.warn("PerpetualsCandleSource.getHistory", error);
      return [];
    }
  }

  subscribe(
    request: TradingViewLiveSubscribeRequest,
    onCandle: (candle: TradingViewCandle) => void,
  ): void {
    this.unsubscribe(request.listenerGuid);
    const symbol = request.symbolInfo.ticker || request.symbolInfo.name;
    const interval = toPerpetualsKlineInterval(request.resolution);

    this.client
      .connectWebSocket()
      .then(() => {
        const subId = this.client.subscribeCandles(symbol, interval, (candle) => {
          onCandle(klineToCandle(candle));
        });
        this.subscriptions.set(request.listenerGuid, subId);
      })
      .catch((err) => {
        console.error("PerpetualsCandleSource.subscribe WS connect failed", err);
      });
  }

  unsubscribe(listenerGuid: string): void {
    const subId = this.subscriptions.get(listenerGuid);
    if (!subId) return;
    try {
      this.client.unsubscribe(subId);
    } catch {
      // ignore
    }
    this.subscriptions.delete(listenerGuid);
  }

  destroy(): void {
    for (const guid of [...this.subscriptions.keys()]) {
      this.unsubscribe(guid);
    }
  }
}

export function createPerpetualsTradingViewDatafeed(
  client: PerpetualsChartClient,
): TradingViewDatafeedAdapter {
  const source = new PerpetualsCandleSource(client);
  return new TradingViewDatafeedAdapter(source, {
    resolveSymbol: (symbolName) => source.resolveSymbol(symbolName),
    onDestroy: () => source.destroy(),
  });
}
