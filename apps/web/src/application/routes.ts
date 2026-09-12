import { Chain } from "@liberfi.io/types";
import { chainIdBySlug, getWrappedToken } from "@liberfi.io/utils";

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

const TOKEN_DETAIL_CHAIN_SEGMENTS: Record<string, "sol" | "eth" | "bsc"> = {
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

/** Resolve legacy default-token settings to an available BSC token. */
export function defaultTokenDetailRoute(chain?: string, address?: string): string {
  const configuredBscToken = tokenDetailChainSegment(chain) === "bsc"
    && typeof address === "string"
    && /^0x[0-9a-fA-F]{40}$/.test(address);
  return tokenDetailRoute(
    Chain.BINANCE,
    configuredBscToken ? address : getWrappedToken(Chain.BINANCE)!.address,
  );
}

/** Parse `/tokens/[[...slug]]`. Unsupported chains redirect to the BSC default. */
export function resolveTokenRouteSlug(
  slug: unknown,
): { chainId: Chain; address: string } | null {
  if (!Array.isArray(slug) || slug.length < 2) return null;
  const chain = slug[0];
  const address = slug[1];
  if (typeof chain !== "string" || chain.length === 0) return null;
  if (typeof address !== "string" || address.length === 0) return null;
  const chainId = chainIdBySlug(chain);
  if (chainId !== Chain.BINANCE) return null;
  return { chainId, address };
}
