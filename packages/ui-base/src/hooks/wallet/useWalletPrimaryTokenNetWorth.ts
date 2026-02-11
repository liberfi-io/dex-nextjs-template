import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { getPrimaryTokenAddress } from "@liberfi/core";
import { chainAtom, walletNetWorthAtom } from "@/states";
import { WalletNetWorthItemDTO } from "@chainstream-io/sdk";

export function useWalletPrimaryTokenNetWorth() {
  const chain = useAtomValue(chainAtom);
  const primaryTokenAddress = getPrimaryTokenAddress(chain);
  const walletNetWorth = useAtomValue(walletNetWorthAtom);

  const primaryTokenNetWorth = useMemo(
    () => walletNetWorth?.data?.find((b: WalletNetWorthItemDTO) => b.tokenAddress === primaryTokenAddress),
    [walletNetWorth, primaryTokenAddress],
  );
  return primaryTokenNetWorth;
}
