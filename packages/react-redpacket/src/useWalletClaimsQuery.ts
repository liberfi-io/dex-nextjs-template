import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, RedPacketClaimsPage } from "@chainstream-io/sdk";
import { useDexClient } from "@liberfi/react-dex";
import { FetchWalletClaimsParams } from "./types";
import { QueryKeys } from "./queryKeys";

export async function fetchWalletClaims(client: ChainStreamClient, params: FetchWalletClaimsParams) {
  return await client.redPacket.getClaimsByAddress(params.address, {
    cursor: params.cursor,
    limit: params.limit,
    direction: params.direction,
  });
}

export function useWalletClaimsQuery(
  params: FetchWalletClaimsParams,
  options: Omit<
    UseQueryOptions<RedPacketClaimsPage, Error, RedPacketClaimsPage, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.walletClaims(params),
    queryFn: () => fetchWalletClaims(client, params),
    ...options,
  });
}
