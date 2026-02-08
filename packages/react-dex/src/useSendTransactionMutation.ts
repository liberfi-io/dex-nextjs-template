import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ChainStreamClient, SendTxResponse } from "@chainstream-io/sdk";
import { useDexClient } from "./DexClientProvider";
import { UseSendTransactionMutationParams } from "./types";
import { chainParam } from "./utils";

export async function sendTransaction(client: ChainStreamClient, param: UseSendTransactionMutationParams) {
  const { chain, ...rest } = param;
  return await client.transaction.send(chainParam(chain), rest);
}

export function useSendTransactionMutation(
  options: Omit<
    UseMutationOptions<SendTxResponse, Error, UseSendTransactionMutationParams>,
    "mutationFn"
  > = {},
) {
  const client = useDexClient();
  return useMutation({
    mutationFn: async (param: UseSendTransactionMutationParams) => sendTransaction(client, param),
    ...options,
  });
}
