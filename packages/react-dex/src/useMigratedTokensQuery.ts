import { ChainStreamClient, Token } from "@chainstream-io/sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Chain } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { UseMigratedTokensQueryParams } from "./types";
import { chainParam } from "./utils";

const defaultParam: UseMigratedTokensQueryParams = {
  chain: Chain.SOLANA,
};

export async function fetchMigratedTokens(client: ChainStreamClient, param: UseMigratedTokensQueryParams) {
  const { chain, ...rest } = param;
  return await client.ranking.getMigratedTokens(chainParam(chain), rest);
}

export function useMigratedTokensQuery(
  param: UseMigratedTokensQueryParams = defaultParam,
  options: Omit<
    UseQueryOptions<Array<Token>, Error, Array<Token>, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.migratedTokens(param),
    queryFn: async () => fetchMigratedTokens(client, param),
    ...options,
  });
}
