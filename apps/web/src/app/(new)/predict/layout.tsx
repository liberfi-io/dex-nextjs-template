"use client";

import { PredictWalletProvider } from "@liberfi.io/ui-predict";

export default function PredictLayout({ children }: { children: React.ReactNode }) {
  return <PredictWalletProvider>{children}</PredictWalletProvider>;
}
