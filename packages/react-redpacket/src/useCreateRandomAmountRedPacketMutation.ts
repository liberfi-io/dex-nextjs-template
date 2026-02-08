import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ChainStreamClient, RedPacketReply } from "@chainstream-io/sdk";
import { chainParam, useDexClient } from "@liberfi/react-dex";
import { CreateRandomAmountRedPacketParams } from "./types";

export async function createRandomAmountRedPacket(
  client: ChainStreamClient,
  params: CreateRandomAmountRedPacketParams,
) {
  const chain = chainParam(params.chain);
  return await client.redPacket.createRedpacket(chain, {
    chain,
    creator: params.creator,
    mint: params.mint,
    maxClaims: params.maxClaims,
    totalAmount: params.totalAmount,
    memo: params.memo,
    password: params.password,
    claimAuthority: params.claimAuthority,
  });
}

export function useCreateRandomAmountRedPacketMutation(
  options: Omit<
    UseMutationOptions<RedPacketReply, Error, CreateRandomAmountRedPacketParams>,
    "mutationFn"
  > = {},
) {
  const client = useDexClient();
  return useMutation({
    mutationFn: async (param: CreateRandomAmountRedPacketParams) =>
      createRandomAmountRedPacket(client, param),
    ...options,
  });
}
