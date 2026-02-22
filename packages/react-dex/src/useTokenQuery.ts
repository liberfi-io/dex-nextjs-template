import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, Token } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";

export async function fetchToken(client: ChainStreamClient, chain: Chain, tokenAddress: string) {
  return await client.token.getToken(chainParam(chain), tokenAddress);
}

export function useTokenQuery(
  chain: Chain,
  tokenAddress: string,
  options: Omit<UseQueryOptions<Token, Error, Token, string[]>, "queryKey" | "queryFn"> = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.token(chain, tokenAddress),
    queryFn: async () => fetchToken(client, chain, tokenAddress),
    ...options,
  });
}
