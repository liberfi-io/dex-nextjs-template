import { Chain } from "@liberfi.io/types";
import { chainIdBySlug } from "@liberfi.io/utils";

export enum AppRoute {
  home = "/",
  stocks = "/stocks",
  trade = "/tokens",
  account = "/account",
  invite = "/invite",
  holdings = "/holdings",
}

export type TokenDetailSource = "discover" | "pulse";

export const TOKEN_DETAIL_SOURCE_QUERY_PARAM = "source";

export interface TokenDetailRouteOptions {
  source?: TokenDetailSource;
}

const TOKEN_DETAIL_CHAIN_SEGMENTS: Record<string, "sol" | "eth" | "bsc" | "robinhood"> = {
  robinhood: "robinhood",
  [Chain.ROBINHOOD]: "robinhood",
  sol: "sol",
  solana: "sol",
  [Chain.SOLANA]: "sol",
  eth: "eth",
  ethereum: "eth",
  [Chain.ETHEREUM]: "eth",
  bsc: "bsc",
  binance: "bsc",
  bnb: "bsc",
  [Chain.BINANCE]: "bsc",
};

export function tokenDetailChainSegment(
  chain: Chain | string | number | null | undefined,
): string {
  const key = String(chain ?? "")
    .trim()
    .toLowerCase();
  return TOKEN_DETAIL_CHAIN_SEGMENTS[key] ?? "";
}

export function tokenDetailRoute(
  chain: Chain | string | number | null | undefined,
  address: string,
  options?: TokenDetailRouteOptions,
): string {
  const pathname = `${AppRoute.trade}/${tokenDetailChainSegment(chain)}/${address}`;
  if (!options?.source) return pathname;

  const searchParams = new URLSearchParams({
    [TOKEN_DETAIL_SOURCE_QUERY_PARAM]: options.source,
  });
  return `${pathname}?${searchParams.toString()}`;
}

/** Use only an explicitly configured mainnet token; never reuse an old-chain address. */
export function defaultTokenDetailRoute(chain?: string, address?: string): string {
  if (tokenDetailChainSegment(chain) === "robinhood"
    && typeof address === "string"
    && /^0x[0-9a-fA-F]{40}$/.test(address)) {
    return tokenDetailRoute(Chain.ROBINHOOD, address);
  }
  return "/?chain=robinhood";
}

/** Parse `/tokens/[[...slug]]`. Unsupported chains redirect to the Robinhood home page. */
export function resolveTokenRouteSlug(
  slug: unknown,
): { chainId: Chain; address: string } | null {
  if (!Array.isArray(slug) || slug.length < 2) return null;
  const chain = slug[0];
  const address = slug[1];
  if (typeof chain !== "string" || chain.length === 0) return null;
  if (typeof address !== "string" || address.length === 0) return null;
  const chainId = chainIdBySlug(chain);
  if (chainId !== Chain.ROBINHOOD) return null;
  return { chainId, address };
}
