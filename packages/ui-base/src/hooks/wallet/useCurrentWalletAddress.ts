import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { CHAIN_ID } from "@liberfi/core";
import { chainAtom } from "../../states";
import { Chain } from "@liberfi.io/types";
import { useAuth } from "../useAuth";

/**
 * Get the current active wallet address
 */
export function useCurrentWalletAddress() {
  const chain = useAtomValue(chainAtom);

  const { user } = useAuth();

  const walletAddress = useMemo(() => {
    switch (chain) {
      case CHAIN_ID.SOLANA:
        return user?.wallets?.find((w) => w.chain === Chain.SOLANA)?.address ?? null;
      default:
        return null;
    }
  }, [chain, user]);

  return walletAddress;
}
