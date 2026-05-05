/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IPerpetualsClient, KlineInterval } from "@liberfi.io/ui-perpetuals";
import type {
  ITvChartDataFeedModule,
  TvChartLibraryWidgetBridge,
  TvChartManager,
  TvChartSettings,
} from "@liberfi/ui-dex/libs/tvchart";
import type {
  Bar,
  LibrarySymbolInfo,
  PeriodParams,
  ResolutionString,
  SubscribeBarsCallback,
  SymbolResolveExtension,
} from "../../../../public/static/charting_library";

const PERPETUALS_SUPPORTED_RESOLUTIONS: ResolutionString[] = [
  "1" as ResolutionString,
  "5" as ResolutionString,
  "15" as ResolutionString,
  "30" as ResolutionString,
  "60" as ResolutionString,
  "240" as ResolutionString,
  "1D" as ResolutionString,
];

const RESOLUTION_TO_KLINE_INTERVAL: Record<string, KlineInterval> = {
  "1": "1m",
  "5": "5m",
  "15": "15m",
  "30": "30m",
  "60": "1h",
  "240": "4h",
  "1D": "1d",
};

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

/**
 * Adapts HyperliquidPerpetualsClient as a TradingView datafeed module.
 * Pass the client via `setClient()` before chart initialization.
 */
export class PerpetualsTvChartDataFeedModule implements ITvChartDataFeedModule {
  private setting: TvChartSettings | null = null;
  private chartManager: TvChartManager | null = null;
  private instance: TvChartLibraryWidgetBridge | null = null;

  private candleSubscriptions = new Map<string, string>();

  private static _client: IPerpetualsClient | null = null;

  static setClient(client: IPerpetualsClient) {
    PerpetualsTvChartDataFeedModule._client = client;
  }

  private get client(): IPerpetualsClient {
    if (!PerpetualsTvChartDataFeedModule._client) {
      throw new Error("PerpetualsTvChartDataFeedModule: client not set. Call setClient() first.");
    }
    return PerpetualsTvChartDataFeedModule._client;
  }

  async onReady(options: {
    setting: TvChartSettings;
    chartManager: TvChartManager;
    instance: TvChartLibraryWidgetBridge;
  }): Promise<void> {
    this.setting = options.setting;
    this.chartManager = options.chartManager;
    this.instance = options.instance;
  }

  onDestroy(): void {
    for (const [, subId] of this.candleSubscriptions) {
      try {
        this.client.unsubscribe(subId);
      } catch {
        // ignore cleanup errors
      }
    }
    this.candleSubscriptions.clear();
    this.setting = null;
    this.chartManager = null;
    this.instance = null;
  }

  async resolveSymbol(
    symbolName: string,
    _extension?: SymbolResolveExtension,
  ): Promise<LibrarySymbolInfo | null> {
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
        symbol: symbolName,
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
        supported_resolutions: PERPETUALS_SUPPORTED_RESOLUTIONS,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as any,
      } as LibrarySymbolInfo;
    } catch (error) {
      console.error("PerpetualsTvChartDataFeedModule.resolveSymbol", error);
      return null;
    }
  }

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
  ): Promise<Bar[]> {
    try {
      const symbol = symbolInfo.ticker || symbolInfo.name;
      const interval = RESOLUTION_TO_KLINE_INTERVAL[resolution] || "1m";
      const intervalMs = KLINE_INTERVAL_MS[interval];

      // TradingView passes a window in seconds; convert once to ms epochs.
      const fromMs = periodParams.from * 1000;
      const toMs = periodParams.to * 1000;

      // Hyperliquid's candleSnapshot caps each response at ~5000 candles.
      // Prefer `countBack` (TV's authoritative bar-count hint) and fall
      // back to a window-derived estimate.
      const windowEstimate = Math.ceil((toMs - fromMs) / intervalMs) + 1;
      const limit = Math.min(
        5000,
        Math.max(periodParams.countBack || windowEstimate, 1),
      );

      // Forward the explicit time window to the SDK so the provider can
      // return historical candles for any pan, not just the latest N.
      const klines = await this.client.getKlines(symbol, interval, {
        from: fromMs,
        to: toMs,
        limit,
      });

      const bars: Bar[] = klines.map((k) => ({
        time: k.timestamp,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
        volume: k.volume,
      }));

      bars.sort((a, b) => a.time - b.time);
      return bars;
    } catch (error) {
      console.warn("PerpetualsTvChartDataFeedModule.getBars", error);
      return [];
    }
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    _onResetCacheNeededCallback: () => void,
  ): void {
    try {
      const symbol = symbolInfo.ticker || symbolInfo.name;
      const interval = RESOLUTION_TO_KLINE_INTERVAL[resolution] || "1m";

      this.client.connectWebSocket().then(() => {
        const subId = this.client.subscribeCandles(symbol, interval, (candle) => {
          const bar: Bar = {
            time: candle.timestamp,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
          };
          onTick(bar);
        });
        this.candleSubscriptions.set(listenerGuid, subId);
      }).catch((err) => {
        console.error("PerpetualsTvChartDataFeedModule.subscribeBars WS connect failed", err);
      });
    } catch (error) {
      console.error("PerpetualsTvChartDataFeedModule.subscribeBars", error);
    }
  }

  unsubscribeBars(listenerGuid: string): void {
    const subId = this.candleSubscriptions.get(listenerGuid);
    if (subId) {
      try {
        this.client.unsubscribe(subId);
      } catch {
        // ignore
      }
      this.candleSubscriptions.delete(listenerGuid);
    }
  }
}
