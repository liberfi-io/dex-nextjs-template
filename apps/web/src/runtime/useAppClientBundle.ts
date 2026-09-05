import { useMemo } from "react";
import { CoreAppClientBundle, RuntimeConfig } from "./app-runtime.types";
import {
  createAppClients,
  createCapabilityBundle,
  createDexClients,
  createMediaTrackClient,
  DexTokenProvider,
} from "./createAppClients";

export interface UseAppClientBundleInput {
  config: RuntimeConfig;
  dexTokenProvider: DexTokenProvider;
}

export function useAppClientBundle({
  config,
  dexTokenProvider,
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
  const capabilities = useMemo(() => createCapabilityBundle(dex.api), [dex.api]);
  return useMemo(
    () =>
      createAppClients(
        {
          ...dex,
          mediaTrack,
        },
        capabilities,
      ),
    [capabilities, dex, mediaTrack],
  );
}
