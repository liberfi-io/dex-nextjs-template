import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, TokenPage } from "@chainstream-io/sdk";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";
import { UseSearchTokensQueryParams } from "./types";
import { useDexClient } from "./DexClientProvider";

export async function searchTokens(client: ChainStreamClient, param: UseSearchTokensQueryParams) {
  return await client.token.search({
    ...param,
    chains: param.chains?.map(chainParam),
  });
}

export function useSearchTokensQuery(
  param: UseSearchTokensQueryParams = {},
  options: Omit<
    UseQueryOptions<TokenPage, Error, TokenPage, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.searchTokens(param),
    queryFn: async () => searchTokens(client, param),
    ...options,
  });
}
