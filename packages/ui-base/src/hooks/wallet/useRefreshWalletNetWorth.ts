import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { useWalletNetWorthQuery } from "@liberfi/react-dex";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { walletNetWorthAtom, walletNetWorthQueryStateAtom } from "../../states";
import { useCurrentWalletAddress } from "./useCurrentWalletAddress";

export function useRefreshWalletNetWorth() {
  const { chain } = useCurrentChain();

  // current active wallet address
  const walletAddress = useCurrentWalletAddress();

  // fetch wallet net worth & pnl periodically
  const { data, error, isLoading, isFetching, isRefetching, refetch } = useWalletNetWorthQuery(
    chain,
    walletAddress ?? "",
    {
      enabled: !!walletAddress,
      refetchInterval: 15e3,
    },
  );

  const setWalletNetWorthQueryState = useSetAtom(walletNetWorthQueryStateAtom);

  useEffect(() => {
    setWalletNetWorthQueryState({
      error,
      isLoading,
      isFetching,
      isRefetching,
      refetch,
    });
  }, [error, isLoading, isFetching, isRefetching, refetch, setWalletNetWorthQueryState]);

  // sync latest wallet balances to atom
  const setWalletNetWorth = useSetAtom(walletNetWorthAtom);

  useEffect(() => {
    if (data) {
      setWalletNetWorth(data);
    }
  }, [data, setWalletNetWorth]);
}
