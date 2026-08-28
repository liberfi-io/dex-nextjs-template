import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { Chain } from "@liberfi.io/types";
import {
  TransferApiError,
  chainToTransferSymbol,
  postTransfer,
} from "./transferRestClient";

export type SendTransferTransactionInput = {
  chain: Chain;
  signedTx: string;
};

export type SignedTransferResult = {
  txSignature: string;
};

export async function sendTransferTransaction(
  input: SendTransferTransactionInput,
  signal?: AbortSignal,
): Promise<SignedTransferResult> {
  const symbol = chainToTransferSymbol(input.chain);
  if (!symbol) {
    throw new TransferApiError(
      400,
      "unsupported_chain",
      `Chain ${input.chain} is not supported by the transfer API`,
    );
  }
  return postTransfer<Omit<SendTransferTransactionInput, "chain">, SignedTransferResult>(
    symbol,
    "send",
    { signedTx: input.signedTx },
    signal,
  );
}

export const useSendTransferTransactionMutation = (
  options: Omit<
    UseMutationOptions<SignedTransferResult, Error, SendTransferTransactionInput>,
    "mutationFn"
  > = {},
) => {
  return useMutation({
    ...options,
    mutationFn: async (input: SendTransferTransactionInput) => {
      return await sendTransferTransaction(input);
    },
  });
};
