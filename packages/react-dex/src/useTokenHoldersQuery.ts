import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, TokenHolderPage } from "@chainstream-io/sdk";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";
import { UseTokenHoldersQueryParams } from "./types";

export async function fetchTokenHolders(client: ChainStreamClient, param: UseTokenHoldersQueryParams) {
  const { chain, tokenAddress, ...rest } = param;
  return await client.token.getHolders(chainParam(chain), tokenAddress, {
    limit: 100,
    ...rest,
  });
}

export function useTokenHoldersQuery(
  param: UseTokenHoldersQueryParams,
  options: Omit<
    UseQueryOptions<TokenHolderPage, Error, TokenHolderPage, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.tokenHolders(param),
    queryFn: async () => fetchTokenHolders(client, param),
    ...options,
  });
}
