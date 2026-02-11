import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useWalletPnlQuery } from "@liberfi/react-dex";
import { chainAtom, walletPnlAtom, walletPnlQueryStateAtom } from "@/states";
import { useCurrentWalletAddress } from "./useCurrentWalletAddress";

export function useRefreshWalletPnl() {
  const chain = useAtomValue(chainAtom);

  // current active wallet address
  const walletAddress = useCurrentWalletAddress();

  // fetch wallet pnl periodically
  const { data, error, isLoading, isFetching, isRefetching, refetch } = useWalletPnlQuery(
    chain,
    walletAddress ?? "",
    {
      enabled: !!walletAddress,
      refetchInterval: 15e3,
    },
  );

  const setWalletPnlQueryState = useSetAtom(walletPnlQueryStateAtom);

  useEffect(() => {
    setWalletPnlQueryState({
      error,
      isLoading,
      isFetching,
      isRefetching,
      refetch,
    });
  }, [error, isLoading, isFetching, isRefetching, refetch, setWalletPnlQueryState]);

  // sync latest wallet balances to atom
  const setWalletPnl = useSetAtom(walletPnlAtom);

  useEffect(() => {
    if (data) {
      setWalletPnl(data);
    }
  }, [data, setWalletPnl]);
}
