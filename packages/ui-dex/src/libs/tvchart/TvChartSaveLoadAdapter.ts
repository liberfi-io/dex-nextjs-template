/* eslint-disable @typescript-eslint/no-explicit-any */
import { TvChartManager } from "./TvChartManager";
import { TvChartSettings } from "./TvChartSettings";
import { TvChartLibraryWidgetBridge } from "./TvChartLibraryWidgetBridge";
import { Subscription } from "rxjs";
import { parseSymbol, stringifySymbolShort } from "./utils";
import { cloneDeep, uniqBy } from "lodash-es";
import BigNumber from "bignumber.js";
import { TvChartPriceType, TvChartQuoteType } from "./types";

export class TvChartSaveLoadAdapter {
  setting: TvChartSettings;
  chartManager: TvChartManager;
  bridge: TvChartLibraryWidgetBridge;
  subs: Subscription[];
  data: any | null;
  drawings: any | null;

  constructor(
    settings: TvChartSettings,
    chartManager: TvChartManager,
    bridge: TvChartLibraryWidgetBridge,
  ) {
    this.setting = settings;
    this.chartManager = chartManager;
    this.bridge = bridge;
    this.subs = [];
    this.data = null;
    this.drawings = null;
    this.loadDataFromLocalStorage();
  }

  async init() {}

  destroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  toJSON() {
    return null;
  }

  get legacyLayoutId(): string {
    return this.setting.storageId;
  }
  get layoutId(): string {
    return this.setting.storageId;
  }
  get shouldResetColorPalette() {
    const theme = this.data?.theme;
    const reverseColor = this.data?.reverseColor;
    return theme !== this.setting.theme || reverseColor !== this.setting.reverseColor;
  }
  getLocalStorageKeys(key: string) {
    const fullKey = (v: string) => `charts.tradingview.data.${v}`;
    return Object.keys(localStorage).filter(
      (k) => k.startsWith(fullKey(key)) && /\.\d+$/.test(k.replace(fullKey(key), "")),
    );
  }
  loadDataFromLocalStorage() {
    const layoutKey = this.getLayoutKey(this.layoutId);
    const drawingKey = this.getDrawingKey(this.layoutId);
    const layout = localStorage.getItem(layoutKey);
    const drawing = localStorage.getItem(drawingKey);
    if (layout) {
      try {
        const parsedLayout = JSON.parse(layout);
        const parsedContent = JSON.parse(parsedLayout.content);
        parsedLayout.content = JSON.stringify(parsedContent);
        this.data = parsedLayout;
      } catch (e) {
        console.error("TvChartSaveLoadAdapter loadDataFromLocalStorage parse layout error", e);
      }
    }
    if (drawing) {
      try {
        this.drawings = JSON.parse(drawing);
      } catch (e) {
        console.error("TvChartSaveLoadAdapter loadDataFromLocalStorage parse drawing error", e);
      }
    }
  }
  coverDrawingOuterSymbol(data: any) {
    const state = data.state?.state;
    if (state) {
      state.symbol = data.symbol;
    }
  }
  saveDataToLocalStorage() {
    const layoutKey = this.getLayoutKey(this.layoutId);
    const drawingKey = this.getDrawingKey(this.layoutId);
    const now = Math.round(Date.now() / 1e3);
    if (this.data) {
      this.data.timestamp = now;
      localStorage.setItem(layoutKey, JSON.stringify(this.data));
    }
    if (this.drawings) {
      this.drawings.timestamp = now;
      localStorage.setItem(drawingKey, JSON.stringify(this.drawings));
    }
  }
  getLayoutKey(key: string) {
    return `charts.tradingview.data.${key}`;
  }
  getDrawingKey(key: string) {
    return `charts.tradingview.drawing.${key}`;
  }
  getAllCharts() {
    return new Promise((resolve) => {
      const charts = [];
      if (this.data) {
        const data = this.data;
        charts.push({
          id: data.id,
          name: data.name,
          symbol: data.symbol,
          resolution: data.resolution,
          timestamp: data.timestamp,
        });
      }
      resolve(charts);
    });
  }
  removeChart(_index: number) {
    throw Error("Method not implemented.");
  }
  async saveChart(chart: any) {
    this.data = {
      ...chart,
      theme: this.setting.theme,
      reverseColor: this.setting.reverseColor,
      id: this.layoutId,
      timestamp: 0,
    };
    this.saveDataToLocalStorage();
    return this.data.id;
  }
  getChartContent(_: any) {
    return new Promise((resolve) => {
      const data = JSON.parse(this.data.content);
      const chartsSymbols = JSON.parse(data.charts_symbols);
      const content = JSON.parse(data.content);
      resolve(
        JSON.stringify({
          ...data,
          chart_symbols: JSON.stringify(chartsSymbols),
          content: JSON.stringify(content),
        }),
      );
    });
  }
  async saveLineToolsAndGroups(_storageId: string, chartIndex: string, data: any) {
    this.drawings = this.drawings || {
      data: {},
      timestamp: 0,
    };
    this.drawings.data = this.drawings.data || {};
    this.drawings.data[chartIndex] = this.drawings.data[chartIndex] || {};
    try {
      if (!data.sources) return;

      for (const [sourceId, source] of data.sources) {
        if (
          !source ||
          !source.symbol ||
          !source.state ||
          0 === Object.keys(source.state).length ||
          sourceId.includes("/")
        ) {
          if (source === null) {
            delete this.drawings.data[chartIndex][sourceId];
          }
        } else {
          const { address, chain, quote, priceType } = parseSymbol(source.symbol);
          const symbol = stringifySymbolShort({ address, chain });
          const saveSource = {
            ...source,
            symbol,
            quote,
            priceType,
            id: source.id.indexOf("/") > 0 ? source.id.split("/")[0] : source.id,
          };
          this.coverDrawingOuterSymbol(saveSource);
          this.drawings.data[chartIndex][sourceId] = saveSource;
        }
      }
      this.saveDataToLocalStorage();
    } catch (e) {
      console.error("saveLineToolsAndGroups", e);
    }
  }
  async loadLineToolsAndGroups(
    _storageId: string,
    chartIndex: string,
    _tool: string,
    // <chain>/<address>/<quote>/<priceType>
    symbolToLoad?: { symbol?: string },
  ) {
    if (!symbolToLoad?.symbol || !this.drawings?.data?.[chartIndex]) return null;

    const symbol = symbolToLoad.symbol;
    // wanted symbol
    const { address, chain, quote, priceType } = parseSymbol(symbol);

    const shortSymbol = stringifySymbolShort({ address, chain });

    const loadedSources = uniqBy(
      Object.values(cloneDeep(this.drawings.data[chartIndex]))
        // filter by chain & address
        .filter((it: any) => {
          this.coverDrawingOuterSymbol(it);
          return it.symbol === shortSymbol;
        }),
      "id",
    );

    try {
      // TODO fetch token info
      const token = { total_supply: 0 };

      return {
        // result drawing sources, sourceId => source
        sources: new Map<string, any>(
          loadedSources.map((source: any) => {
            const resultSource = cloneDeep({ ...source, symbol });
            resultSource.id = `${resultSource.id}/${quote}/${priceType}`;

            // loaded quote & priceType may be different from the wanted
            const { priceType: loadedPriceType, quote: loadedQuote } = resultSource;

            // fetch the quote token's price
            const price = 0.01;
            // const s =
            //   null === (r = Z.D3.getValue().get(quote === TvChartQuoteType.USD ? loadedQuote : quote)) ||
            //   void 0 === r
            //     ? void 0
            //     : r.price;

            // loaded quote & priceType are different from the wanted
            if (quote !== loadedQuote || priceType !== loadedPriceType) {
              resultSource.state.points = resultSource.state.points.map((point: any) => {
                let r = point.price as number;

                if (priceType !== loadedPriceType) {
                  r =
                    priceType === TvChartPriceType.Price
                      ? // loaded price type is market cap, transform to price
                        new BigNumber(r).div(token.total_supply).toNumber()
                      : // loaded price type is price, transform to market cap
                        new BigNumber(r).times(token.total_supply).toNumber();
                }

                if (quote !== loadedQuote) {
                  r =
                    quote === TvChartQuoteType.USD
                      ? // loaded quote is USD, transform to quote token
                        new BigNumber(r).times(price ? price : 1).toNumber()
                      : // loaded quote is quote token, transform to USD
                        new BigNumber(r).div(price ? price : 1).toNumber();
                }

                return { ...point, price: r };
              });
            }
            return [resultSource.id, resultSource];
          }),
        ),
      };
    } catch (e) {
      console.error("TvChartSaveLoadAdapter.loadLineToolsAndGroups", e);
      return null;
    }
  }
}
