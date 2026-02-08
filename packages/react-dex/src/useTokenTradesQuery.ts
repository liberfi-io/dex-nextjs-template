import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, TradePage } from "@chainstream-io/sdk";
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

export function useTokenTradesQuery(
  param: UseTokenTradesQueryParams,
  options: Omit<
    UseQueryOptions<TradePage, Error, TradePage, string[]>,
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
