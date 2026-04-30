import { useCallback } from "react";
import { useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient } from "@chainstream-io/sdk";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";
import { LatestBlock, UseLatestBlockQueryParams } from "./types";

export async function fetchLatestBlock(
  client: ChainStreamClient,
  param: UseLatestBlockQueryParams,
) {
  return await client.blockchain.getLatestBlock(chainParam(param.chain));
}

export function useLatestBlockQuery(
  param: UseLatestBlockQueryParams,
  options: Omit<
    UseQueryOptions<LatestBlock, Error, LatestBlock, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.latestBlock(param),
    queryFn: async () => fetchLatestBlock(client, param),
    ...options,
  });
}

export function useCachedLatestBlock(param: UseLatestBlockQueryParams) {
  const queryClient = useQueryClient();
  const key = QueryKeys.latestBlock(param);
  return {
    data: queryClient.getQueryData<LatestBlock>(key),
    dataUpdatedAt: queryClient.getQueryState(key)?.dataUpdatedAt ?? 0,
  };
}

export function useLatestBlockCacheReader(param: UseLatestBlockQueryParams) {
  const queryClient = useQueryClient();
  return useCallback(() => {
    const key = QueryKeys.latestBlock(param);
    return {
      data: queryClient.getQueryData<LatestBlock>(key),
      dataUpdatedAt: queryClient.getQueryState(key)?.dataUpdatedAt ?? 0,
    };
  }, [param, queryClient]);
}
