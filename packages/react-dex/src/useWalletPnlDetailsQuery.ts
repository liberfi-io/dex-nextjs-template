import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, PnlDetailsResult } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";

export async function fetchWalletPnlDetails(
  client: ChainStreamClient,
  chain: Chain,
  walletAddress: string,
) {
  return await client.wallet.getPnlDetails(chainParam(chain), walletAddress, { limit: 100 });
}

/**
 * @deprecated Use `useWalletPortfolioPnlsQuery` /
 * `useWalletPortfolioPnlsInfiniteQuery` from `@liberfi.io/react` instead. The
 * Phase 3 endpoint supports `resolution` / `positionState` / `sortBy` and
 * returns `isClosed`, `firstBuyAt`, `lastSellAt`.
 */
export function useWalletPnlDetailsQuery(
  chain: Chain,
  walletAddress: string,
  options: Omit<
    UseQueryOptions<PnlDetailsResult, Error, PnlDetailsResult, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.walletPnlDetails(chain, walletAddress),
    queryFn: async () => fetchWalletPnlDetails(client, chain, walletAddress),
    ...options,
  });
}
