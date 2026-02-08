import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { WalletBalancesDTO } from "@chainstream-io/sdk";
import { walletBalancesAtom } from "@/states";

type WalletBalance = NonNullable<WalletBalancesDTO["balances"]>[number];

export function useWalletTokenBalance(tokenAddress: string) {
  const walletBalances = useAtomValue(walletBalancesAtom);
  const tokenBalance = useMemo(
    () => walletBalances?.balances?.find((b: WalletBalance) => b.tokenAddress === tokenAddress),
    [walletBalances, tokenAddress],
  );
  return tokenBalance;
}
