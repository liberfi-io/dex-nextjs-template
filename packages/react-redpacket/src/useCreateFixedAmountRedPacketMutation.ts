import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ChainStreamClient, RedPacketReply } from "@chainstream-io/sdk";
import { chainParam, useDexClient } from "@liberfi/react-dex";
import { CreateFixedAmountRedPacketParams } from "./types";

export async function createFixedAmountRedPacket(
  client: ChainStreamClient,
  params: CreateFixedAmountRedPacketParams,
) {
  const chain = chainParam(params.chain);
  return await client.redPacket.createRedpacket(chain, {
    chain,
    creator: params.creator,
    mint: params.mint,
    maxClaims: params.maxClaims,
    fixedAmount: params.fixedAmount,
    memo: params.memo,
    password: params.password,
    claimAuthority: params.claimAuthority,
  });
}

export function useCreateFixedAmountRedPacketMutation(
  options: Omit<
    UseMutationOptions<RedPacketReply, Error, CreateFixedAmountRedPacketParams>,
    "mutationFn"
  > = {},
) {
  const client = useDexClient();
  return useMutation({
    mutationFn: async (param: CreateFixedAmountRedPacketParams) =>
      createFixedAmountRedPacket(client, param),
    ...options,
  });
}
