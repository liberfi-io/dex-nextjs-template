import { useMemo } from "react";
import { AppClientBundle, RuntimeConfig } from "./app-runtime.types";
import {
  ChannelsTokenProvider,
  createAppClients,
  createCapabilityBundle,
  createChannelsClient,
  createDexClients,
  createMediaTrackClient,
  createPerpetualsClients,
  createPortfolioClient,
  createPredictClients,
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
}: UseAppClientBundleInput): AppClientBundle {
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
  const predict = useMemo(
    () =>
      createPredictClients({
        predictUrl: config.predictUrl,
        predictWsEnabled: config.predictWsEnabled,
        predictWsUrl: config.predictWsUrl,
      }),
    [config.predictUrl, config.predictWsEnabled, config.predictWsUrl],
  );
  const portfolio = useMemo(
    () => createPortfolioClient({ dexAggregatorUrl: config.dexAggregatorUrl }),
    [config.dexAggregatorUrl],
  );
  const perpetuals = useMemo(
    () =>
      createPerpetualsClients({
        perpetualsApiUrl: config.perpetualsApiUrl,
        perpetualsEnvironment: config.perpetualsEnvironment,
      }),
    [config.perpetualsApiUrl, config.perpetualsEnvironment],
  );

  return useMemo(
    () =>
      createAppClients(
        {
          ...dex,
          mediaTrack,
          channels,
          ...predict,
          portfolio,
          ...perpetuals,
        },
        capabilities,
      ),
    [capabilities, channels, dex, mediaTrack, perpetuals, portfolio, predict],
  );
}
