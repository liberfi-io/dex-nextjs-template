import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, Token } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { chainParam } from "./utils";
import { UseHotTokensQueryParams } from "./types";
import { QueryKeys } from "./queryKeys";

const defaultParam: UseHotTokensQueryParams = {
  chain: CHAIN_ID.SOLANA,
  duration: "24h",
};

export async function fetchHotTokens(client: ChainStreamClient, param: UseHotTokensQueryParams) {
  const { chain, duration, ...rest } = param;
  return await client.ranking.getHotTokens(chainParam(chain), duration, rest);
}

export function useHotTokensQuery(
  param: UseHotTokensQueryParams = defaultParam,
  options: Omit<
    UseQueryOptions<Array<Token>, Error, Array<Token>, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.hotTokens(param),
    queryFn: async () => fetchHotTokens(client, param),
    ...options,
  });
}
