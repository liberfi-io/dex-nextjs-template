import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { walletNetWorthAtom } from "../../states";
import { WalletNetWorthItemDTO } from "@chainstream-io/sdk";

export function useWalletTokenNetWorth(tokenAddress: string) {
  const walletNetWorth = useAtomValue(walletNetWorthAtom);
  const tokenNetWorth = useMemo(
    () => walletNetWorth?.data?.find((b: WalletNetWorthItemDTO) => b.tokenAddress === tokenAddress),
    [walletNetWorth, tokenAddress],
  );
  return tokenNetWorth;
}
