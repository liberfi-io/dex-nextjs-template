import { Chain } from "@liberfi.io/types";

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

export function tokenDetailChainSegment(chain: Chain | string | number | null | undefined): string {
  const key = String(chain ?? "").trim().toLowerCase();
  return TOKEN_DETAIL_CHAIN_SEGMENTS[key] ?? "";
}

export function tokenDetailRoute(
  chain: Chain | string | number | null | undefined,
  address: string,
): string {
  return `${AppRoute.trade}/${tokenDetailChainSegment(chain)}/${address}`;
}
