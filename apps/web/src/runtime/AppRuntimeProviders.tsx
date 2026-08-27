"use client";

import { type ComponentType, PropsWithChildren, useMemo } from "react";
import Cookies from "js-cookie";
import { DexClientProvider as ApiClientProvider } from "@liberfi.io/react";
import { PolymarketProvider } from "@liberfi.io/react-predict";
import { ChannelsProvider } from "@liberfi.io/ui-channels";
import { MediaTrackProvider } from "@liberfi.io/ui-media-track";
import { PerpetualsProvider } from "@liberfi.io/ui-perpetuals";
import { PortfolioClientProvider, PortfolioProvider } from "@liberfi.io/ui-portfolio";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAuth, useConnectedWallet } from "@liberfi.io/wallet-connector";
import { DexClientProvider } from "@liberfi/react-dex";
import { PinataProvider, useDexTokenProvider } from "@liberfi/ui-base";
import {
  browserDexDataScheduler,
  createChainStreamDexDataAdapter,
  DexDataProvider,
  DexDataRuntimeProvider,
} from "@liberfi/ui-dex";
import { HyperliquidAccountStateSync } from "../components/HyperliquidAccountStateSync";
import { pinata } from "../libs/pinata";
import { queryClient } from "../libs/queryClient";
import {
  type AppClientBundle,
  type CapabilityBundleV1,
  RuntimeConfig,
} from "./app-runtime.types";
import { readRuntimeConfig } from "./readRuntimeConfig";
import { Stage51AdaptersProvider } from "./Stage51AdaptersProvider";
import { Stage53AdaptersProvider } from "./Stage53AdaptersProvider";
import { Stage54AdaptersProvider } from "./Stage54AdaptersProvider";
import { useAppClientBundle } from "./useAppClientBundle";

export interface AppRuntimeProvidersProps extends PropsWithChildren {
  config?: RuntimeConfig;
}

type ReactCapabilityInput = {
  token: CapabilityBundleV1["token"];
  wallet: CapabilityBundleV1["wallet"];
  activity: CapabilityBundleV1["activity"];
  trade: CapabilityBundleV1["trade"];
  transaction: CapabilityBundleV1["transaction"];
  media: CapabilityBundleV1["media"];
  tokenSubscription: CapabilityBundleV1["subscription"]["token"];
  walletSubscription: CapabilityBundleV1["subscription"]["wallet"];
  activitySubscription: CapabilityBundleV1["subscription"]["activity"];
};

const CapabilityClientProvider = ApiClientProvider as ComponentType<
  PropsWithChildren<{
    client: AppClientBundle["api"];
    subscribeClient: AppClientBundle["api"];
    capabilities: ReactCapabilityInput;
  }>
>;

function projectReactCapabilities(
  bundle: CapabilityBundleV1,
): ReactCapabilityInput {
  return {
    token: bundle.token,
    wallet: bundle.wallet,
    activity: bundle.activity,
    trade: bundle.trade,
    transaction: bundle.transaction,
    media: bundle.media,
    tokenSubscription: bundle.subscription.token,
    walletSubscription: bundle.subscription.wallet,
    activitySubscription: bundle.subscription.activity,
  };
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
  const dexDataAdapter = useMemo(
    () => createChainStreamDexDataAdapter(clients.chainStream),
    [clients.chainStream],
  );
  const reactCapabilities = useMemo(
    () => projectReactCapabilities(clients.capabilities),
    [clients.capabilities],
  );
  const { chain } = useCurrentChain();
  const wallet = useConnectedWallet(chain);

  return (
    <PinataProvider client={pinata}>
      <DexClientProvider client={clients.chainStream}>
        <CapabilityClientProvider
          client={clients.api}
          subscribeClient={clients.api}
          capabilities={reactCapabilities}
        >
          <Stage51AdaptersProvider api={clients.api}>
            <Stage53AdaptersProvider>
              <Stage54AdaptersProvider
                client={clients.predict}
                wsClient={clients.predictWs}
                wsEnabled={config.predictWsEnabled}
              >
                <MediaTrackProvider client={clients.mediaTrack}>
                  <ChannelsProvider client={clients.channels}>
                    <PolymarketProvider>
                      <PortfolioClientProvider client={clients.portfolio}>
                        <PortfolioProvider chain={chain} address={wallet?.address ?? ""}>
                          <PerpetualsProvider
                            client={clients.perpetuals}
                            depositClient={clients.perpetualDeposit}
                          >
                            <HyperliquidAccountStateSync />
                            <DexDataRuntimeProvider
                              queryClient={queryClient}
                              adapter={dexDataAdapter}
                              scheduler={browserDexDataScheduler}
                            >
                              <DexDataProvider>{children}</DexDataProvider>
                            </DexDataRuntimeProvider>
                          </PerpetualsProvider>
                        </PortfolioProvider>
                      </PortfolioClientProvider>
                    </PolymarketProvider>
                  </ChannelsProvider>
                </MediaTrackProvider>
              </Stage54AdaptersProvider>
            </Stage53AdaptersProvider>
          </Stage51AdaptersProvider>
        </CapabilityClientProvider>
      </DexClientProvider>
    </PinataProvider>
  );
}
