import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ChainStreamClient, RedPacketReply } from "@chainstream-io/sdk";
import { chainParam, useDexClient } from "@liberfi/react-dex";
import { ClaimRedPacketParams } from "./types";

export async function claimRedPacket(client: ChainStreamClient, params: ClaimRedPacketParams) {
  const chain = chainParam(params.chain);
  return await client.redPacket.claimRedpacket(chain, {
    chain,
    shareId: params.shareId,
    password: params.password,
    claimer: params.claimer,
  });
}

export function useClaimRedPacketMutation(
  options: Omit<UseMutationOptions<RedPacketReply, Error, ClaimRedPacketParams>, "mutationFn"> = {},
) {
  const client = useDexClient();
  return useMutation({
    mutationFn: async (param: ClaimRedPacketParams) => claimRedPacket(client, param),
    ...options,
  });
}
