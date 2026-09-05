"use client";

import { useMemo, type PropsWithChildren } from "react";
import { ChannelsProvider } from "@liberfi.io/ui-channels";
import { useAuth } from "@liberfi.io/wallet-connector";
import { createChannelsClient } from "./createAppClients";
import { useAppRuntimeConfig } from "./AppRuntimeProviders";

export function ChannelsRuntimeProviders({ children }: PropsWithChildren) {
  const config = useAppRuntimeConfig();
  const { user } = useAuth();
  const accessToken = user?.accessToken ?? null;
  const tokenProvider = useMemo(() => ({ getToken: async () => accessToken }), [accessToken]);
  const client = useMemo(
    () => createChannelsClient({ channelsUrl: config.channelsUrl }, tokenProvider),
    [config.channelsUrl, tokenProvider],
  );

  return <ChannelsProvider client={client}>{children}</ChannelsProvider>;
}
