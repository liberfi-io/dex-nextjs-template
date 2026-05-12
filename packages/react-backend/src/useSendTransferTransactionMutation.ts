import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { Chain } from "@liberfi.io/types";

import {
  TransferApiError,
  chainToTransferSymbol,
  postTransfer,
} from "./transferRestClient";

/**
 * Input for `useSendTransferTransactionMutation`.
 *
 * `signedTx` encoding is chain-specific:
 *   - Solana: base64-encoded fully-signed VersionedTransaction
 *   - EVM:    `0x`-prefixed hex of the fully-signed RLP transaction
 */
export type SendTransferTransactionInput = {
  chain: Chain;
  signedTx: string;
};

/**
 * Backend response — the network-issued signature/hash. For Solana this
 * is a base58 signature; for EVM it is a `0x`-prefixed 32-byte hash.
 */
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
  return postTransfer<
    Omit<SendTransferTransactionInput, "chain">,
    SignedTransferResult
  >(symbol, "send", { signedTx: input.signedTx }, signal);
}

/**
 * Broadcast a fully-signed native-token transfer via dex-server.
 *
 * See `useCreateTransferTransactionMutation` for the surrounding
 * Build → Sign → Send flow.
 */
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
