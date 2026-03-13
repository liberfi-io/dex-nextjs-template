import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, RedPacket } from "@chainstream-io/sdk";
import { useDexClient } from "@liberfi/react-dex";
import { QueryKeys } from "./queryKeys";

export async function fetchRedPacket(client: ChainStreamClient, idOrShareId: string) {
  return await client.redPacket.getRedpacket(idOrShareId);
}

export function useRedPacketQuery(
  idOrShareId: string,
  options: Omit<
    UseQueryOptions<RedPacket, Error, RedPacket, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();

  return useQuery({
    queryKey: QueryKeys.redPacket(idOrShareId),
    queryFn: () => fetchRedPacket(client, idOrShareId),
    ...options,
  });
}
