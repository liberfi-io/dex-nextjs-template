import { useDexClient, waitForJob } from "@liberfi/react-dex";
import { useCallback } from "react";

export interface TransactionConfirmation {
  id: string;
  status: string;
  result: { success: boolean };
}

export function useWaitForTransactionConfirmation() {
  const dexClient = useDexClient();

  return useCallback(
    async (
      txHash: string,
      onSuccess?: (result: TransactionConfirmation) => void,
      onError?: (error: unknown) => void,
    ): Promise<TransactionConfirmation> => {
      try {
        const result = await waitForJob<TransactionConfirmation>(dexClient, txHash);
        onSuccess?.(result);
        return result;
      } catch (e) {
        console.error("wait for transaction confirmation error", e);
        onError?.(e);
        throw e;
      }
    },
    [dexClient],
  );
}
