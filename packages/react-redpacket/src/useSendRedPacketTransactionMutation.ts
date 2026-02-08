import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ChainStreamClient, RedPacketSendTxResponse } from "@chainstream-io/sdk";
import { chainParam, useDexClient } from "@liberfi/react-dex";
import { SendRedPacketTransactionParams } from "./types";

export async function sendRedPacketTransaction(
  client: ChainStreamClient,
  { chain, ...sendInputTx }: SendRedPacketTransactionParams,
) {
  return await client.redPacket.redpacketSend(chainParam(chain), sendInputTx);
}

export function useSendRedPacketTransactionMutation(
  options: Omit<
    UseMutationOptions<RedPacketSendTxResponse, Error, SendRedPacketTransactionParams>,
    "mutationFn"
  > = {},
) {
  const client = useDexClient();

  return useMutation({
    mutationFn: (params: SendRedPacketTransactionParams) =>
      sendRedPacketTransaction(client, params),
    ...options,
  });
}
