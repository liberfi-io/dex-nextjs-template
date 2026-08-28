"use client";

import { useMemo } from "react";
import { Chain } from "@liberfi.io/types";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAuth } from "@liberfi.io/wallet-connector";

export function useCurrentWalletAddress() {
  const { chain } = useCurrentChain();
  const { user } = useAuth();

  return useMemo(() => {
    switch (chain) {
      case Chain.SOLANA:
        return user?.wallets?.find((wallet) => wallet.chain === Chain.SOLANA)?.address ?? null;
      default:
        return null;
    }
  }, [chain, user]);
}
