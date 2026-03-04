import { useMemo } from "react";
import { useWalletPortfolios } from "./useWalletPortfolios";

export function useWalletTokenNetWorth(tokenAddress: string) {
  const { data: walletPortfolios } = useWalletPortfolios();
  const tokenPortfolio = useMemo(
    () => walletPortfolios?.portfolios?.find((p) => p.address === tokenAddress),
    [walletPortfolios, tokenAddress],
  );
  return tokenPortfolio;
}
