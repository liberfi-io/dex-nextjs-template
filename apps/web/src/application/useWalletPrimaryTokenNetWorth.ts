"use client";

import { useMemo } from "react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { getPrimaryTokenAddress } from "./tokens";
import { useWalletPortfolios } from "./useWalletPortfolios";

export function useWalletPrimaryTokenNetWorth() {
  const { chain } = useCurrentChain();
  const primaryTokenAddress = getPrimaryTokenAddress(chain);
  const { data: walletPortfolios } = useWalletPortfolios();

  return useMemo(
    () => walletPortfolios?.portfolios?.find((portfolio) => portfolio.address === primaryTokenAddress),
    [walletPortfolios, primaryTokenAddress],
  );
}
