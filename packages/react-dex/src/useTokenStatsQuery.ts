import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, TokenStat } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";

export async function fetchTokenStats(client: ChainStreamClient, chain: CHAIN_ID, tokenAddress: string) {
  return await client.token.getStats(chainParam(chain), tokenAddress);
}

export function useTokenStatsQuery(
  chain: CHAIN_ID,
  tokenAddress: string,
  options: Omit<
    UseQueryOptions<TokenStat | null, Error, TokenStat | null, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.tokenStats(chain, tokenAddress),
    queryFn: async () => fetchTokenStats(client, chain, tokenAddress),
    ...options,
  });
}
