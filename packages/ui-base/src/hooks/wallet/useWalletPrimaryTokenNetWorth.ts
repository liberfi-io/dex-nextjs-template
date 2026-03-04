import { useMemo } from "react";
import { getPrimaryTokenAddress } from "@liberfi/core";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useWalletPortfolios } from "./useWalletPortfolios";

export function useWalletPrimaryTokenNetWorth() {
  const { chain } = useCurrentChain();
  const primaryTokenAddress = getPrimaryTokenAddress(chain);
  const { data: walletPortfolios } = useWalletPortfolios();

  const primaryTokenPortfolio = useMemo(
    () => walletPortfolios?.portfolios?.find((p) => p.address === primaryTokenAddress),
    [walletPortfolios, primaryTokenAddress],
  );
  return primaryTokenPortfolio;
}
