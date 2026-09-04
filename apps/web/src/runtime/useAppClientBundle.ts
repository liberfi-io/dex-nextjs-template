import { useMemo } from "react";
import { CoreAppClientBundle, RuntimeConfig } from "./app-runtime.types";
import {
  ChannelsTokenProvider,
  createAppClients,
  createCapabilityBundle,
  createChannelsClient,
  createDexClients,
  createMediaTrackClient,
  DexTokenProvider,
} from "./createAppClients";

export interface UseAppClientBundleInput {
  config: RuntimeConfig;
  dexTokenProvider: DexTokenProvider;
  channelsTokenProvider: ChannelsTokenProvider;
}

export function useAppClientBundle({
  config,
  dexTokenProvider,
  channelsTokenProvider,
}: UseAppClientBundleInput): CoreAppClientBundle {
  const dex = useMemo(
    () => createDexClients({ dexAggregatorUrl: config.dexAggregatorUrl }, dexTokenProvider),
    [config.dexAggregatorUrl, dexTokenProvider],
  );
  const mediaTrack = useMemo(
    () =>
      createMediaTrackClient(
        {
          mediaTrackStreamUrl: config.mediaTrackStreamUrl,
          mediaTrackUrl: config.mediaTrackUrl,
        },
        dexTokenProvider,
      ),
    [config.mediaTrackStreamUrl, config.mediaTrackUrl, dexTokenProvider],
  );
  const capabilities = useMemo(
    () => createCapabilityBundle(dex.api),
    [dex.api],
  );
  const channels = useMemo(
    () => createChannelsClient({ channelsUrl: config.channelsUrl }, channelsTokenProvider),
    [channelsTokenProvider, config.channelsUrl],
  );
  return useMemo(
    () =>
      createAppClients(
        {
          ...dex,
          mediaTrack,
          channels,
        },
        capabilities,
      ),
    [capabilities, channels, dex, mediaTrack],
  );
}
