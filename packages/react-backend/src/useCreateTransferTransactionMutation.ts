import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { Chain } from "@liberfi.io/types";

import {
  TransferApiError,
  chainToTransferSymbol,
  postTransfer,
} from "./transferRestClient";

/**
 * Input for `useCreateTransferTransactionMutation`.
 *
 * `chain` is mapped to the dex-server URL path parameter (`sol`/`eth`/`bsc`).
 * `amount` is in the chain's smallest unit (lamports for Solana, wei for
 * EVM) as a decimal string; using a string avoids JSON precision loss
 * for large EVM values.
 */
export type CreateTransferTransactionInput = {
  chain: Chain;
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
};

/**
 * Backend response — base64-encoded raw transaction bytes ready for the
 * wallet adapter to sign.
 *
 * `estimatedFee` is reserved: the dex-server MVP does not compute a
 * client-facing fee yet, but the field is kept here so existing UIs
 * (e.g. `PreviewModal` in `@liberfi/ui-dex`) keep type-checking and we
 * can populate it once the backend surfaces a value.
 */
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
  return postTransfer<
    Omit<CreateTransferTransactionInput, "chain">,
    UnsignedTransferTransaction
  >(
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

/**
 * Build an unsigned native-token transfer via dex-server.
 *
 * Note: this hook used to wrap a GraphQL mutation against the chainstream
 * backend. It now talks directly to the local Go service via the
 * `/dex-tx-api/*` Next.js rewrite. Hook signature is preserved (input
 * adds a `chain` field, `mintAddress` removed) so consumers update their
 * call sites once and the rest of the API surface stays familiar.
 */
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
