import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { useWalletPnlDetailsQuery } from "@liberfi/react-dex";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { walletPnlDetailsAtom, walletPnlDetailsQueryStateAtom } from "../../states";
import { useCurrentWalletAddress } from "./useCurrentWalletAddress";

export function useRefreshWalletPnlDetails() {
  const { chain } = useCurrentChain();

  // current active wallet address
  const walletAddress = useCurrentWalletAddress();

  // fetch wallet pnl periodically
  const { data, error, isLoading, isFetching, isRefetching, refetch } = useWalletPnlDetailsQuery(
    chain,
    walletAddress ?? "",
    {
      enabled: !!walletAddress,
      refetchInterval: 15e3,
    },
  );

  const setWalletPnlDetailsQueryState = useSetAtom(walletPnlDetailsQueryStateAtom);

  useEffect(() => {
    setWalletPnlDetailsQueryState({
      error,
      isLoading,
      isFetching,
      isRefetching,
      refetch,
    });
  }, [error, isLoading, isFetching, isRefetching, refetch, setWalletPnlDetailsQueryState]);

  // sync latest wallet balances to atom
  const setWalletPnlDetails = useSetAtom(walletPnlDetailsAtom);

  useEffect(() => {
    if (data) {
      setWalletPnlDetails(data);
    }
  }, [data, setWalletPnlDetails]);
}
