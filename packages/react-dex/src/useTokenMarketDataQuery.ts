import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, TokenMarketData } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { chainParam } from "./utils";
import { QueryKeys } from "./queryKeys";

export async function fetchTokenMarketData(
  client: ChainStreamClient,
  chain: Chain,
  tokenAddress: string,
) {
  return client.token.getMarketData(chainParam(chain), tokenAddress);
}

export function useTokenMarketDataQuery(
  chain: Chain,
  tokenAddress: string,
  options: Omit<
    UseQueryOptions<TokenMarketData | null, Error, TokenMarketData | null, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.tokenMarketData(chain, tokenAddress),
    queryFn: async () => fetchTokenMarketData(client, chain, tokenAddress),
    ...options,
  });
}
