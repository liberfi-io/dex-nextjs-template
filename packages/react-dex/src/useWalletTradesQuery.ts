import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, PageResponseTradeDetail } from "@chainstream-io/sdk";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";
import { UseWalletTradesQueryParams } from "./types";

export async function fetchWalletTrades(client: ChainStreamClient, param: UseWalletTradesQueryParams) {
  const { chain, ...rest } = param;
  return await client.trade.getTrades(chainParam(chain), {
    limit: 100,
    ...rest,
  });
}

/**
 * @deprecated Prefer `useWalletActivitiesQuery` from `@liberfi.io/react`
 * (Phase 3 activities endpoint with `gasFee` + `traderTags`). The legacy
 * trades endpoint is still available via `useWalletTradesQuery` in
 * `@liberfi.io/react` for back-compat.
 */
export function useWalletTradesQuery(
  param: UseWalletTradesQueryParams,
  options: Omit<
    UseQueryOptions<PageResponseTradeDetail, Error, PageResponseTradeDetail, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.walletTrades(param),
    queryFn: async () => fetchWalletTrades(client, param),
    ...options,
  });
}
