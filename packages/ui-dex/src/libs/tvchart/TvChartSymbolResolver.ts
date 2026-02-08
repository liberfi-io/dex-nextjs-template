import { LibrarySymbolInfo } from "../../../../../apps/web/public/static/charting_library";
import { ITvChartDataFeedModule, ITvChartSymbolResolver } from "./types";

export class TvChartSymbolResolver implements ITvChartSymbolResolver {
  datafeed: ITvChartDataFeedModule;
  cache: Map<string, LibrarySymbolInfo>;
  pendingRequests: Map<string, Promise<LibrarySymbolInfo | null>>;

  constructor(datafeed: ITvChartDataFeedModule) {
    this.datafeed = datafeed;
    this.cache = new Map<string, LibrarySymbolInfo>();
    this.pendingRequests = new Map<string, Promise<LibrarySymbolInfo>>();
  }
  async resolveSymbolInfo(symbol: string): Promise<LibrarySymbolInfo | null> {
    return this.datafeed.resolveSymbol(symbol);
  }
  async resolveSymbolInfos(symbols: string[]): Promise<LibrarySymbolInfo[]> {
    const symbolsToResolve = symbols.filter(
      (symbol) => !this.cache.has(symbol) && !this.pendingRequests.has(symbol),
    );

    symbolsToResolve.forEach((symbol) => {
      const promise = this.resolveSymbolInfo(symbol);
      promise
        .then((symbolInfo) => {
          if (symbolInfo) {
            this.cache.set(symbol, symbolInfo);
          }
        })
        .finally(() => {
          this.pendingRequests.delete(symbol);
        });
      this.pendingRequests.set(symbol, promise);
    });

    await Promise.all(
      this.pendingRequests
        .entries()
        .filter(([symbol]) => symbols.includes(symbol))
        .map(([_, promise]) => promise),
    );

    return symbols
      .map((symbol) => this.cache.get(symbol) ?? null)
      .filter((symbol) => symbol !== null);
  }
  getSymbolInfo(symbol: string): LibrarySymbolInfo | null {
    this.resolveSymbolInfo(symbol).catch((error) => {
      console.error("TvChartSymbolResolver.getSymbolInfo", error);
    });
    if (this.cache.has(symbol)) {
      return this.cache.get(symbol)!;
    } else {
      return null;
    }
  }
}
