/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { chainParam } from "./utils";
import { QueryKeys } from "./queryKeys";

export async function fetchTokenSecurity(client: ChainStreamClient, chain: CHAIN_ID, tokenAddress: string) {
  return await client.token.getSecurity(chainParam(chain), tokenAddress);
}

export function useTokenSecurityQuery(
  chain: CHAIN_ID,
  tokenAddress: string,
  options: Omit<UseQueryOptions<any, Error, any, string[]>, "queryKey" | "queryFn"> = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.tokenSecurity(chain, tokenAddress),
    queryFn: async () => fetchTokenSecurity(client, chain, tokenAddress),
    ...options,
  });
}
