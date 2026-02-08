import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { getPrimaryTokenAddress } from "@liberfi/core";
import { WalletBalancesDTO } from "@chainstream-io/sdk";
import { chainAtom, walletBalancesAtom } from "@/states";

type WalletBalance = NonNullable<WalletBalancesDTO["balances"]>[number];

export function useWalletPrimaryTokenBalance() {
  const chain = useAtomValue(chainAtom);
  const primaryTokenAddress = getPrimaryTokenAddress(chain);
  const walletBalances = useAtomValue(walletBalancesAtom);

  const primaryTokenBalance = useMemo(
    () => walletBalances?.balances?.find((b: WalletBalance) => b.tokenAddress === primaryTokenAddress),
    [walletBalances, primaryTokenAddress],
  );
  return primaryTokenBalance;
}
