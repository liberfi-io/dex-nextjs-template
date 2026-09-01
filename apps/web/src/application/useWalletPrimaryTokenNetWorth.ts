"use client";

import { useMemo } from "react";
import { formatAmount } from "@liberfi.io/utils";
import { useWalletPortfolios } from "./useWalletPortfolios";

export function formatWalletPrimaryTokenBalance(amount: string | undefined) {
  return amount === undefined ? "--" : formatAmount(amount);
}

export function useWalletPrimaryTokenNetWorth() {
  const { data: walletPortfolios, isError } = useWalletPortfolios();

  return useMemo(
    () =>
      !isError && walletPortfolios
        ? { amount: walletPortfolios.balanceInNative }
        : undefined,
    [isError, walletPortfolios],
  );
}
