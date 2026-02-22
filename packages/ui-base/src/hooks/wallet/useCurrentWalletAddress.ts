import { useMemo } from "react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { Chain } from "@liberfi.io/types";
import { useAuth } from "../useAuth";

/**
 * Get the current active wallet address
 */
export function useCurrentWalletAddress() {
  const { chain } = useCurrentChain();

  const { user } = useAuth();

  const walletAddress = useMemo(() => {
    switch (chain) {
      case Chain.SOLANA:
        return user?.wallets?.find((w) => w.chain === Chain.SOLANA)?.address ?? null;
      default:
        return null;
    }
  }, [chain, user]);

  return walletAddress;
}
