import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, RedPacketClaimsPage } from "@chainstream-io/sdk";
import { useDexClient } from "@liberfi/react-dex";
import { FetchRedPacketClaimsParams } from "./types";
import { QueryKeys } from "./queryKeys";

export async function fetchRedPacketClaims(client: ChainStreamClient, params: FetchRedPacketClaimsParams) {
  return await client.redPacket.getClaims(params.redPacketId, {
    cursor: params.cursor,
    limit: params.limit,
    direction: params.direction,
  });
}

export function useRedPacketClaimsQuery(
  params: FetchRedPacketClaimsParams,
  options: Omit<
    UseQueryOptions<RedPacketClaimsPage, Error, RedPacketClaimsPage, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.redPacketClaims(params),
    queryFn: () => fetchRedPacketClaims(client, params),
    ...options,
  });
}
