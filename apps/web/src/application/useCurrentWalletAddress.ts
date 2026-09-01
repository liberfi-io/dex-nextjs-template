"use client";

import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useConnectedWallet } from "@liberfi.io/wallet-connector";

export function useCurrentWalletAddress() {
  const { chain } = useCurrentChain();
  return useConnectedWallet(chain)?.address ?? null;
}
