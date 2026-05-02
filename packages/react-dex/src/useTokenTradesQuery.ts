import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, PageResponseTradeDetail } from "@chainstream-io/sdk";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";
import { UseTokenTradesQueryParams } from "./types";

export async function fetchTokenTrades(client: ChainStreamClient, param: UseTokenTradesQueryParams) {
  const { chain, ...rest } = param;
  return await client.trade.getTrades(chainParam(chain), {
    limit: 100,
    ...rest,
  });
}

/**
 * @deprecated Prefer `useTokenActivitiesQuery` from `@liberfi.io/react`
 * (Phase 3 activities endpoint with `gasFee` + `traderTags`). The legacy
 * trades endpoint is kept available via `useTokenTradesQuery` in
 * `@liberfi.io/react` for back-compat.
 */
export function useTokenTradesQuery(
  param: UseTokenTradesQueryParams,
  options: Omit<
    UseQueryOptions<PageResponseTradeDetail, Error, PageResponseTradeDetail, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.tokenTrades(param),
    queryFn: async () => fetchTokenTrades(client, param),
    ...options,
  });
}
