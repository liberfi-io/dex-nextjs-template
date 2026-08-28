import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { Chain } from "@liberfi.io/types";
import {
  TransferApiError,
  chainToTransferSymbol,
  postTransfer,
} from "./transferRestClient";

export type CreateTransferTransactionInput = {
  chain: Chain;
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
};

export type UnsignedTransferTransaction = {
  serializedTx: string;
  estimatedFee?: string;
};

export async function createTransferTransaction(
  input: CreateTransferTransactionInput,
  signal?: AbortSignal,
): Promise<UnsignedTransferTransaction> {
  const symbol = chainToTransferSymbol(input.chain);
  if (!symbol) {
    throw new TransferApiError(
      400,
      "unsupported_chain",
      `Chain ${input.chain} is not supported by the transfer API`,
    );
  }
  return postTransfer<Omit<CreateTransferTransactionInput, "chain">, UnsignedTransferTransaction>(
    symbol,
    "build",
    {
      sourceAddress: input.sourceAddress,
      destinationAddress: input.destinationAddress,
      amount: input.amount,
    },
    signal,
  );
}

export const useCreateTransferTransactionMutation = (
  options: Omit<
    UseMutationOptions<UnsignedTransferTransaction, Error, CreateTransferTransactionInput>,
    "mutationFn"
  > = {},
) => {
  return useMutation({
    ...options,
    mutationFn: async (input: CreateTransferTransactionInput) => {
      return await createTransferTransaction(input);
    },
  });
};
