import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, Token } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { UseStockTokensQueryParams } from "./types";
import { chainParam } from "./utils";

const defaultParam: UseStockTokensQueryParams = {
  chain: Chain.SOLANA,
};

export async function fetchStockTokens(client: ChainStreamClient, param: UseStockTokensQueryParams) {
  const { chain, ...rest } = param;
  return await client.ranking.getStocksTokens(chainParam(chain), rest);
}

export function useStockTokensQuery(
  param: UseStockTokensQueryParams = defaultParam,
  options: Omit<
    UseQueryOptions<Array<Token>, Error, Array<Token>, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.stockTokens(param),
    queryFn: async () => fetchStockTokens(client, param),
    ...options,
  });
}
