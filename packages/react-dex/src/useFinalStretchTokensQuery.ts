import { ChainStreamClient, Token } from "@chainstream-io/sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { CHAIN_ID } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { UseFinalStretchTokensQueryParams } from "./types";
import { chainParam } from "./utils";

const defaultParam: UseFinalStretchTokensQueryParams = {
  chain: CHAIN_ID.SOLANA,
};

export async function fetchFinalStretchTokens(
  client: ChainStreamClient,
  param: UseFinalStretchTokensQueryParams,
) {
  const { chain, ...rest } = param;
  return await client.ranking.getFinalStretchTokens(chainParam(chain), rest);
}

export function useFinalStretchTokensQuery(
  param: UseFinalStretchTokensQueryParams = defaultParam,
  options: Omit<
    UseQueryOptions<Array<Token>, Error, Array<Token>, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.finalStretchTokens(param),
    queryFn: async () => fetchFinalStretchTokens(client, param),
    ...options,
  });
}
