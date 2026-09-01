"use client";

import { useMemo } from "react";
import { useWalletPortfolios } from "./useWalletPortfolios";

export function useWalletPrimaryTokenNetWorth() {
  const { data: walletPortfolios } = useWalletPortfolios();

  return useMemo(
    () => (walletPortfolios ? { amount: walletPortfolios.balanceInNative } : undefined),
    [walletPortfolios],
  );
}
