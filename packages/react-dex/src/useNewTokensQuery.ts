import { ChainStreamClient, Token } from "@chainstream-io/sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Chain } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { UseNewTokensQueryParams } from "./types";
import { chainParam } from "./utils";

const defaultParam: UseNewTokensQueryParams = {
  chain: Chain.SOLANA,
};

export async function fetchNewTokens(client: ChainStreamClient, param: UseNewTokensQueryParams) {
  const { chain, ...rest } = param;
  return await client.ranking.getNewTokens(chainParam(chain), rest);
}

export function useNewTokensQuery(
  param: UseNewTokensQueryParams = defaultParam,
  options: Omit<
    UseQueryOptions<Array<Token>, Error, Array<Token>, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.newTokens(param),
    queryFn: async () => fetchNewTokens(client, param),
    ...options,
  });
}
