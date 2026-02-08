import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, TradePage } from "@chainstream-io/sdk";
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

export function useWalletTradesQuery(
  param: UseWalletTradesQueryParams,
  options: Omit<
    UseQueryOptions<TradePage, Error, TradePage, string[]>,
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
