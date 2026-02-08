import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, Candle } from "@chainstream-io/sdk";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";
import { UseTokenCandlesQueryParams } from "./types";

export async function fetchTokenCandles(
  client: ChainStreamClient,
  { chain, tokenAddress, from, ...others }: UseTokenCandlesQueryParams,
) {
  return await client.token.getCandles(chainParam(chain), tokenAddress, { ...others, from });
}

export function useTokenCandlesQuery(
  param: UseTokenCandlesQueryParams,
  options: Omit<UseQueryOptions<Candle[], Error, Candle[], string[]>, "queryKey" | "queryFn"> = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.tokenCandles(param),
    queryFn: async () => fetchTokenCandles(client, param),
    ...options,
  });
}
