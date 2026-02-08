import { chainAtom } from "@/states";
import { useAuth } from "./useAuth";
import { useAtomValue } from "jotai";
import { CHAIN_ID } from "@liberfi/core";
import { Chain } from "@liberfi.io/types";
import { useMemo } from "react";

export function useWallet() {
  const { user } = useAuth();

  const chain = useAtomValue(chainAtom);

  const wallet = useMemo(() => {
    switch (chain) {
      case CHAIN_ID.SOLANA:
        return user?.wallets?.find((w) => w.chain === Chain.SOLANA);
    }
  }, [user, chain]);

  return wallet;
}
