"use client";

import { PropsWithChildren, useMemo } from "react";
import Cookies from "js-cookie";
import { DexClientProvider as ApiClientProvider } from "@liberfi.io/react";
import { PolymarketProvider, PredictProvider } from "@liberfi.io/react-predict";
import { ChannelsProvider } from "@liberfi.io/ui-channels";
import { MediaTrackProvider } from "@liberfi.io/ui-media-track";
import { PerpetualsProvider } from "@liberfi.io/ui-perpetuals";
import { PortfolioClientProvider, PortfolioProvider } from "@liberfi.io/ui-portfolio";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAuth, useConnectedWallet } from "@liberfi.io/wallet-connector";
import { DexClientProvider } from "@liberfi/react-dex";
import { PinataProvider, useDexTokenProvider } from "@liberfi/ui-base";
import { HyperliquidAccountStateSync } from "../components/HyperliquidAccountStateSync";
import { pinata } from "../libs/pinata";
import { RuntimeConfig } from "./app-runtime.types";
import { readRuntimeConfig } from "./readRuntimeConfig";
import { useAppClientBundle } from "./useAppClientBundle";

export interface AppRuntimeProvidersProps extends PropsWithChildren {
  config?: RuntimeConfig;
}

export function AppRuntimeProviders({
  children,
  config: configOverride,
}: AppRuntimeProvidersProps) {
  const config = useMemo(() => configOverride ?? readRuntimeConfig(), [configOverride]);
  const dexTokenLoader = useMemo(
    () => ({
      async set(token: string, expiresAt: Date) {
        Cookies.set("dex-token", token, {
          expires: expiresAt,
          secure: true,
          sameSite: "strict",
        });
      },
      async get() {
        return Cookies.get("dex-token") ?? null;
      },
    }),
    [],
  );
  const dexTokenProvider = useDexTokenProvider(dexTokenLoader);
  const { user } = useAuth();
  const channelsAccessToken = user?.accessToken ?? null;
  const channelsTokenProvider = useMemo(
    () => ({ getToken: async () => channelsAccessToken }),
    [channelsAccessToken],
  );
  const clients = useAppClientBundle({
    config,
    dexTokenProvider,
    channelsTokenProvider,
  });
  const { chain } = useCurrentChain();
  const wallet = useConnectedWallet(chain);

  return (
    <PinataProvider client={pinata}>
      <DexClientProvider client={clients.chainStream}>
        <ApiClientProvider client={clients.api} subscribeClient={clients.api}>
          <MediaTrackProvider client={clients.mediaTrack}>
            <ChannelsProvider client={clients.channels}>
              <PredictProvider client={clients.predict} wsClient={clients.predictWs}>
                <PolymarketProvider>
                  <PortfolioClientProvider client={clients.portfolio}>
                    <PortfolioProvider chain={chain} address={wallet?.address ?? ""}>
                      <PerpetualsProvider
                        client={clients.perpetuals}
                        depositClient={clients.perpetualDeposit}
                      >
                        <HyperliquidAccountStateSync />
                        {children}
                      </PerpetualsProvider>
                    </PortfolioProvider>
                  </PortfolioClientProvider>
                </PolymarketProvider>
              </PredictProvider>
            </ChannelsProvider>
          </MediaTrackProvider>
        </ApiClientProvider>
      </DexClientProvider>
    </PinataProvider>
  );
}
