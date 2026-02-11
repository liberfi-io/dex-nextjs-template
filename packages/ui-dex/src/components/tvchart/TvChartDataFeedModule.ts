/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculateDecimalPrecision } from "@/libs";
import {
  ALL_TV_CHART_RESOLUTIONS,
  getTvChartLibraryResolution,
  getTvChartResolutionFrame,
  getTvChartResolutionReverse,
  getTvChartTickTimestamp,
  ITvChartDataFeedModule,
  parseSymbol,
  stringifySymbol,
  TvChartLibraryWidgetBridge,
  TvChartManager,
  TvChartPriceType,
  TvChartQuoteType,
  TvChartSettings,
  TvChartSymbolInfo,
} from "@/libs/tvchart";
import { quotePricesSubject, updateTokenLatestPrice } from "@/states";
import { Candle, Resolution, Token } from "@chainstream-io/sdk";
import { Unsubscribable, WsCandle } from "@chainstream-io/sdk/stream";
import { CONFIG, parseChainId } from "@liberfi/core";
import { chainParam, fetchToken, fetchTokenCandles, QueryKeys } from "@liberfi/react-dex";
import { dexClientSubject, queryClientSubject } from "@liberfi/ui-base";
import BigNumber from "bignumber.js";
import { minBy, sortBy, uniqBy } from "lodash-es";
import { DateTime } from "luxon";
import { BehaviorSubject } from "rxjs";
import {
  Bar,
  IChartWidgetApi,
  LibrarySymbolInfo,
  PeriodParams,
  QuotesCallback,
  QuotesErrorCallback,
  ResolutionString,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
  SymbolResolveExtension,
  Timezone,
} from "../../../../../apps/web/public/static/charting_library";

export class TvChartDataFeedModule implements ITvChartDataFeedModule {
  debug: boolean;
  setting: TvChartSettings | null;
  chartManager: TvChartManager | null;
  instance: TvChartLibraryWidgetBridge | null;
  ready: boolean;

  orderbookQuotesMap: Record<string, any>;
  barSubscriptionMap: Map<string, Unsubscribable>;
  symbolMap: Map<string, TvChartSymbolInfo>;
  symbolMapSubject: BehaviorSubject<Map<string, TvChartSymbolInfo>> | null;

  isLoadMarkData: {
    symbol: string;
    interval: string;
    isLoad: boolean;
  };

  constructor() {
    this.debug = true;
    this.setting = null;
    this.chartManager = null;
    this.instance = null;
    this.ready = false;

    this.orderbookQuotesMap = {};
    this.barSubscriptionMap = new Map<string, Unsubscribable>();
    this.symbolMap = new Map<string, TvChartSymbolInfo>();
    this.symbolMapSubject = new BehaviorSubject(this.symbolMap);

    this.isLoadMarkData = {
      symbol: "",
      interval: "",
      isLoad: false,
    };
  }

  setSymbolMap(symbol: string, symbolInfo: TvChartSymbolInfo) {
    this.symbolMap.set(symbol, symbolInfo);
    this.symbolMapSubject?.next(this.symbolMap);
  }

  deleteSymbolMap(symbol: string) {
    this.symbolMap.delete(symbol);
    this.symbolMapSubject?.next(this.symbolMap);
  }

  async onReady(options: {
    setting: TvChartSettings;
    chartManager: TvChartManager;
    instance: TvChartLibraryWidgetBridge;
  }): Promise<void> {
    const { setting, chartManager, instance } = options;
    this.setting = setting;
    this.chartManager = chartManager;
    this.instance = instance;
    this.ready = true;
  }

  onDestroy() {
    this.barSubscriptionMap.forEach((unsub) => {
      unsub.unsubscribe();
    });
    this.barSubscriptionMap.clear();

    Object.entries(this.orderbookQuotesMap).forEach(
      ([listenerGUID, { tickerSubscription, ...rest }]) => {
        tickerSubscription?.unsubscribe();

        Object.values(rest).forEach((e: any) => {
          e.subscription?.unsubscribe();
        });
        delete this.orderbookQuotesMap[listenerGUID];
      },
    );

    this.symbolMapSubject?.complete();
    this.symbolMapSubject = null;
    this.ready = false;
  }

  async resolveSymbol(
    symbolName: string,
    _extension?: SymbolResolveExtension,
  ): Promise<LibrarySymbolInfo | null> {
    const { chain, address, quote, priceType } = parseSymbol(symbolName);

    try {
      const dexClient = dexClientSubject.value;
      if (!dexClient) throw new Error("DexClient is not ready");

      const queryClient = queryClientSubject.value;
      if (!queryClient) throw new Error("QueryClient is not ready");

      const chainId = parseChainId(chain);
      if (!chainId) throw new Error(`Unsupported chain slug ${chain}`);

      // 基于 queryClient 进行查询，可以利用其缓存机制
      const token = await queryClient.fetchQuery({
        queryKey: QueryKeys.token(chainId, address),
        queryFn: () => fetchToken(dexClient, chainId, address),
      });
      return token ? tokenSymbolInfo(token, quote, priceType) : null;
    } catch (error) {
      console.error("TvChartDataFeedModule.resolveSymbol", error);
      return null;
    }
  }

  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    _onResult: SearchSymbolsCallback,
  ) {
    if (this.debug) {
      console.debug("TvChartDataFeedModule.searchSymbols", userInput, exchange, symbolType);
    }
  }

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
  ): Promise<Bar[]> {
    try {
      const bars = await this.getHistoryBars(symbolInfo, resolution, periodParams);

      if (periodParams.firstDataRequest && bars.length > 0) {
        // update token latest price based on the last bar
        const lastBar = bars[bars.length - 1];

        const { token, quote, priceType } = symbolInfo as TvChartSymbolInfo;
        const { chain, address, marketData } = token;
        const { totalSupply } = marketData;
        const chainId = parseChainId(chain);
        if (!chainId) throw new Error(`Unsupported chain slug ${token.chain}`);

        let latestPrice = lastBar.close;
        if (quote !== TvChartQuoteType.USD) {
          const quotePriceInfo = quotePricesSubject.value.get(quote);
          if (quotePriceInfo) {
            latestPrice = new BigNumber(latestPrice).times(quotePriceInfo.price).toNumber();
          }
        }

        if (priceType === TvChartPriceType.MarketCap) {
          latestPrice = new BigNumber(latestPrice).div(totalSupply).toNumber();
        }

        updateTokenLatestPrice(chainId, address, latestPrice);
      }

      return bars;
    } catch (e) {
      console.warn("TvChartDataFeedModule.getBars", e);
      return [];
    }
  }
  async getHistoryBars(
    symbolInfo: LibrarySymbolInfo,
    libraryChartResolution: ResolutionString,
    periodParams: PeriodParams,
    options: { retryCount: number; retryDelay: number } = {
      retryCount: 3,
      retryDelay: 3e3,
    },
  ) {
    const dexClient = dexClientSubject.value;
    if (!dexClient) throw new Error("DexClient is not ready");

    const queryClient = queryClientSubject.value;
    if (!queryClient) throw new Error("QueryClient is not ready");

    const { token, priceType, quote } = symbolInfo as TvChartSymbolInfo;
    const chain = token.chain;
    const chainId = parseChainId(chain);
    const address = token.address;
    if (!chainId) throw new Error("Invalid chain");

    const resolution = getTvChartResolutionReverse(libraryChartResolution);
    const timeframe = getTvChartResolutionFrame(resolution);

    // 初次查询秒级 K 线时，考虑到调用接口也需要耗时，多往前查 1s，确保查询参数中的结束时间一定是最新的
    const extraTime = resolution === "1s" && periodParams.firstDataRequest ? timeframe : 0;

    // 查询范围的时间
    const toTimestamp = getTvChartTickTimestamp(periodParams.to, timeframe) + extraTime;
    const fromTimestamp = getTvChartTickTimestamp(periodParams.from, timeframe);

    // 需要展示的 K 线数量
    const ticks = (toTimestamp - fromTimestamp) / timeframe + 1;

    let limit = Math.min(200, ticks);
    let timestamp = toTimestamp;
    let results: Candle[] = [];

    while (true) {
      try {
        const candles = await queryClient.fetchQuery({
          queryKey: QueryKeys.tokenCandles({
            chain: chainId,
            tokenAddress: address,
            resolution: resolution as Resolution,
            from: 0, // 结果是从 to 倒序的，通过 limit 限制查询数量，因此 fromTimestamp 直接传 0 即可
            to: timestamp,
            limit,
          }),
          queryFn: () =>
            fetchTokenCandles(dexClient, {
              chain: chainId,
              tokenAddress: address,
              resolution: resolution as Resolution,
              from: 0,
              to: timestamp,
              limit,
            }),
          retry: options.retryCount,
          retryDelay: options.retryDelay,
        });

        const minTime = candles.length > 0 ? minBy(candles, "time")!.time : 0;
        results = uniqBy([...results, ...candles], "time");

        if (candles.length < limit) {
          // 没有更多数据了
          break;
        }

        if (minTime <= fromTimestamp) {
          // 超过时间范围了
          break;
        }

        if (results.length >= ticks) {
          // 数量已经足够了
          break;
        }

        // 下一页
        timestamp = minTime - timeframe;
        limit = Math.min(200, ticks - results.length);
      } catch (error) {
        console.error("TvChartDataFeedModule.getHistoryBars", error);
        break;
      }
    }

    const bars = sortBy(
      results.map((candle) => this.mapCandleToBar(candle, token, quote, priceType)),
      "time",
    );

    // TODO 这里 HistoryBarMgr 干什么？
    // HistoryBarMgr.setLatestBarFromHistory({ chain, address, interval: resolution }, bars, {
    //   priceType,
    //   totalSupply: token.marketData.circulatingSupply,
    // });

    return bars;
  }
  mapCandleToBar(
    candle: Candle | WsCandle,
    token: Token,
    quote: TvChartQuoteType,
    priceType: TvChartPriceType,
  ): Bar {
    // in usd
    const bar = {
      time: typeof candle.time === "string" ? new Date(candle.time).getTime() : candle.time,
      high: new BigNumber(candle.high).toNumber(),
      low: new BigNumber(candle.low).toNumber(),
      open: new BigNumber(candle.open).toNumber(),
      close: new BigNumber(candle.close).toNumber(),
      volume: new BigNumber(candle.volume).toNumber(),
    };

    // TODO Historical market cap K-line should be obtained from backend instead of frontend calculation, because the total supply may change
    if (priceType === TvChartPriceType.MarketCap) {
      const totalSupply = token.marketData.totalSupply;
      bar.high = new BigNumber(bar.high).times(totalSupply).toNumber();
      bar.low = new BigNumber(bar.low).times(totalSupply).toNumber();
      bar.open = new BigNumber(bar.open).times(totalSupply).toNumber();
      bar.close = new BigNumber(bar.close).times(totalSupply).toNumber();
    }

    if (quote !== TvChartQuoteType.USD) {
      const quotePriceInfo = quotePricesSubject.value.get(quote);
      if (quotePriceInfo) {
        const quotePrice = quotePriceInfo.price;
        bar.high = new BigNumber(bar.high).div(quotePrice).toNumber();
        bar.low = new BigNumber(bar.low).div(quotePrice).toNumber();
        bar.open = new BigNumber(bar.open).div(quotePrice).toNumber();
        bar.close = new BigNumber(bar.close).div(quotePrice).toNumber();
      }
    }

    return bar;
  }
  // TODO reset & reconnect
  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    libraryChartResolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    _onResetCacheNeededCallback: () => void,
  ) {
    const dexClient = dexClientSubject.value;
    if (!dexClient) throw new Error("DexClient is not ready");

    const { token, priceType, quote } = symbolInfo as TvChartSymbolInfo;
    const { chain, address } = token;
    const resolution = getTvChartResolutionReverse(libraryChartResolution);

    const chainId = parseChainId(chain);
    if (!chainId) throw new Error(`Unsupported chain slug ${chain}`);

    const unsub = dexClient.stream.subscribeTokenCandles({
      chain: chainParam(chainId),
      tokenAddress: address,
      resolution: resolution as Resolution,
      callback: (candle: WsCandle) => {
        const bar = this.mapCandleToBar(candle, token, quote, priceType);
        onTick(bar);

        // TODO HistoryBarMgr
        updateTokenLatestPrice(chainId, address, new BigNumber(candle.close).toNumber());
      },
    });

    if (unsub) {
      this.barSubscriptionMap.set(listenerGuid, unsub);
    }
  }
  findChartBySymbolResolution(
    symbolInfo: LibrarySymbolInfo,
    libraryChartResolution: ResolutionString,
  ) {
    const chartCount = this.instance?.widget?.chartsCount() ?? 0;
    const charts = [] as IChartWidgetApi[];
    for (let i = 0; i < chartCount; i++) {
      const n = this.instance?.widget?.chart(i);
      if (n && n.symbol() === symbolInfo.ticker && n.resolution() === libraryChartResolution) {
        charts.push(n);
      }
    }
    return charts;
  }
  unsubscribeBars(listenerGuid: string) {
    this.deleteSymbolMap(listenerGuid);
    this.isLoadMarkData = {
      isLoad: false,
      interval: this.isLoadMarkData.interval,
      symbol: this.isLoadMarkData.symbol,
    };
    this.barSubscriptionMap.get(listenerGuid)?.unsubscribe();
    this.barSubscriptionMap.delete(listenerGuid);
  }
  async getQuotes(
    _symbols: string[],
    _onDataCallback: QuotesCallback,
    _1onErrorCallback: QuotesErrorCallback,
  ) { }
  subscribeQuotes(
    symbols: string[],
    _fastSymbols: string[],
    _onRealtimeCallback: QuotesCallback,
    listenerGUID: string,
  ) {
    if (this.debug) {
      console.debug("TvChartDataFeedModule.subscribeQuotes", symbols, listenerGUID);
    }
    if (!this.orderbookQuotesMap[listenerGUID]) {
      this.orderbookQuotesMap[listenerGUID] = {};
    }
  }
  unsubscribeQuotes(listenerGUID: string) {
    if (this.debug) {
      console.debug("TvChartDataFeedModule.unsubscribeQuotes", listenerGUID);
    }
    if (this.orderbookQuotesMap[listenerGUID]) {
      const { tickerSubscription, ...rest } = this.orderbookQuotesMap[listenerGUID];
      if (tickerSubscription) {
        tickerSubscription.unsubscribe();
      }
      Object.values(rest).forEach((e: any) => {
        e.subscription?.unsubscribe();
      });
      delete this.orderbookQuotesMap[listenerGUID];
    }
  }
}

function tokenSymbolInfo(
  token: Token,
  quote?: TvChartQuoteType,
  priceType?: TvChartPriceType,
): TvChartSymbolInfo {
  const name = quote ? `${token.symbol}/${quote}` : token.symbol;

  const tickerSymbol = stringifySymbol({
    chain: token.chain,
    address: token.address,
    quote,
    priceType,
  });

  // TODO gmgn 的 market cap 是拿到 sol 和 token 的实时 in usd 价格，再根据 total supply 计算
  const price =
    quote === TvChartQuoteType.USD
      ? priceType === TvChartPriceType.Price
        ? token.marketData.priceInUsd
        : token.marketData.marketCapInUsd
      : priceType === TvChartPriceType.Price
        ? token.marketData.priceInSol ?? 0
        : token.marketData.marketCapInSol ?? 0;

  // 根据实际价格推算精度
  const precision = calculateDecimalPrecision(price, { precision: true });

  return {
    address: token.address,
    name: name,
    description: name,
    symbol: tickerSymbol,
    full_name: tickerSymbol,
    ticker: tickerSymbol,
    type: "crypto",
    session: "24x7",
    exchange: CONFIG.branding.name,
    priceType: priceType,
    listed_exchange: "",
    format: "price",
    pricescale: Number(`1e${precision}`),
    precision: precision,
    minmov: 1,
    has_intraday: true,
    supported_resolutions: ALL_TV_CHART_RESOLUTIONS.map(getTvChartLibraryResolution),
    timezone: DateTime.local().get("zoneName") as unknown as Timezone,
    has_ticks: true,
    currency_code: token.symbol,
    token: token,
    has_no_volume: false,
    has_seconds: true,
    quote: quote,
  } as TvChartSymbolInfo;
}
