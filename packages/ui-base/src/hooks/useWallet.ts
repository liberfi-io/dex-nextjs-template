import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAuth } from "./useAuth";
import { Chain } from "@liberfi.io/types";
import { useMemo } from "react";

export function useWallet() {
  const { user } = useAuth();

  const { chain } = useCurrentChain();

  const wallet = useMemo(() => {
    switch (chain) {
      case Chain.SOLANA:
        return user?.wallets?.find((w) => w.chain === Chain.SOLANA);
    }
  }, [user, chain]);

  return wallet;
}
