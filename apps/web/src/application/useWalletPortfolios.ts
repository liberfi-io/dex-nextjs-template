"use client";

import { useWalletPortfoliosQuery } from "@liberfi.io/react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useCurrentWalletAddress } from "./useCurrentWalletAddress";

export function useWalletPortfolios() {
  const { chain } = useCurrentChain();
  const walletAddress = useCurrentWalletAddress();

  return useWalletPortfoliosQuery(
    { chain, address: walletAddress ?? "" },
    { enabled: !!walletAddress },
  );
}
