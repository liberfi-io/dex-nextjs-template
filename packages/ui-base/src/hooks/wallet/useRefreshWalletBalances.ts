import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useDexClient, useWalletBalanceQuery } from "@liberfi/react-dex";
import { chainAtom, walletBalancesAtom, walletBalancesQueryStateAtom } from "@/states";
import { useCurrentWalletAddress } from "./useCurrentWalletAddress";

/**
 * Refetch wallet balances repeatedly & subscribe to wallet balances changes
 */
export function useRefreshWalletBalances() {
  const chain = useAtomValue(chainAtom);

  // current active wallet address
  const walletAddress = useCurrentWalletAddress();

  // fetch wallet balances periodically
  const { data, error, isLoading, isFetching, isRefetching, refetch } = useWalletBalanceQuery(
    chain,
    walletAddress ?? "",
    {
      enabled: !!walletAddress,
      refetchInterval: 15e3,
    },
  );

  const setWalletBalancesQueryState = useSetAtom(walletBalancesQueryStateAtom);

  useEffect(() => {
    setWalletBalancesQueryState({
      error,
      isLoading,
      isFetching,
      isRefetching,
      refetch,
    });
  }, [error, isLoading, isFetching, isRefetching, refetch, setWalletBalancesQueryState]);

  // sync latest wallet balances to atom
  const setWalletBalances = useSetAtom(walletBalancesAtom);

  useEffect(() => {
    if (data) {
      setWalletBalances(data);
    }
  }, [data, setWalletBalances]);

  // subscribe to wallet balances changes
  const dexClient = useDexClient();

  useEffect(() => {
    if (!walletAddress) return;

    const balancesSubscription = dexClient.stream.subscribeWalletBalance({
      chain,
      walletAddress,
      callback: (data) => {
        console.debug("wallet balances changed:", data);
      },
    });

    const pnlSubscription = dexClient.stream.subscribeWalletPnl({
      chain,
      walletAddress,
      callback: (data) => {
        console.debug("wallet pnl changed:", data);
      },
    });

    return () => {
      balancesSubscription.unsubscribe();
      pnlSubscription.unsubscribe();
    };
  }, [dexClient, chain, walletAddress]);
}
