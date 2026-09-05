"use client";

import {
  createContext,
  type ComponentType,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import Cookies from "js-cookie";
import { DexClientProvider as ApiClientProvider } from "@liberfi.io/react";
import { ChannelsProvider } from "@liberfi.io/ui-channels";
import { MediaTrackProvider } from "@liberfi.io/ui-media-track";
import { PortfolioProvider } from "@liberfi.io/ui-portfolio";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAuth, useConnectedWallet } from "@liberfi.io/wallet-connector";
import { PinataProvider } from "../application/pinata";
import { PrimaryTokenPricePoller } from "../application/PrimaryTokenPricePoller";
import { useDexTokenProvider } from "../application/useDexTokenProvider";
import { pinata } from "../libs/pinata";
import {
  type CapabilityBundleV1,
  type CoreAppClientBundle,
  RuntimeConfig,
} from "./app-runtime.types";
import { readRuntimeConfig } from "./readRuntimeConfig";
import { Stage51AdaptersProvider } from "./Stage51AdaptersProvider";
import { Stage53AdaptersProvider } from "./Stage53AdaptersProvider";
import { Stage55AdaptersProvider } from "./Stage55AdaptersProvider";
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
    client: CoreAppClientBundle["api"];
    subscribeClient: CoreAppClientBundle["api"];
    capabilities: ReactCapabilityInput;
  }>
>;

const AppRuntimeConfigContext = createContext<RuntimeConfig | null>(null);

export function useAppRuntimeConfig(): RuntimeConfig {
  const config = useContext(AppRuntimeConfigContext);
  if (!config) {
    throw new Error("useAppRuntimeConfig must be used within AppRuntimeProviders");
  }
  return config;
}

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
      async remove() {
        Cookies.remove("dex-token", {
          secure: true,
          sameSite: "strict",
        });
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
  const reactCapabilities = useMemo(
    () => projectReactCapabilities(clients.capabilities),
    [clients.capabilities],
  );
  const { chain } = useCurrentChain();
  const wallet = useConnectedWallet(chain);

  return (
    <AppRuntimeConfigContext.Provider value={config}>
      <PinataProvider client={pinata}>
        <CapabilityClientProvider
          client={clients.api}
          subscribeClient={clients.api}
          capabilities={reactCapabilities}
        >
          <PrimaryTokenPricePoller />
          <Stage51AdaptersProvider api={clients.api}>
            <Stage53AdaptersProvider>
              <Stage55AdaptersProvider client={clients.chainStream} origin={config.origin}>
                <MediaTrackProvider client={clients.mediaTrack}>
                  <ChannelsProvider client={clients.channels}>
                    <PortfolioProvider chain={chain} address={wallet?.address ?? ""}>
                      {children}
                    </PortfolioProvider>
                  </ChannelsProvider>
                </MediaTrackProvider>
              </Stage55AdaptersProvider>
            </Stage53AdaptersProvider>
          </Stage51AdaptersProvider>
        </CapabilityClientProvider>
      </PinataProvider>
    </AppRuntimeConfigContext.Provider>
  );
}
