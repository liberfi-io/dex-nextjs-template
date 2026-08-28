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
): string {
  return `${AppRoute.trade}/${tokenDetailChainSegment(chain)}/${address}`;
}

/** Parse `/tokens/[[...slug]]`. Empty or unknown chain is null so the page can redirect. */
export function resolveTokenRouteSlug(
  slug: unknown,
): { chainId: Chain; address: string } | null {
  if (!Array.isArray(slug) || slug.length < 2) return null;
  const chain = slug[0];
  const address = slug[1];
  if (typeof chain !== "string" || chain.length === 0) return null;
  if (typeof address !== "string" || address.length === 0) return null;
  const chainId = chainIdBySlug(chain);
  if (!chainId) return null;
  return { chainId, address };
}
