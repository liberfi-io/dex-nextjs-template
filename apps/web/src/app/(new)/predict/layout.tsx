"use client";

import { UserPredictProvider } from "@liberfi.io/ui-predict";
import { useConnectedWallet } from "@liberfi.io/wallet-connector";
import { Chain } from "@liberfi.io/types";

export default function PredictLayout({ children }: { children: React.ReactNode }) {
  const wallet = useConnectedWallet(Chain.SOLANA)

  return (
    <UserPredictProvider walletAddress={wallet?.address ?? ""} enabled={!!wallet}>
      {children}
    </UserPredictProvider>
  );
}
