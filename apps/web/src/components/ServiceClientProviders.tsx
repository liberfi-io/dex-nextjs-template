"use client";

import { PropsWithChildren, useMemo } from "react";
import Cookies from "js-cookie";
import { ChainStreamClient } from "@chainstream-io/sdk";
import { DexClientProvider } from "@liberfi/react-dex";
import { PinataProvider, useDexTokenProvider } from "@liberfi/ui-base";
import { pinata } from "../libs/pinata";
import { Client } from "@liberfi.io/client";
import { DexClientProvider as APIClientProvider } from "@liberfi.io/react";
import { MediaTrackClient } from "@liberfi.io/ui-media-track/client";
import { MediaTrackProvider } from "@liberfi.io/ui-media-track";
import { useAuth, useWallets } from "@liberfi.io/wallet-connector";
import { ChannelsClient } from "@liberfi.io/ui-channels/client";
import { ChannelsProvider } from "@liberfi.io/ui-channels";
import { PinataProvider as PinataProviderBase } from "@liberfi.io/ui";
import { PredictProvider } from "@liberfi.io/ui-predict";
import { PredictClient } from "@liberfi.io/ui-predict/client";
import { PortfolioClientProvider, PortfolioProvider } from "@liberfi.io/ui-portfolio";
import { PortfolioClient } from "@liberfi.io/ui-portfolio/client";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";

const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

export function ServiceClientProviders({ children }: PropsWithChildren) {
  return (
    <DexClientLoader>
      <PinataProvider client={pinata}>
        <PinataProviderBase client={pinata}>{children}</PinataProviderBase>
      </PinataProvider>
    </DexClientLoader>
  );
}

function DexClientLoader({ children }: PropsWithChildren) {
  const loader = useMemo(
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

  const dexTokenProvider = useDexTokenProvider(loader);

  const dexClient = useMemo(
    () =>
      new ChainStreamClient(dexTokenProvider, {
        serverUrl: baseUrl + process.env.NEXT_PUBLIC_DEX_AGGREGATOR_URL,
      }),
    [dexTokenProvider],
  );

  const apiClient = useMemo(
    () =>
      new Client(dexTokenProvider, {
        serverUrl: baseUrl + process.env.NEXT_PUBLIC_DEX_AGGREGATOR_URL,
      }),
    [dexTokenProvider],
  );

  const mediaTrackClient = useMemo(
    () =>
      new MediaTrackClient({
        endpoint: baseUrl + process.env.NEXT_PUBLIC_MEDIA_TRACK_URL,
        streamEndpoint: process.env.NEXT_PUBLIC_MEDIA_TRACK_STREAM_URL,
        accessToken: dexTokenProvider,
      }),
    [dexTokenProvider],
  );

  const { user } = useAuth();

  const channelsTokenProvider = useMemo(
    () => ({ getToken: async () => Promise.resolve(user?.accessToken) }),
    [user],
  );

  const channelsClient = useMemo(
    () =>
      new ChannelsClient({
        endpoint: baseUrl + process.env.NEXT_PUBLIC_CHANNELS_URL,
        accessToken: channelsTokenProvider,
      }),
    [channelsTokenProvider],
  );

  const predictClient = useMemo(
    () =>
      new PredictClient(baseUrl + process.env.NEXT_PUBLIC_PREDICT_URL),
    [],
  );

  const portfolioClient = useMemo(
    () =>
      new PortfolioClient(baseUrl + process.env.NEXT_PUBLIC_DEX_AGGREGATOR_URL),
    [],
  );

  const { chain } = useCurrentChain()
  const wallets = useWallets()
  const wallet = wallets.find((w) => w.chain === chain && w.isConnected)

  return (
    <DexClientProvider client={dexClient}>
      <APIClientProvider client={apiClient} subscribeClient={apiClient}>
        <MediaTrackProvider client={mediaTrackClient}>
          <ChannelsProvider client={channelsClient}>
            <PredictProvider client={predictClient}>
              <PortfolioClientProvider client={portfolioClient}>
                <PortfolioProvider chain={chain} address={wallet?.address ?? ""}>
                  {children}
                </PortfolioProvider>
              </PortfolioClientProvider>
            </PredictProvider>
          </ChannelsProvider>
        </MediaTrackProvider>
      </APIClientProvider>
    </DexClientProvider>
  );
}
