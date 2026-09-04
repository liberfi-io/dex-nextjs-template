"use client";

import { PropsWithChildren, useMemo } from "react";
import { PerpetualsProvider } from "@liberfi.io/ui-perpetuals";
import {
  useWallets,
  type EvmWalletAdapter,
} from "@liberfi.io/wallet-connector";
import { HyperliquidAccountStateSync } from "../components/HyperliquidAccountStateSync";
import { DeferredAsyncModalHost } from "../components/modals/DeferredAsyncModalHost";
import { useHyperliquidBalances } from "../hooks/useHyperliquidBalances";
import { createPerpetualsClients } from "./createPerpetualsClients";
import { useAppRuntimeConfig } from "./AppRuntimeProviders";
import { HyperliquidHeaderContext } from "./HyperliquidHeaderContext";

function HyperliquidHeaderStateProvider({ children }: PropsWithChildren) {
  const wallets = useWallets();
  const evmWallet = useMemo(
    () =>
      wallets.find((wallet) => wallet.chainNamespace === "EVM") as
        | EvmWalletAdapter
        | undefined,
    [wallets],
  );
  const balances = useHyperliquidBalances(evmWallet?.address);
  const state = useMemo(
    () => ({ evmAddress: evmWallet?.address, ...balances }),
    [balances, evmWallet?.address],
  );

  return (
    <HyperliquidHeaderContext.Provider value={state}>
      {children}
    </HyperliquidHeaderContext.Provider>
  );
}

export function PerpetualsRuntimeProviders({ children }: PropsWithChildren) {
  const config = useAppRuntimeConfig();
  const clients = useMemo(
    () =>
      createPerpetualsClients({
        perpetualsApiUrl: config.perpetualsApiUrl,
        perpetualsEnvironment: config.perpetualsEnvironment,
      }),
    [config.perpetualsApiUrl, config.perpetualsEnvironment],
  );

  return (
    <PerpetualsProvider
      client={clients.perpetuals}
      depositClient={clients.perpetualDeposit}
    >
      <HyperliquidAccountStateSync />
      <HyperliquidHeaderStateProvider>
        <DeferredAsyncModalHost>{children}</DeferredAsyncModalHost>
      </HyperliquidHeaderStateProvider>
    </PerpetualsProvider>
  );
}
