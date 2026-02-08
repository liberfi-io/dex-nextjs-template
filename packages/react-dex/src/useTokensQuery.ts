import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, Token } from "@chainstream-io/sdk";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";
import { UseTokensQueryParams } from "./types";

export async function fetchTokens(client: ChainStreamClient, param: UseTokensQueryParams) {
  const { chain, ...rest } = param;
  return await client.token.getTokens(chainParam(chain), {
    ...rest,
    tokenAddresses: param.tokenAddresses.sort().join(","),
  });
}

export function useTokensQuery(
  param: UseTokensQueryParams,
  options: Omit<
    UseQueryOptions<Array<Token>, Error, Array<Token>, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.tokens(param),
    queryFn: async () => fetchTokens(client, param),
    ...options,
  });
}
