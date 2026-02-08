import { useAuth as useWalletConnectorAuth } from "@liberfi.io/wallet-connector";
import { useMemo } from "react";
import { Chain } from "@liberfi.io/types";

export function useAuth() {
  const { user, status, signIn, signOut, refreshAccessToken } = useWalletConnectorAuth();

  return useMemo(() => {
    const solanaAddress = user?.wallets?.find((w) => w.chain === Chain.SOLANA)?.address ?? null;
    return {
      user: {
        ...user,
        solanaAddress,
      },
      status,
      signIn,
      signOut,
      refreshAccessToken,
    };
  }, [user, status, signIn, signOut, refreshAccessToken]);
}
