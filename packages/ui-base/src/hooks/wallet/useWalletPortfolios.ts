import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useWalletPortfoliosQuery } from "@liberfi.io/react";
import { useCurrentWalletAddress } from "./useCurrentWalletAddress";

// TODO: 当前先用大 limit 一页取完所有 token，后续提供按 token 批量查询 portfolios 接口后再替换为精确查询
export function useWalletPortfolios() {
  const { chain } = useCurrentChain();
  const walletAddress = useCurrentWalletAddress();

  return useWalletPortfoliosQuery(
    { chain, address: walletAddress ?? "" },
    { enabled: !!walletAddress },
  );
}
