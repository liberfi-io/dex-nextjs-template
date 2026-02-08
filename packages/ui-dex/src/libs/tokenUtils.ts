import {
  FilterCondition,
  FilterConditionField,
  GetHotTokensParams,
  GetNewTokensParams,
  GetStocksTokensParams,
  Token,
} from "@chainstream-io/sdk";
import { CHAIN_ID, chainIdBySlug, chainSlugs } from "@liberfi/core";

export function stringifyTickerSymbol(chainId: CHAIN_ID, address: string): string {
  switch (chainId) {
    case CHAIN_ID.ETHEREUM:
      return `eth/${address}`;
    case CHAIN_ID.BINANCE:
      return `bsc/${address}`;
    default:
      break;
  }
  const chainSlug = chainSlugs[chainId];
  if (!chainSlug) {
    throw new Error(`Unknown chainId: ${chainId}`);
  }
  return `${chainSlug}/${address}`;
}

export function stringifyTickerSymbolByChainSlug(chainSlug: string, address: string): string {
  return `${chainSlug}/${address}`;
}

export function parseTickerSymbol(tickerSymbol: string): { chainId: CHAIN_ID; address: string } {
  const [chainSlug, address] = tickerSymbol.split("/");
  switch (chainSlug) {
    case "eth":
      return { chainId: CHAIN_ID.ETHEREUM, address };
    case "bsc":
      return { chainId: CHAIN_ID.BINANCE, address };
    default:
      break;
  }
  const chainId = chainIdBySlug(chainSlug);
  if (!chainId) {
    throw new Error(`Unknown chainSlug: ${chainSlug}`);
  }
  return { chainId, address };
}

export const CHAIN_QUOTE_TOKEN_SYMBOLS: Partial<{
  [key in CHAIN_ID]: string;
}> = {
  [CHAIN_ID.SOLANA]: "SOL",
  [CHAIN_ID.ETHEREUM]: "ETH",
  [CHAIN_ID.BINANCE]: "BNB",
};

export const CHAIN_PRIMARY_TOKENS: Partial<{
  [key in CHAIN_ID]: Record<string, string>;
}> = {
  [CHAIN_ID.SOLANA]: {
    SOL: "11111111111111111111111111111111",
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
  [CHAIN_ID.ETHEREUM]: {
    ETH: "0x0000000000000000000000000000000000000000",
    USDC: "0x0000000000000000000000000000000000000000",
    USDT: "0x0000000000000000000000000000000000000000",
  },
  [CHAIN_ID.BINANCE]: {
    BNB: "0x0000000000000000000000000000000000000000",
    USDC: "0x0000000000000000000000000000000000000000",
    USDT: "0x0000000000000000000000000000000000000000",
  },
};

export function tokenPriceChangeRatioInUsd(
  token: Token,
  timeframe: string,
): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.priceChangeRatioInUsd1m;
    case "5m":
      return token.stats?.priceChangeRatioInUsd5m;
    case "1h":
      return token.stats?.priceChangeRatioInUsd1h;
    case "4h":
      return token.stats?.priceChangeRatioInUsd4h;
    case "24h":
      return token.stats?.priceChangeRatioInUsd24h;
    default:
      return undefined;
  }
}

export function tokenVolumesInUsd(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.volumesInUsd1m;
    case "5m":
      return token.stats?.volumesInUsd5m;
    case "1h":
      return token.stats?.volumesInUsd1h;
    case "4h":
      return token.stats?.volumesInUsd4h;
    case "24h":
      return token.stats?.volumesInUsd24h;
    default:
      return undefined;
  }
}

export function tokenBuyVolumesInUsd(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.buyVolumesInUsd1m;
    case "5m":
      return token.stats?.buyVolumesInUsd5m;
    case "15m":
      return token.stats?.buyVolumesInUsd15m;
    case "30m":
      return token.stats?.buyVolumesInUsd30m;
    case "1h":
      return token.stats?.buyVolumesInUsd1h;
    case "4h":
      return token.stats?.buyVolumesInUsd4h;
    case "24h":
      return token.stats?.buyVolumesInUsd24h;
    default:
      return undefined;
  }
}

export function tokenSellVolumesInUsd(
  token: Token,
  timeframe: string,
): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.sellVolumesInUsd1m;
    case "5m":
      return token.stats?.sellVolumesInUsd5m;
    case "15m":
      return token.stats?.sellVolumesInUsd15m;
    case "30m":
      return token.stats?.sellVolumesInUsd30m;
    case "1h":
      return token.stats?.sellVolumesInUsd1h;
    case "4h":
      return token.stats?.sellVolumesInUsd4h;
    case "24h":
      return token.stats?.sellVolumesInUsd24h;
    default:
      return undefined;
  }
}

export function tokenTrades(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.trades1m;
    case "5m":
      return token.stats?.trades5m;
    case "1h":
      return token.stats?.trades1h;
    case "4h":
      return token.stats?.trades4h;
    case "24h":
      return token.stats?.trades24h;
    default:
      return undefined;
  }
}

export function tokenBuys(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.buys1m;
    case "5m":
      return token.stats?.buys5m;
    case "15m":
      return token.stats?.buys15m;
    case "30m":
      return token.stats?.buys30m;
    case "1h":
      return token.stats?.buys1h;
    case "4h":
      return token.stats?.buys4h;
    case "24h":
      return token.stats?.buys24h;
    default:
      return undefined;
  }
}

export function tokenSells(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.sells1m;
    case "5m":
      return token.stats?.sells5m;
    case "15m":
      return token.stats?.sells15m;
    case "30m":
      return token.stats?.sells30m;
    case "1h":
      return token.stats?.sells1h;
    case "4h":
      return token.stats?.sells4h;
    case "24h":
      return token.stats?.sells24h;
    default:
      return undefined;
  }
}

export function tokenTraders(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.traders1m;
    case "5m":
      return token.stats?.traders5m;
    case "1h":
      return token.stats?.traders1h;
    case "4h":
      return token.stats?.traders4h;
    case "24h":
      return token.stats?.traders24h;
    default:
      return undefined;
  }
}

export function tokenBuyers(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.buyers1m;
    case "5m":
      return token.stats?.buyers5m;
    case "15m":
      return token.stats?.buyers15m;
    case "30m":
      return token.stats?.buyers30m;
    case "1h":
      return token.stats?.buyers1h;
    case "4h":
      return token.stats?.buyers4h;
    case "24h":
      return token.stats?.buyers24h;
    default:
      return undefined;
  }
}

export function tokenSellers(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.sellers1m;
    case "5m":
      return token.stats?.sellers5m;
    case "15m":
      return token.stats?.sellers15m;
    case "30m":
      return token.stats?.sellers30m;
    case "1h":
      return token.stats?.sellers1h;
    case "4h":
      return token.stats?.sellers4h;
    case "24h":
      return token.stats?.sellers24h;
    default:
      return undefined;
  }
}

const tokenFieldsMap: Record<string, string | Record<string, string>> = {
  age: "tokenCreatedAt",
  holders: "marketData.holders",
  liquidity: "marketData.liquidityInUsd",
  market_cap: "marketData.marketCapInUsd",
  price: "marketData.priceInUsd",
  price_change: {
    "1m": "stats.priceChangeRatioInUsd1m",
    "5m": "stats.priceChangeRatioInUsd5m",
    "15m": "stats.priceChangeRatioInUsd15m",
    "30m": "stats.priceChangeRatioInUsd30m",
    "1h": "stats.priceChangeRatioInUsd1h",
    "4h": "stats.priceChangeRatioInUsd4h",
    "24h": "stats.priceChangeRatioInUsd24h",
  },
  traders: {
    "1m": "stats.traders1m",
    "5m": "stats.traders5m",
    "15m": "stats.traders15m",
    "30m": "stats.traders30m",
    "1h": "stats.traders1h",
    "4h": "stats.traders4h",
    "24h": "stats.traders24h",
  },
  txs: {
    "1m": "stats.trades1m",
    "5m": "stats.trades5m",
    "15m": "stats.trades15m",
    "30m": "stats.trades30m",
    "1h": "stats.trades1h",
    "4h": "stats.trades4h",
    "24h": "stats.trades24h",
  },
  volume: {
    "1m": "stats.volumesInUsd1m",
    "5m": "stats.volumesInUsd5m",
    "15m": "stats.volumesInUsd15m",
    "30m": "stats.volumesInUsd30m",
    "1h": "stats.volumesInUsd1h",
    "4h": "stats.volumesInUsd4h",
    "24h": "stats.volumesInUsd24h",
  },
};

export function tokenFieldsByKey(key: string, timeframe: string): string | undefined {
  const field = tokenFieldsMap[key];
  if (typeof field === "string") return field;
  return field?.[timeframe];
}

type TokenSort =
  | Pick<GetHotTokensParams, "sortBy" | "sortDirection">
  | Pick<GetNewTokensParams, "sortBy" | "sortDirection">
  | Pick<GetStocksTokensParams, "sortBy" | "sortDirection">;

export function tokenSort(
  sort: Record<string, "asc" | "desc">,
  timeframe: string,
): TokenSort | undefined {
  const [key, dir] = Object.entries(sort).at(0) ?? [];
  if (!key || !dir) return undefined;

  const field = tokenFieldsByKey(key, timeframe);
  if (!field) return undefined;

  return {
    sortBy: field,
    sortDirection: dir.toUpperCase(),
  } as TokenSort;
}

export function tokenFilters(
  filters: Record<string, string>,
  timeframe: string,
): { filterBy: Array<FilterCondition> } | undefined {
  const filterBy: FilterCondition[] = [];

  Object.entries(filters).forEach(([key, value]) => {
    const field = tokenFieldsByKey(key, timeframe) as FilterConditionField;
    if (!field) return;
    if (value.includes(":")) {
      const [min, max] = value.split(":");
      filterBy.push({ field, min, max });
    } else {
      if (key === "age") {
        filterBy.push({ field, max: value });
      } else {
        filterBy.push({ field, min: value });
      }
    }
  });
  return filterBy.length > 0 ? { filterBy } : undefined;
}

export type SocialMedias = {
  website: string | null | undefined;
  twitter: string | null | undefined;
  telegram: string | null | undefined;
  documentation: string | null | undefined;
  twitter_search: string | null | undefined;
  discord: string | null | undefined;
  github: string | null | undefined;
  reddit: string | null | undefined;
};

export const PRIMARY_TOKENS_MAP: Partial<{
  [key in CHAIN_ID]: Pick<Token, "address" | "name" | "symbol" | "imageUrl">[];
}> = {
  [CHAIN_ID.SOLANA]: [
    // {
    //   address: "0x0000000000000000000000000000000000000000",
    //   name: "Solana",
    //   symbol: "SOL",
    // },
    {
      address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      name: "USDT",
      symbol: "USDT",
    },
    {
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      name: "USD Coin",
      symbol: "USDC",
    },
  ],
};
