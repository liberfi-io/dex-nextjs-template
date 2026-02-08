import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, SwapRouteResponse } from "@chainstream-io/sdk";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";
import { UseSwapRouteQueryParams } from "./types";

export async function fetchSwapRoute(client: ChainStreamClient, param: UseSwapRouteQueryParams) {
  const { chain, ...rest } = param;
  return await client.dex.route(chainParam(chain), rest);
}

export function useSwapRouteQuery(
  param: UseSwapRouteQueryParams,
  options: Omit<
    UseQueryOptions<SwapRouteResponse, Error, SwapRouteResponse, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.swapRoute(param),
    queryFn: async () => fetchSwapRoute(client, param),
    ...options,
  });
}
