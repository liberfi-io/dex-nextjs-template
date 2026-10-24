"use client";

import { useMemo } from "react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { formatAmount } from "@liberfi.io/utils";
import { useCurrentWalletAddress } from "./useCurrentWalletAddress";
import { useWalletPortfolios } from "./useWalletPortfolios";

export function formatWalletPrimaryTokenBalance(amount: string | undefined) {
  return amount === undefined ? "--" : formatAmount(amount);
}

export function useWalletPrimaryTokenNetWorth() {
  const { chain } = useCurrentChain();
  const walletAddress = useCurrentWalletAddress();
  const { data: walletPortfolios, isError } = useWalletPortfolios();

  return useMemo(
    () =>
      !isError &&
      walletAddress &&
      walletPortfolios?.chain === chain &&
      walletPortfolios.address.toLowerCase() === walletAddress.toLowerCase()
        ? { amount: walletPortfolios.balanceInNative }
        : undefined,
    [chain, isError, walletAddress, walletPortfolios],
  );
}
