import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, RedPacketsPage } from "@chainstream-io/sdk";
import { useDexClient } from "@liberfi/react-dex";
import { FetchWalletRedPacketsParams } from "./types";
import { QueryKeys } from "./queryKeys";

export async function fetchWalletRedPackets(
  client: ChainStreamClient,
  params: FetchWalletRedPacketsParams,
) {
  return await client.redPacket.getRedpacketsByAddress(params.address, {
    cursor: params.cursor,
    limit: params.limit,
    direction: params.direction,
  });
}

export function useWalletRedPacketsQuery(
  params: FetchWalletRedPacketsParams,
  options: Omit<
    UseQueryOptions<RedPacketsPage, Error, RedPacketsPage, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.walletRedPackets(params),
    queryFn: () => fetchWalletRedPackets(client, params),
    ...options,
  });
}
