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
      return token.stats?.periods?.["1m"]?.priceChangeRatioInUsd;
    case "5m":
      return token.stats?.periods?.["5m"]?.priceChangeRatioInUsd;
    case "1h":
      return token.stats?.periods?.["1h"]?.priceChangeRatioInUsd;
    case "4h":
      return token.stats?.periods?.["4h"]?.priceChangeRatioInUsd;
    case "24h":
      return token.stats?.periods?.["24h"]?.priceChangeRatioInUsd;
    default:
      return undefined;
  }
}

export function tokenVolumesInUsd(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.periods?.["1m"]?.totalVolumeInUsd;
    case "5m":
      return token.stats?.periods?.["5m"]?.totalVolumeInUsd;
    case "1h":
      return token.stats?.periods?.["1h"]?.totalVolumeInUsd;
    case "4h":
      return token.stats?.periods?.["4h"]?.totalVolumeInUsd;
    case "24h":
      return token.stats?.periods?.["24h"]?.totalVolumeInUsd;
    default:
      return undefined;
  }
}

export function tokenBuyVolumesInUsd(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.periods?.["1m"]?.buyVolumeInUsd;
    case "5m":
      return token.stats?.periods?.["5m"]?.buyVolumeInUsd;
    case "15m":
      return token.stats?.periods?.["15m"]?.buyVolumeInUsd;
    case "30m":
      return token.stats?.periods?.["30m"]?.buyVolumeInUsd;
    case "1h":
      return token.stats?.periods?.["1h"]?.buyVolumeInUsd;
    case "4h":
      return token.stats?.periods?.["4h"]?.buyVolumeInUsd;
    case "24h":
      return token.stats?.periods?.["24h"]?.buyVolumeInUsd;
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
      return token.stats?.periods?.["1m"]?.sellVolumeInUsd;
    case "5m":
      return token.stats?.periods?.["5m"]?.sellVolumeInUsd;
    case "15m":
      return token.stats?.periods?.["15m"]?.sellVolumeInUsd;
    case "30m":
      return token.stats?.periods?.["30m"]?.sellVolumeInUsd;
    case "1h":
      return token.stats?.periods?.["1h"]?.sellVolumeInUsd;
    case "4h":
      return token.stats?.periods?.["4h"]?.sellVolumeInUsd;
    case "24h":
      return token.stats?.periods?.["24h"]?.sellVolumeInUsd;
    default:
      return undefined;
  }
}

export function tokenTrades(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.periods?.["1m"]?.trades;
    case "5m":
      return token.stats?.periods?.["5m"]?.trades;
    case "1h":
      return token.stats?.periods?.["1h"]?.trades;
    case "4h":
      return token.stats?.periods?.["4h"]?.trades;
    case "24h":
      return token.stats?.periods?.["24h"]?.trades;
    default:
      return undefined;
  }
}

export function tokenBuys(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.periods?.["1m"]?.buys;
    case "5m":
      return token.stats?.periods?.["5m"]?.buys;
    case "15m":
      return token.stats?.periods?.["15m"]?.buys;
    case "30m":
      return token.stats?.periods?.["30m"]?.buys;
    case "1h":
      return token.stats?.periods?.["1h"]?.buys;
    case "4h":
      return token.stats?.periods?.["4h"]?.buys;
    case "24h":
      return token.stats?.periods?.["24h"]?.buys;
    default:
      return undefined;
  }
}

export function tokenSells(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.periods?.["1m"]?.sells;
    case "5m":
      return token.stats?.periods?.["5m"]?.sells;
    case "15m":
      return token.stats?.periods?.["15m"]?.sells;
    case "30m":
      return token.stats?.periods?.["30m"]?.sells;
    case "1h":
      return token.stats?.periods?.["1h"]?.sells;
    case "4h":
      return token.stats?.periods?.["4h"]?.sells;
    case "24h":
      return token.stats?.periods?.["24h"]?.sells;
    default:
      return undefined;
  }
}

export function tokenTraders(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.periods?.["1m"]?.traders;
    case "5m":
      return token.stats?.periods?.["5m"]?.traders;
    case "1h":
      return token.stats?.periods?.["1h"]?.traders;
    case "4h":
      return token.stats?.periods?.["4h"]?.traders;
    case "24h":
      return token.stats?.periods?.["24h"]?.traders;
    default:
      return undefined;
  }
}

export function tokenBuyers(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.periods?.["1m"]?.buyers;
    case "5m":
      return token.stats?.periods?.["5m"]?.buyers;
    case "15m":
      return token.stats?.periods?.["15m"]?.buyers;
    case "30m":
      return token.stats?.periods?.["30m"]?.buyers;
    case "1h":
      return token.stats?.periods?.["1h"]?.buyers;
    case "4h":
      return token.stats?.periods?.["4h"]?.buyers;
    case "24h":
      return token.stats?.periods?.["24h"]?.buyers;
    default:
      return undefined;
  }
}

export function tokenSellers(token: Token, timeframe: string): number | string | undefined {
  switch (timeframe) {
    case "1m":
      return token.stats?.periods?.["1m"]?.sellers;
    case "5m":
      return token.stats?.periods?.["5m"]?.sellers;
    case "15m":
      return token.stats?.periods?.["15m"]?.sellers;
    case "30m":
      return token.stats?.periods?.["30m"]?.sellers;
    case "1h":
      return token.stats?.periods?.["1h"]?.sellers;
    case "4h":
      return token.stats?.periods?.["4h"]?.sellers;
    case "24h":
      return token.stats?.periods?.["24h"]?.sellers;
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
